import json

import pandas as pd
from sqlalchemy import create_engine

def safe_jsonify(x):
    """Converte listas/dicts em JSON, deixa os outros valores como estão"""
    if isinstance(x, (dict, list)):
        return json.dumps(x, ensure_ascii=False)
    return x

def transfer_gene2phen():
    # Caminho do arquivo TSV
    tsv_path = "/home/esther/GitBare/api_pregenescan/api/services/data/genes_to_phenotype.txt"

    # Lê a tabela TSV
    df = pd.read_csv(tsv_path, sep="\t")

    # Cria a conexão com o banco PostgreSQL
    # Substitua pelos seus parâmetros reais
    engine = create_engine(
        "postgresql+psycopg2://postgres:pregene18102025@3.20.216.70:5432/pregenescandb"
    )

    # Nome da tabela e schema
    table_name = "genes2phen"
    schema_name = "pgs"

    # Sobe a tabela para o schema especificado
    df.to_sql(
        table_name,
        con=engine,
        schema=schema_name,
        if_exists="replace",  # ou "append" se quiser adicionar sem apagar
        index=False
    )

    print(f"Tabela '{schema_name}.{table_name}' carregada com sucesso!")

def genes():
    path = "/home/esther/GitBare/api_pregenescan/api/services/decypher/genes.json"
    with open(path) as f:
        data = json.load(f)

    df = pd.json_normalize(data['content']['genes'])

    for col in df.columns:
        df[col] = df[col].apply(safe_jsonify)

    # Nome da tabela e schema
    table_name = "genes"
    schema_name = "pgs"

    # Substitua pelos seus parâmetros reais
    engine = create_engine(
        "postgresql+psycopg2://postgres:pregene18102025@3.20.216.70:5432/pregenescandb"
    )

    # Sobe a tabela para o schema especificado
    df.to_sql(
        table_name,
        con=engine,
        schema=schema_name,
        if_exists="replace",  # ou "append" se quiser adicionar sem apagar
        index=False
    )

    print(f"Tabela '{schema_name}.{table_name}' carregada com sucesso!")

def decipher():
    # path = "/home/esther/GitBare/api_pregenescan/api/services/decypher/0000818.json"
    # path = "/home/esther/GitBare/api_pregenescan/api/services/decypher/0001626.json"
    path = "/home/esther/GitBare/api_pregenescan/api/services/decypher/1871.json"
    with open(path) as f:
        data = json.load(f)
    patients_dict = data["content"]["Patients"]

    # Transforma o dicionário em lista
    patients_list = list(patients_dict.values())

    # Cria DataFrame de pacientes
    patients = pd.json_normalize(patients_list)

    phenotypes = (
        patients[["patient_id", "Phenotypes"]]
        .explode("Phenotypes")  # 1 linha por fenótipo
        .dropna(subset=["Phenotypes"])
    )

    # AGORA: expandir o dicionário Phenotypes para colunas separadas
    phenotypes = pd.concat(
        [phenotypes["patient_id"], phenotypes["Phenotypes"].apply(pd.Series)],
        axis=1
    )

    for col in phenotypes.columns:
        phenotypes[col] = phenotypes[col].apply(safe_jsonify)

    for col in patients.columns:
        patients[col] = patients[col].apply(safe_jsonify)

    engine = create_engine(
        "postgresql+psycopg2://postgres:pregene18102025@3.20.216.70:5432/pregenescandb"
    )
    # Sobe as tabelas
    patients.to_sql("decipher_patients", con=engine, schema="pgs", if_exists="replace", index=False)
    phenotypes.to_sql("decipher_phenotypes", con=engine, schema="pgs", if_exists="replace", index=False)

def genes_metab():
    tsv_path = "/home/esther/GitBare/api_pregenescan/api/services/metabolic_analysis/genes.tsv"
    df = pd.read_csv(tsv_path, sep="\t")

    # Cria a conexão com o banco PostgreSQL
    # Substitua pelos seus parâmetros reais
    engine = create_engine(
        "postgresql+psycopg2://postgres:pregene18102025@3.20.216.70:5432/pregenescandb"
    )

    # Nome da tabela e schema
    table_name = "genes_metab"
    schema_name = "pgs"

    # Sobe a tabela para o schema especificado
    df.to_sql(
        table_name,
        con=engine,
        schema=schema_name,
        if_exists="replace",  # ou "append" se quiser adicionar sem apagar
        index=False
    )

    print(f"Tabela '{schema_name}.{table_name}' carregada com sucesso!")

