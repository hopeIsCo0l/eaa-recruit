"""
HTTP entry point for CV screening — replaces the old Kafka CV_UPLOADED consumer.

The Spring backend POSTs here after persisting an application + CV file. We accept
synchronously, run preprocessing, and return 202. Real similarity scoring + the
backend `/internal/applications/{id}/ai-score` callback happen on a background
task so the caller is not blocked by ML work.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, BackgroundTasks, Depends, status
from pydantic import BaseModel, Field

from src.utils.auth import verify_internal_api_key

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1")


class ScoreCvRequest(BaseModel):
    applicationId:  int = Field(gt=0)
    candidateId:    int = Field(gt=0)
    jobId:          int = Field(gt=0)
    cvStoragePath:  str = Field(min_length=1, max_length=1024)
    jobDescription: str | None = Field(default=None, max_length=20_000)


def _process_cv(req: ScoreCvRequest) -> None:
    from src.services.backend_client import post_ai_score
    from src.services.similarity_service import score_cv_against_job
    from src.utils.text_extractor import extract_text
    from src.utils.nlp_pipeline import preprocess
    from src.utils.pii_masker import mask

    try:
        raw_text = extract_text(req.cvStoragePath)
    except Exception as exc:
        logger.error("Text extraction failed for applicationId=%s: %s", req.applicationId, exc)
        post_ai_score(req.applicationId, 0.0, f"failed:extract:{req.applicationId}")
        return

    mask_result = mask(raw_text)
    if mask_result.detections:
        logger.info(
            "PII detections for applicationId=%s: %s",
            req.applicationId,
            ", ".join(f"{lbl}×{cnt}" for lbl, cnt in mask_result.detections),
        )

    preprocessed = preprocess(mask_result.masked_text)
    logger.info("CV preprocessed: applicationId=%s chars=%d", req.applicationId, len(preprocessed))

    # Stash CV text so /xai/report can rebuild attribution without re-extraction.
    try:
        from src.services.cv_text_cache import put as cache_put_text
        cache_put_text(req.applicationId, preprocessed)
    except Exception as exc:
        logger.warning("CV text cache write failed applicationId=%s: %s", req.applicationId, exc)

    if not req.jobDescription:
        logger.warning("No jobDescription for applicationId=%s — skipping similarity",
                       req.applicationId)
        post_ai_score(req.applicationId, 0.0, f"failed:no-jd:{req.applicationId}")
        return

    try:
        # score_cv_against_job returns 0-100; callback expects 0-1
        score_100 = score_cv_against_job(preprocessed, req.jobDescription)
        score_unit = round(score_100 / 100.0, 4)
        logger.info("CV similarity score=%.4f applicationId=%s", score_unit, req.applicationId)
    except Exception as exc:
        logger.error("Similarity scoring failed applicationId=%s: %s", req.applicationId, exc)
        post_ai_score(req.applicationId, 0.0, f"failed:score:{req.applicationId}")
        return

    # XAI report (LIME + PDF) is generated post-exam via /api/v1/xai/report,
    # not here — we only have CV-stage data at this point. Pending until then.
    xai_url = f"pending:{req.applicationId}"
    post_ai_score(req.applicationId, score_unit, xai_url)


def _safe_process_cv(req: ScoreCvRequest) -> None:
    """Outer guard: any unexpected failure still notifies Spring so the application
    doesn't sit in pending forever."""
    from src.services.backend_client import post_ai_score

    try:
        _process_cv(req)
    except Exception as exc:
        logger.exception("Unhandled error processing CV applicationId=%s: %s",
                         req.applicationId, exc)
        post_ai_score(req.applicationId, 0.0, f"failed:unhandled:{req.applicationId}")


@router.post(
    "/score-cv",
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(verify_internal_api_key)],
)
def score_cv(body: ScoreCvRequest, background: BackgroundTasks) -> dict:
    logger.info("CV score request received applicationId=%s", body.applicationId)
    background.add_task(_safe_process_cv, body)
    return {"status": "accepted", "applicationId": body.applicationId}
