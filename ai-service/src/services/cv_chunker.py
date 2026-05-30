"""
Text chunking for CV and JD semantic embedding.

CV  → sentence-level chunks (meaningful phrases, filtered for length)
JD  → requirement-level chunks (each sentence = one requirement unit)

Uses spaCy sentence segmentation (already in requirements).
"""
from __future__ import annotations

import logging
from typing import List

logger = logging.getLogger(__name__)

_MIN_WORDS = 6
_MAX_CV_CHUNKS = 20
_MAX_JD_CHUNKS = 25

_nlp = None


def _get_nlp():
    global _nlp
    if _nlp is None:
        import spacy
        try:
            _nlp = spacy.load("en_core_web_sm")
        except OSError:
            # Fallback: blank English model with sentencizer
            import spacy
            _nlp = spacy.blank("en")
            _nlp.add_pipe("sentencizer")
    return _nlp


def _sentencize(text: str) -> List[str]:
    nlp = _get_nlp()
    doc = nlp(text[:50_000])  # cap to avoid memory issues on huge docs
    return [sent.text.strip() for sent in doc.sents]


def _filter(sentences: List[str], max_chunks: int) -> List[str]:
    kept = [s for s in sentences if len(s.split()) >= _MIN_WORDS and len(s) > 20]
    return kept[:max_chunks]


def chunk_cv(text: str) -> List[str]:
    """Split CV text into sentence-level chunks suitable for embedding."""
    sentences = _sentencize(text)
    chunks = _filter(sentences, _MAX_CV_CHUNKS)
    logger.debug("CV chunked into %d chunks (raw sentences=%d)", len(chunks), len(sentences))
    return chunks


def chunk_jd(text: str) -> List[str]:
    """Split JD text into requirement-level sentence chunks."""
    sentences = _sentencize(text)
    chunks = _filter(sentences, _MAX_JD_CHUNKS)
    logger.debug("JD chunked into %d chunks (raw sentences=%d)", len(chunks), len(sentences))
    return chunks
