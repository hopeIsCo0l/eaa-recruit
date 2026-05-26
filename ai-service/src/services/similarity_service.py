"""
CV-to-job-description relevance scoring.

Primary: Ollama LLM (real language understanding)
Fallback: SBERT cosine similarity (if Ollama unavailable)
"""
import logging
from typing import List

import numpy as np

from src.config import settings
from src.services.embedding_service import embed

logger = logging.getLogger(__name__)


def _cosine(a: List[float], b: List[float]) -> float:
    va = np.array(a, dtype=np.float32)
    vb = np.array(b, dtype=np.float32)
    norm_a = np.linalg.norm(va)
    norm_b = np.linalg.norm(vb)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(va, vb) / (norm_a * norm_b))


def _sbert_score(cv_text: str, job_description: str) -> float:
    """SBERT cosine similarity fallback. Returns 0-100."""
    cv_vec = embed(cv_text)
    jd_vec = embed(job_description)
    cosine = _cosine(cv_vec, jd_vec)
    scaled = (cosine + 1) / 2 * 100
    return round(scaled, 2)


def score_cv_against_job(cv_text: str, job_description: str) -> float:
    """
    Return a relevance score in [0.0, 100.0].

    Uses Ollama LLM when available, falls back to SBERT cosine similarity.
    """
    if settings.ollama_enabled:
        try:
            from src.services.ollama_scoring import score_cv
            result = score_cv(cv_text, job_description)
            if result is not None:
                score_unit, reasoning = result
                score_100 = round(score_unit * 100, 2)
                logger.info("CV scored via Ollama LLM: %.2f/100", score_100)
                return score_100
            logger.warning("Ollama scoring returned None — falling back to SBERT")
        except Exception as ex:
            logger.warning("Ollama scoring failed (%s) — falling back to SBERT", ex)

    score = _sbert_score(cv_text, job_description)
    logger.info("CV scored via SBERT fallback: %.2f/100", score)
    return score
