import logging
import os
from dataclasses import dataclass
from typing import List

import numpy as np

from src.services.answer_key_service import get_answer_key_embedding
from src.services.embedding_service import embed

logger = logging.getLogger(__name__)

THRESHOLD_FULL = float(os.getenv("SCORE_THRESHOLD_FULL", "0.85"))
THRESHOLD_PARTIAL = float(os.getenv("SCORE_THRESHOLD_PARTIAL", "0.65"))


@dataclass
class AnswerScore:
    question_id: str
    raw_similarity: float
    awarded_marks: float
    max_marks: float


def _cosine(a: List[float], b: List[float]) -> float:
    va, vb = np.array(a, dtype=np.float32), np.array(b, dtype=np.float32)
    n_a, n_b = np.linalg.norm(va), np.linalg.norm(vb)
    if n_a == 0 or n_b == 0:
        return 0.0
    return float(np.dot(va, vb) / (n_a * n_b))


def score_answer(
    question_id: str,
    ideal_answer: str,
    candidate_answer: str,
    max_marks: float,
) -> AnswerScore:
    ideal_vec = get_answer_key_embedding(question_id, ideal_answer)
    candidate_vec = embed(candidate_answer)
    similarity = _cosine(ideal_vec, candidate_vec)

    if similarity >= THRESHOLD_FULL:
        awarded = max_marks
    elif similarity >= THRESHOLD_PARTIAL:
        # Linear interpolation between partial and full threshold
        ratio = (similarity - THRESHOLD_PARTIAL) / (THRESHOLD_FULL - THRESHOLD_PARTIAL)
        awarded = round(max_marks * (0.5 + 0.5 * ratio), 2)
    else:
        awarded = 0.0

    logger.info(
        "Scored answer question_id=%s similarity=%.4f awarded=%.2f/%.2f",
        question_id, similarity, awarded, max_marks,
    )
    return AnswerScore(
        question_id=question_id,
        raw_similarity=round(similarity, 4),
        awarded_marks=awarded,
        max_marks=max_marks,
    )
