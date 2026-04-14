import logging
import os
from dataclasses import dataclass, field
from typing import List

logger = logging.getLogger(__name__)

PENALTY_PER_MISSING = float(os.getenv("KEYWORD_PENALTY_PERCENT", "5.0"))


@dataclass
class KeywordCheckResult:
    present: List[str]
    missing: List[str]
    penalty_applied: float


def check_keywords(
    candidate_answer: str,
    required_keywords: List[str],
) -> KeywordCheckResult:
    lowered = candidate_answer.lower()
    present = [kw for kw in required_keywords if kw.lower() in lowered]
    missing = [kw for kw in required_keywords if kw.lower() not in lowered]
    penalty = len(missing) * PENALTY_PER_MISSING
    return KeywordCheckResult(present=present, missing=missing, penalty_applied=penalty)


def apply_keyword_penalty(base_score: float, check: KeywordCheckResult, max_marks: float) -> float:
    if not check.missing:
        return base_score
    deduction = max_marks * (check.penalty_applied / 100)
    return round(max(0.0, base_score - deduction), 2)
