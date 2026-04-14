import logging
import re
from functools import lru_cache
from pathlib import Path

logger = logging.getLogger(__name__)

# Aviation / tech compound terms treated as single tokens during preprocessing.
# Extend this list as needed.
DOMAIN_TERMS: list[str] = [
    "boeing 737", "boeing 777", "boeing 787", "airbus a320", "airbus a380",
    "type rating", "instrument rating", "commercial pilot license", "atpl",
    "air traffic control", "crew resource management",
    "fastapi", "spring boot", "react native", "machine learning",
    "deep learning", "natural language processing",
]

_TERM_PLACEHOLDERS: list[tuple[str, str]] = [
    (term, term.replace(" ", "_")) for term in DOMAIN_TERMS
]


@lru_cache(maxsize=1)
def _get_nlp():
    import spacy

    try:
        return spacy.load("en_core_web_sm")
    except OSError:
        logger.warning("spaCy model 'en_core_web_sm' not found — run: python -m spacy download en_core_web_sm")
        raise


def preprocess(text: str) -> str:
    # 1. Lowercase
    text = text.lower()

    # 2. Protect domain compound terms with placeholder tokens
    for term, placeholder in _TERM_PLACEHOLDERS:
        text = text.replace(term, placeholder)

    # 3. spaCy: stop-word removal + lemmatization
    nlp = _get_nlp()
    doc = nlp(text)
    tokens = [
        token.lemma_
        for token in doc
        if not token.is_stop and not token.is_punct and token.lemma_.strip()
    ]
    result = " ".join(tokens)

    # 4. Restore domain placeholders back to readable form
    for term, placeholder in _TERM_PLACEHOLDERS:
        result = result.replace(placeholder, term.replace(" ", "_"))

    return result
