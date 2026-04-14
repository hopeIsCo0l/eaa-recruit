"""
Bias detection router (FR-76).

POST /bias/analyse   — run analysis for a job batch
GET  /bias/report/{job_id} — retrieve stored report (FR-40 admin analytics)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from src.services import bias_service

router = APIRouter(prefix="/bias")


class CandidateRecord(BaseModel):
    candidateId: str
    cohort: str = Field(description="University name or geographic indicator")
    cvScore: float = Field(ge=0, le=100)


class AnalyseRequest(BaseModel):
    jobId: str
    candidates: list[CandidateRecord] = Field(min_length=1)


@router.post("/analyse")
def analyse(body: AnalyseRequest):
    try:
        report = bias_service.analyse(body.jobId, [c.model_dump() for c in body.candidates])
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    return {"status": "ok", "data": report}


@router.get("/report/{job_id}")
def get_report(job_id: str):
    report = bias_service.get_report(job_id)
    if report is None:
        raise HTTPException(status_code=404, detail=f"No bias report found for jobId={job_id}")
    return {"status": "ok", "data": report}
