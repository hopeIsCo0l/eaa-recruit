"""
Semantic XAI explanation — replaces LIME-based attribution.

Queries pgvector for stored CV and JD chunk embeddings, then classifies
each JD requirement as strongly matched, weakly matched, or a gap (nothing
in the CV addressed it). This gives true semantic explanation that reflects
how the score was actually computed.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import List, Tuple

from src.db.pgvector_store import query_best_matches

logger = logging.getLogger(__name__)

# Similarity thresholds
STRONG_THRESHOLD = 0.72   # clear semantic match
WEAK_THRESHOLD   = 0.50   # partial / tangential match
# Below WEAK_THRESHOLD → gap (JD requirement not addressed in CV)


@dataclass
class AlignmentPair:
    cv_chunk:   str
    jd_chunk:   str
    similarity: float   # 0-1


@dataclass
class SemanticExplanation:
    strong_matches: List[AlignmentPair] = field(default_factory=list)
    weak_matches:   List[AlignmentPair] = field(default_factory=list)
    gaps:           List[str]           = field(default_factory=list)   # jd_chunk texts with no CV match
    available:      bool = True   # False when pgvector had no data (fallback path)


def explain(application_id: int, job_id: int) -> SemanticExplanation:
    """
    Build a SemanticExplanation from stored pgvector chunks.

    Falls back to SemanticExplanation(available=False) if chunks were not
    stored (e.g. storage failed at CV submission time).
    """
    matches: List[Tuple[str, str, float]] = query_best_matches(application_id, job_id)

    if not matches:
        logger.warning(
            "No pgvector matches found applicationId=%s jobId=%s — explanation unavailable",
            application_id, job_id,
        )
        return SemanticExplanation(available=False)

    strong, weak, gaps = [], [], []

    for cv_chunk, jd_chunk, similarity in matches:
        pair = AlignmentPair(cv_chunk=cv_chunk, jd_chunk=jd_chunk, similarity=similarity)
        if similarity >= STRONG_THRESHOLD:
            strong.append(pair)
        elif similarity >= WEAK_THRESHOLD:
            weak.append(pair)
        else:
            gaps.append(jd_chunk)

    logger.info(
        "Semantic explanation applicationId=%s: %d strong, %d weak, %d gaps",
        application_id, len(strong), len(weak), len(gaps),
    )

    return SemanticExplanation(
        strong_matches=strong,
        weak_matches=weak,
        gaps=gaps,
        available=True,
    )
