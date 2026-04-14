import logging
from typing import List

import numpy as np

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


def score_cv_against_job(cv_text: str, job_description: str) -> float:
    """Return a relevance score in [0.0, 100.0] (2 d.p.)."""
    cv_vec = embed(cv_text)
    jd_vec = embed(job_description)
    cosine = _cosine(cv_vec, jd_vec)
    # Scale from [-1, 1] → [0, 100]
    scaled = (cosine + 1) / 2 * 100
    return round(scaled, 2)
