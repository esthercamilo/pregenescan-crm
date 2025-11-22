# predictor/utils.py
import pickle
import threading
from functools import lru_cache

import pandas
import pandas as pd
import cobra
import os

from cobra import io
from cobra.flux_analysis import single_gene_deletion
from collections import defaultdict

from core.settings import BASE_DIR
from sqlalchemy import create_engine

_model_lock = threading.Lock()
_model_instance = None
_genes_dictionary = None

PROMISCUOUS_METS = {
    "h2o[c]", "h2o[m]", "h[c]", "h[m]", "o2[c]", "o2[m]",
    "atp[c]", "adp[c]", "amp[c]", "pi[c]", "nad[c]", "nadh[c]",
    "nadp[c]", "nadph[c]", "fadh2[c]", "gdp[c]", "gtp[c]",
    "udp[c]", "utp[c]", "ctp[c]", "itp[c]", "co2[c]", "co2[m]",
    "h2o2[c]", "h2o2[m]", "h2o2[e]", "h2o2[p]", "nadp[m]", "nadph[m]"
}


def load_genes():
    global _genes_dictionary
    if _genes_dictionary is None:
        df = pandas.read_csv(f"{BASE_DIR}/api/services/metabolic_analysis/genes.tsv", sep="\t")
        df = df.set_index(df.columns[0])
        _genes_dictionary = (df[['geneSymbols', 'geneNames', 'compartments']]
                             .to_dict(orient='index'))
    return _genes_dictionary

def load_model():
    """
    Carrega o modelo Recon3D (humano) para COBRApy.
    Prefere pickle para carregamento instantâneo; fallback JSON/XML.
    Singleton.
    """
    global _model_instance

    if _model_instance is None:

        with _model_lock:
            if _model_instance is None:
                pickle_path = os.path.join(BASE_DIR, "api/services/data/Human-GEM.pkl")

                print("Carregando modelo do pickle (rápido)")
                with open(pickle_path, "rb") as f:
                        model = pickle.load(f)

                _model_instance = model

    return _model_instance

def load_disease_map(genelist):
    engine = create_engine(
        "postgresql+psycopg2://postgres:pregene18102025@3.20.216.70:5432/pregenescandb"
    )

    # Muita coisa pra carregar, melhorar
    gl = str(tuple(genelist))
    gl = gl.replace(',)', ')')
    genes_metab = pd.read_sql(f"SELECT \"geneSymbols\" FROM pgs.genes_metab where genes in {gl}", engine)
    idlist = str(tuple(genes_metab['geneSymbols'].values))
    idlist = idlist.replace(',)', ')')
    genes2phen = pd.read_sql(f"SELECT gene_symbol, hpo_name FROM pgs.genes2phen where gene_symbol in {idlist}", engine)
    df = genes2phen.drop_duplicates()
    genes_dict = (
        df.groupby("gene_symbol")["hpo_name"]
        .apply(lambda x: sorted(x.unique()))  # remove duplicados e ordena
        .to_dict()
    )
    return genes_dict

    # """CSV simples com colunas: gene_id,disease (pode ter múltiplas linhas por gene)."""
    # try:
    #     df = pd.read_csv(path, dtype=str)
    # except FileNotFoundError:
    #     # exemplo mínimo: mapeamento vazio
    #     df = pd.DataFrame(columns=["gene_id","disease"])
    # return df

def get_gene(model, gene_id):
    try:
        return model.genes.get_by_id(gene_id)
    except KeyError:
        return None

def neighbors_by_metabolites(gene_obj):
    """
    Retorna os genes vizinhos de um gene, mapeando metabólitos compartilhados.
    Saída:
        shared_map: {gene_id: set(metabolite_id, ...)}
        gene_mets: {gene_id: list(metabolite_id, ...)}
    """
    shared_map = {}
    for rxn in gene_obj.reactions:
        for met in rxn.metabolites:
            for neighbor_rxn in met.reactions:
                for neighbor_gene in neighbor_rxn.genes:
                    if neighbor_gene.id == gene_obj.id or met.id in PROMISCUOUS_METS:
                        continue
                    shared_map.setdefault(neighbor_gene.id, set()).add((met.id, rxn.subsystem, rxn.name))

    gene_mets = {g: list(mets) for g, mets in shared_map.items()}
    return shared_map, gene_mets

def compute_topological_score(shared_mets, gene_mets, neighbor_gene_mets_count):
    """
    Score topológico simples: |shared| / |union| ou / |gene_mets|
    Pode ser refinado; retornamos valor em [0,1].
    """
    shared_count = len(shared_mets)
    denom = max(1, len(gene_mets))  # se gene_mets for zero (improvável), evita divisão por zero
    return shared_count / denom

