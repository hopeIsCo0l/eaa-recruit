"""HTTP client for callbacks into the Spring backend."""
from __future__ import annotations

import logging

import httpx

from src.config import settings

logger = logging.getLogger(__name__)


def _client() -> httpx.Client:
    return httpx.Client(base_url=settings.spring_callback_url, timeout=10.0)


def post_ai_score(application_id: int, cv_relevance_score: float, xai_report_url: str) -> bool:
    """POST score to Spring. cv_relevance_score must be in [0.0, 1.0]. Returns True on 2xx."""
    payload = {
        "cvRelevanceScore": round(max(0.0, min(1.0, cv_relevance_score)), 4),
        "xaiReportUrl":     xai_report_url,
    }
    url = f"/api/v1/internal/applications/{application_id}/ai-score"
    try:
        with _client() as c:
            res = c.post(url, json=payload, headers={"X-Internal-Api-Key": settings.internal_api_key})
            if res.is_success:
                logger.info("AI score posted applicationId=%s score=%.4f",
                            application_id, payload["cvRelevanceScore"])
                return True
            logger.error("AI score callback failed applicationId=%s status=%s body=%s",
                         application_id, res.status_code, res.text[:300])
            return False
    except httpx.HTTPError as ex:
        logger.error("AI score callback exception applicationId=%s: %s", application_id, ex)
        return False
