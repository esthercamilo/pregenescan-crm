import PyPDF2
import re
import os

def extract_emails_from_pdf(pdf_path):
    """
    Extrai endereços de e-mail de um arquivo PDF.

    Args:
        pdf_path (str): O caminho para o arquivo PDF.

    Returns:
        set: Um conjunto de endereços de e-mail únicos encontrados no PDF.
              Retorna um conjunto vazio se nenhum e-mail for encontrado ou se houver um erro.
    """
    if not os.path.exists(pdf_path):
        print(f"Erro: O arquivo '{pdf_path}' não foi encontrado.")
        return set()

    emails = set()
    # Expressão regular para e-mails (pode ser ajustada para maior precisão, se necessário)
    # Este padrão cobre a maioria dos formatos comuns: user@domain.com
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'

    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            num_pages = len(reader.pages)

            print(f"Analisando o PDF: {pdf_path}")
            print(f"Total de páginas: {num_pages}")

            for page_num in range(num_pages):
                page = reader.pages[page_num]
                text = page.extract_text()
                if text:
                    found_emails = re.findall(email_pattern, text)
                    for email in found_emails:
                        emails.add(email)
                        print(f"  Encontrado na página {page_num + 1}: {email}")
                else:
                    print(f"  Página {page_num + 1} não contém texto extraível.")

    except PyPDF2.errors.PdfReadError:
        print(f"Erro: Não foi possível ler o arquivo PDF. Pode estar corrompido ou protegido por senha.")
        return set()
    except Exception as e:
        print(f"Ocorreu um erro inesperado: {e}")
        return set()

    return emails

def extract_data_from_pdf(f):
    from django.http import JsonResponse
    from django.views.decorators.csrf import csrf_exempt
    from django.views.decorators.http import require_http_methods
    from PIL import Image
    import pytesseract
    import io
    import json
    import os
    import openai  # Ou a biblioteca do seu LLM



if __name__ == "__main__":

    root = '/home/esther/GitBare/api_pregenescan/backend/api/services/data'
    files = os.listdir(root)

    for f in files:
        pdf_file = os.path.join(root, f)
        extracted_emails = extract_emails_from_pdf(pdf_file)
        if extracted_emails:
            print("\n--- E-mails Únicos Encontrados ---")
            for email in sorted(list(extracted_emails)):
                print(email)
        else:
            print("\nNenhum e-mail foi encontrado ou ocorreu um erro durante a extração.")
        print("\n--- Extração Concluída ---")