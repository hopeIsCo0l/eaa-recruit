import logging
import os
from dataclasses import dataclass, field
from typing import List, Optional

import numpy as np

from src.services.answer_key_service import get_answer_key_embedding
from src.services.embedding_service import embed
from src.services.keyword_checker import KeywordCheckResult, check_keywords, apply_keyword_penalty

logger = logging.getLogger(__name__)

THRESHOLD_FULL = float(os.getenv("SCORE_THRESHOLD_FULL", "0.85"))
THRESHOLD_PARTIAL = float(os.getenv("SCORE_THRESHOLD_PARTIAL", "0.65"))


@dataclass
class AnswerScore:
    question_id: str
    raw_similarity: float
    awarded_marks: float
    max_marks: float
    keyword_result: Optional[KeywordCheckResult] = field(default=None)


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
    required_keywords: Optional[List[str]] = None,
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

    # Apply keyword penalty if keywords defined
    kw_result = None
    if required_keywords:
        kw_result = check_keywords(candidate_answer, required_keywords)
        awarded = apply_keyword_penalty(awarded, kw_result, max_marks)

    logger.info(
        "Scored answer question_id=%s similarity=%.4f awarded=%.2f/%.2f keywords_missing=%s",
        question_id, similarity, awarded, max_marks,
        kw_result.missing if kw_result else [],
    )
    return AnswerScore(
        question_id=question_id,
        raw_similarity=round(similarity, 4),
        awarded_marks=awarded,
        max_marks=max_marks,
        keyword_result=kw_result,
    )
