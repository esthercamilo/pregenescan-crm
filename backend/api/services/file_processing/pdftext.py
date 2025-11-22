import fitz  # Importa PyMuPDF


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extrai o texto de todas as páginas de um arquivo PDF.

    Args:
        pdf_path: O caminho completo para o arquivo PDF.

    Returns:
        Uma string contendo todo o texto extraído do PDF,
        com quebras de linha entre as páginas.
    """
    full_text = []

    try:
        # Abre o documento PDF
        documento = fitz.open(pdf_path)

        # Itera sobre cada página do documento
        for page_num in range(documento.page_count):
            page = documento.load_page(page_num)

            # Extrai o texto da página usando o método de texto padrão (mais limpo)
            text_on_page = page.get_text("text")

            # Adiciona o texto da página à lista
            full_text.append(text_on_page)

        # Fecha o documento
        documento.close()

        # Junta todas as páginas em uma string única
        return "\n--- Página Quebrada ---\n".join(full_text)

    except fitz.FileNotFoundError:
        return f"Erro: Arquivo não encontrado no caminho: {pdf_path}"
    except Exception as e:
        return f"Ocorreu um erro durante a extração do texto: {e}"

# --- Exemplo de Uso ---
# Substitua pelo caminho do seu arquivo de teste
# file_path = "/caminho/para/seu/arquivo.pdf"
# extracted_content = extract_text_from_pdf(file_path)
# print(extracted_content)