def compute_flux_effects(model, target_gene_id, neighbor_gene_ids):
    """
    Faz deleção do gene alvo e mede impacto no biomass (flux de crescimento).
    Retorna:
      - base_biomass: biomass antes de knockout
      - biomass_after_target_ko: biomass after KO target
      - for optional: podemos também calcular single deletions por vizinho (custo computacional).
    Observação: para modelos grandes, single_gene_deletion em lote é recomendado.
    """
    # obtenha id da biomass objective reaction (padrão 'BIOMASS' varia com modelo)
    # vamos usar o valor de objective_value do modelo atual
    with model:
        base_solution = model.optimize()
        base_biomass = float(base_solution.objective_value or 0.0)

    # deleção do target
    # single_gene_deletion aceita lista de genes
    res_target = single_gene_deletion(model, [target_gene_id], processes=1)
    # single_gene_deletion devolve DataFrame com coluna 'growth' (nome pode variar)
    # verifique colunas
    biomass_after = None
    if 'growth' in res_target.columns:
        biomass_after = float(res_target.loc[target_gene_id, 'growth'])
    elif 'growth_rate' in res_target.columns:
        biomass_after = float(res_target.loc[target_gene_id, 'growth_rate'])
    else:
        # fallback: usar optimize with context (mais lento)
        with model:
            g = model.genes.get_by_id(target_gene_id)
            g.knock_out()
            sol = model.optimize()
            biomass_after = float(sol.objective_value or 0.0)

    # para vizinhos poderíamos calcular importância, mas aqui retornamos só efeito do alvo
    return {
        "base_biomass": base_biomass,
        "biomass_after_target_ko": biomass_after,
        "relative_drop": (base_biomass - biomass_after) / (base_biomass + 1e-12)
    }

def filter_promiscuous_metabolites(shared_map):
    """
    Remove metabólitos muito comuns da análise.
    """
    filtered = {}
    for gene, mets in shared_map.items():
        filtered_mets = set(m for m in mets if m[0].lower() not in PROMISCUOUS_METS)
        if filtered_mets:
            filtered[gene] = filtered_mets
    return filtered

def score_neighbors_exclusive(model, shared_map):
    """
    Calcula score de vizinhos com base na exclusividade dos metabólitos compartilhados.
    """
    # remover metabólitos promíscuos
    shared_map = filter_promiscuous_metabolites(shared_map)

    scores = {}
    for neighbor_gene, mets in shared_map.items():
        score = 0.0
        for met_id, desc, reaction in mets:
            met = model.metabolites.get_by_id(met_id)
            producing_genes = set()
            for rxn in met.reactions:
                producing_genes.update(g.id for g in rxn.genes)
            if producing_genes:
                score += 1 / len(producing_genes)  # exclusividade
        scores[neighbor_gene] = score
    return scores

def predict_diseases_for_genes(disease_df, gene_list):
    """
    disease_df tem colunas: gene_id, disease
    Retorna dict gene_id -> list(diseases)
    """
    mapping = defaultdict(list)
    if disease_df is None or disease_df.empty:
        return mapping
    for _, row in disease_df.iterrows():
        g = str(row['gene_id']).strip()
        d = str(row['disease']).strip()
        mapping[g].append(d)
    # filtrar só pelos gene_list
    out = {g: mapping.get(g, []) for g in gene_list}
    return out

def neighbors(gene_id, top_n=3):

    genes = load_genes()
    model = load_model()
    gene_obj = get_gene(model, gene_id)
    if gene_obj is None:
        return ''

    # neighbors
    shared_map, gene_mets = neighbors_by_metabolites(gene_obj)
    scores = score_neighbors_exclusive(model, shared_map)

    top = dict(sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_n])
    # load disease map (pode ser cacheado)
    gene_list = list(top.keys())
    disease_map_main_gene = load_disease_map([gene_id])  # Incluir o gene de entrada no dicionário
    disease_map_neighbors = load_disease_map(gene_list)  # Incluir o gene de entrada no dicionário

    neighbors_out = []
    for neigh_id, sc in sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_n]:
        info =  genes.get(neigh_id)
        neighbors_out.append({
            "gene_id": neigh_id,
            "gene_info": info,
            "exclusive_score": sc,
            "diseases": disease_map_neighbors.get(info.get('geneSymbols'), [])
        })

    info_main = genes.get(gene_id)
    result = {
        "gene_id": gene_id,
        "gene_info": genes.get(gene_id),
        "diseases": disease_map_main_gene.get(info_main.get('geneSymbols'), []),
        "neighbors": neighbors_out
    }

    return result