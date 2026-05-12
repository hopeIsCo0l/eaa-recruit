"""
HTTP entry point for CV screening — replaces the old Kafka CV_UPLOADED consumer.

The Spring backend POSTs here after persisting an application + CV file. We accept
synchronously, run preprocessing, and return 202. Real similarity scoring + the
backend `/internal/applications/{id}/ai-score` callback happen on a background
task so the caller is not blocked by ML work.
"""
from __future__ import annotations

import logging
import os

from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, status
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1")


class ScoreCvRequest(BaseModel):
    applicationId: int
    candidateId: int
    jobId: int
    cvStoragePath: str


def _verify_internal_key(x_internal_api_key: str | None) -> None:
    expected = os.getenv("INTERNAL_API_KEY", "change-me-internal-key")
    if x_internal_api_key != expected:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid internal API key")


def _process_cv(req: ScoreCvRequest) -> None:
    from src.utils.text_extractor import extract_text
    from src.utils.nlp_pipeline import preprocess
    from src.utils.pii_masker import mask

    try:
        raw_text = extract_text(req.cvStoragePath)
    except Exception as exc:
        logger.error("Text extraction failed for applicationId=%s: %s", req.applicationId, exc)
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
    # FR-66 similarity scoring + backend callback wired in subsequent slice


@router.post("/score-cv", status_code=status.HTTP_202_ACCEPTED)
def score_cv(
    body: ScoreCvRequest,
    background: BackgroundTasks,
    x_internal_api_key: str | None = Header(default=None, alias="X-Internal-Api-Key"),
) -> dict:
    _verify_internal_key(x_internal_api_key)
    logger.info("CV score request received applicationId=%s", body.applicationId)
    background.add_task(_process_cv, body)
    return {"status": "accepted", "applicationId": body.applicationId}
