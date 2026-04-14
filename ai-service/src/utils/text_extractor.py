import logging
import re
import unicodedata
from pathlib import Path

logger = logging.getLogger(__name__)


def _normalize(text: str) -> str:
    # Normalize unicode, strip non-printable chars, collapse whitespace
    text = unicodedata.normalize("NFKD", text)
    text = re.sub(r"[^\x20-\x7E\n]", " ", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_text(file_path: str) -> str:
    path = Path(file_path)
    suffix = path.suffix.lower()

    if suffix == ".pdf":
        return _extract_pdf(path)
    elif suffix in (".docx", ".doc"):
        return _extract_docx(path)
    else:
        raise ValueError(f"Unsupported file type: {suffix}")


def _extract_pdf(path: Path) -> str:
    import fitz  # PyMuPDF

    doc = fitz.open(str(path))
    pages = [page.get_text() for page in doc]
    doc.close()
    return _normalize("\n".join(pages))


def _extract_docx(path: Path) -> str:
    from docx import Document

    doc = Document(str(path))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return _normalize("\n".join(paragraphs))
