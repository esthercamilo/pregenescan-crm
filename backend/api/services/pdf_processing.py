import pymupdf as fitz
from typing import List


def extract_text_from_pdf(path: str) -> str:
    doc = fitz.open(path)
    parts = []
    for page in doc:
        text = page.get_text()
        if text:
            parts.append(text)
    return "\n".join(parts)


# Alternativa com pdfminer.six pode ser adicionada dependendo do PDF