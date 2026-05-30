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
from src.services import semantic_explanation as sem_exp
from src.services.justification_engine import JustificationInput, generate as generate_justification
from src.services.pdf_generator import STORAGE_DIR, generate_pdf
from src.utils.auth import verify_internal_api_key

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/xai", dependencies=[Depends(verify_internal_api_key)])
public_router = APIRouter(prefix="/api/v1/xai")


class XaiReportRequest(BaseModel):
    applicationId:    int   = Field(gt=0)
    jobId:            int   = Field(gt=0)
    candidateName:    str   = Field(min_length=1, max_length=256)
    jobTitle:         str   = Field(min_length=1, max_length=256)
    jobDescription:   str   = Field(min_length=1, max_length=20_000)
    cvScore:          float = Field(ge=0, le=100)
    examScore:        float = Field(ge=0, le=100)
    hardFilterPassed: bool
    finalScore:       float = Field(ge=0, le=100)
    decision:         str   = Field(default="UNKNOWN", max_length=20)
    recruiterNotes:   str | None = Field(default=None, max_length=5_000)


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

    # Step 1: semantic explanation from pgvector
    explanation = sem_exp.explain(body.applicationId, body.jobId)

    # Step 2: Qwen generates plain-text reason from alignment pairs
    qwen_reason = ""
    if explanation.available and settings.ollama_enabled:
        try:
            from src.services.ollama_scoring import generate_xai_reason
            qwen_reason = generate_xai_reason(
                explanation=explanation,
                job_title=body.jobTitle,
                decision=body.decision,
                cv_score=body.cvScore,
                exam_score=body.examScore,
                final_score=body.finalScore,
                hard_filter_passed=body.hardFilterPassed,
                recruiter_notes=body.recruiterNotes,
            )
        except Exception as exc:
            logger.warning("Qwen XAI reason failed — using template fallback: %s", exc)

    # Step 3: justification paragraphs
    justification = generate_justification(JustificationInput(
        candidate_name=body.candidateName,
        job_title=body.jobTitle,
        cv_score=body.cvScore,
        exam_score=body.examScore,
        hard_filter_passed=body.hardFilterPassed,
        final_score=body.finalScore,
        explanation=explanation,
        decision=body.decision,
        qwen_reason=qwen_reason,
        recruiter_notes=body.recruiterNotes,
    ))

    # Step 4: generate PDF
    pdf_path = generate_pdf(
        application_id=str(body.applicationId),
        candidate_name=body.candidateName,
        job_title=body.jobTitle,
        cv_score=body.cvScore,
        exam_score=body.examScore,
        final_score=body.finalScore,
        hard_filter_passed=body.hardFilterPassed,
        explanation=explanation,
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


@public_router.get("/report/{application_id}")
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
