"""
Bias detection service (FR-76).

Analyses CV relevance score distributions across candidate cohorts for a
completed job batch.  Cohorts whose average score deviates more than 1.5
standard deviations from the overall mean are flagged.

Results are serialised as a JSON report and stored in Redis so the admin
analytics API (FR-40) can retrieve them without re-running the analysis.
"""

import json
import logging
import math
from typing import Any

import redis

from src.config import settings

logger = logging.getLogger(__name__)

REPORT_TTL_SECONDS = 60 * 60 * 24 * 30  # 30 days
BIAS_THRESHOLD_STDDEV = 1.5

_client: redis.Redis | None = None


def _get_client() -> redis.Redis:
    global _client
    if _client is None:
        _client = redis.from_url(settings.redis_url, decode_responses=True)
    return _client


def _report_key(job_id: str) -> str:
    return f"bias_report:{job_id}"


# ---------------------------------------------------------------------------
# Core statistics helpers
# ---------------------------------------------------------------------------

def _mean(values: list[float]) -> float:
    return sum(values) / len(values)


def _stddev(values: list[float], mean: float) -> float:
    if len(values) < 2:
        return 0.0
    variance = sum((v - mean) ** 2 for v in values) / len(values)
    return math.sqrt(variance)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def analyse(job_id: str, candidates: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Compute per-cohort score statistics and flag outlier cohorts.

    Parameters
    ----------
    job_id:
        Identifier for the completed job batch.
    candidates:
        List of dicts with keys:
          - ``candidateId``  (str)
          - ``cohort``       (str)  e.g. university name or geographic indicator
          - ``cvScore``      (float, 0–100)

    Returns
    -------
    Structured report dict (also persisted to Redis).
    """
    if not candidates:
        raise ValueError("candidates list must not be empty")

    # Group scores by cohort
    cohort_scores: dict[str, list[float]] = {}
    for c in candidates:
        cohort = str(c["cohort"]).strip() or "Unknown"
        cohort_scores.setdefault(cohort, []).append(float(c["cvScore"]))

    all_scores = [float(c["cvScore"]) for c in candidates]
    overall_mean = _mean(all_scores)
    overall_stddev = _stddev(all_scores, overall_mean)

    cohort_stats = []
    for cohort, scores in sorted(cohort_scores.items()):
        avg = _mean(scores)
        deviation = (avg - overall_mean) / overall_stddev if overall_stddev > 0 else 0.0
        flagged = abs(deviation) > BIAS_THRESHOLD_STDDEV
        cohort_stats.append(
            {
                "cohort": cohort,
                "candidateCount": len(scores),
                "averageScore": round(avg, 4),
                "deviationFromMean": round(deviation, 4),
                "flagged": flagged,
            }
        )

    flagged_cohorts = [s["cohort"] for s in cohort_stats if s["flagged"]]

    report: dict[str, Any] = {
        "jobId": job_id,
        "totalCandidates": len(candidates),
        "overallMeanScore": round(overall_mean, 4),
        "overallStdDev": round(overall_stddev, 4),
        "biasThresholdStdDev": BIAS_THRESHOLD_STDDEV,
        "flaggedCohorts": flagged_cohorts,
        "cohortStats": cohort_stats,
    }

    _persist(job_id, report)
    logger.info(
        "Bias analysis complete: jobId=%s cohorts=%d flagged=%d",
        job_id,
        len(cohort_stats),
        len(flagged_cohorts),
    )
    return report


def get_report(job_id: str) -> dict[str, Any] | None:
    """Retrieve a previously computed bias report from Redis."""
    try:
        raw = _get_client().get(_report_key(job_id))
        if raw:
            return json.loads(raw)
    except Exception:
        logger.warning("Failed to retrieve bias report for jobId=%s", job_id, exc_info=True)
    return None


def _persist(job_id: str, report: dict[str, Any]) -> None:
    try:
        _get_client().setex(_report_key(job_id), REPORT_TTL_SECONDS, json.dumps(report))
    except Exception:
        logger.warning("Failed to persist bias report for jobId=%s", job_id, exc_info=True)
