import requests
import pandas as pd
from io import StringIO

def f():
    start = 1
    headers = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://omim.org/",
        "Connection": "keep-alive",
    }
    while True:
        url = f"https://www.omim.org/search?index=geneMap&sort=chromosome_number+asc%2C+chromosome_sort+asc&start={start}&limit=200&chromosome=1&chromosome=2&chromosome=3&chromosome=4&chromosome=5&chromosome=6&chromosome=7&chromosome=8&chromosome=9&chromosome=10&chromosome=11&chromosome=12&chromosome=13&chromosome=14&chromosome=15&chromosome=16&chromosome=17&chromosome=18&chromosome=19&chromosome=20&chromosome=21&chromosome=22&chromosome=X&chromosome=Y&chromosome_group=A&phenotype_exists=true&format=tsv"
        response = requests.get(url, headers=headers)
        text = response.text
        with open(f'/home/esther/GitBare/api_pregenescan/backend/api/services/omim/texts/{start}.txt', 'w') as f:
            f.write(text)
        start+=1

def g():
    base_dir = "/home/esther/GitBare/api_pregenescan/backend/api/services/omim/texts"
    dfs = []

    for i in range(1, 33):  # 1 a 32 inclusive
        path = f"{base_dir}/{i}.txt"
        with open(path, "r") as f:
            text = f.read().strip()

        # Divide o arquivo em blocos (duas quebras de linha)
        data = text.split("\n\n")

        if len(data) > 1:
            tsv_text = data[1].strip()

            # Lê a tabela TSV
            df = pd.read_csv(StringIO(tsv_text), sep="\t", dtype=str)

            # Remove espaços extras nas extremidades de cada célula
            df = df.apply(lambda col: col.str.strip() if col.dtype == "object" else col)

            dfs.append(df)

    # Concatena todos os DataFrames
    df_final = pd.concat(dfs, ignore_index=True)

    # Remove apenas linhas completamente idênticas (todas as colunas iguais)
    df_final = df_final.drop_duplicates(keep="first")

    output_path = f"{base_dir}/merged_omim.tsv"
    df_final.to_csv(output_path, sep="\t", index=False)

    print(f"✅ Arquivo salvo em: {output_path}")
    print(f"Total de linhas finais: {len(df_final)}")

    return df_final

def h():
    # Nunca usar para dados sensíveis
    from deep_translator import GoogleTranslator
    r = GoogleTranslator(source='pt', target='en').translate("Susceptibilidade à anorexia nervosa")
    print(r)

h()