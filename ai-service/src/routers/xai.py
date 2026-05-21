"""FR-35 — XAI report generation and download.

POST /api/v1/xai/report          — generate PDF report from final scoring data
GET  /api/v1/xai/report/{app_id} — stream the previously-generated PDF
"""
from __future__ import annotations

import logging
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from src.config import settings
from src.services import cv_text_cache
from src.services.attribution_service import explain_cv
from src.services.justification_engine import JustificationInput, generate as generate_justification
from src.services.pdf_generator import STORAGE_DIR, generate_pdf
from src.utils.auth import verify_internal_api_key

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/xai", dependencies=[Depends(verify_internal_api_key)])


class XaiReportRequest(BaseModel):
    applicationId:    int
    candidateName:    str
    jobTitle:         str
    jobDescription:   str
    cvText:           str | None = Field(default=None, max_length=50_000,
                                          description="Optional. Falls back to Redis cv-text:{appId}.")
    cvScore:          float = Field(ge=0, le=100)
    examScore:        float = Field(ge=0, le=100)
    hardFilterPassed: bool
    finalScore:       float = Field(ge=0, le=100)
    recruiterNotes:   str | None = None
    limeSamples:      int = Field(default=300, ge=50, le=2000)


class XaiReportResponse(BaseModel):
    applicationId: int
    pdfPath:       str
    downloadUrl:   str
    summary:       str


def _public_base() -> str:
    return settings.ai_service_public_url.rstrip("/")


@router.post("/report", response_model=XaiReportResponse)
def build_report(body: XaiReportRequest) -> XaiReportResponse:
    logger.info("XAI report build requested applicationId=%s", body.applicationId)

    cv_text = body.cvText or cv_text_cache.get(body.applicationId)
    if not cv_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(f"No cached CV text for applicationId={body.applicationId}. "
                    f"Supply cvText in the request body."),
        )

    attribution    = explain_cv(cv_text, body.jobDescription, num_samples=body.limeSamples)
    justification  = generate_justification(JustificationInput(
        candidate_name=body.candidateName,
        job_title=body.jobTitle,
        cv_score=body.cvScore,
        exam_score=body.examScore,
        hard_filter_passed=body.hardFilterPassed,
        final_score=body.finalScore,
        attribution=attribution,
        recruiter_notes=body.recruiterNotes,
    ))

    pdf_path = generate_pdf(
        application_id=str(body.applicationId),
        candidate_name=body.candidateName,
        job_title=body.jobTitle,
        cv_score=body.cvScore,
        exam_score=body.examScore,
        final_score=body.finalScore,
        hard_filter_passed=body.hardFilterPassed,
        attribution=attribution,
        justification=justification,
        recruiter_notes=body.recruiterNotes,
    )

    download_url = f"{_public_base()}/api/v1/xai/report/{body.applicationId}"
    return XaiReportResponse(
        applicationId=body.applicationId,
        pdfPath=str(pdf_path),
        downloadUrl=download_url,
        summary=justification.summary,
    )


@router.get("/report/{application_id}")
def get_report(application_id: int) -> FileResponse:
    pdf_path = Path(STORAGE_DIR) / f"{application_id}_feedback.pdf"
    if not pdf_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No XAI report found for applicationId={application_id}",
        )
    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename=f"application-{application_id}-feedback.pdf",
    )
