"""
Job relevance router — aviation-domain gate at job creation time.

POST /job-relevance/check
    Body: { "title": str, "description": str, "requiredDegree": str }
    Returns: { "relevant": bool, "confidence": float, "reason": str,
               "category": str, "source": "ollama"|"fallback" }

Called by Spring before persisting a new job posting. If the LLM judges
the description to be non-aviation, Spring rejects the creation with a
422 BusinessException so the recruiter sees the reason inline.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from src.services.job_relevance_service import check_job_relevance
from src.utils.auth import verify_internal_api_key

router = APIRouter(
    prefix="/job-relevance",
    dependencies=[Depends(verify_internal_api_key)],
)


class JobRelevanceRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=10_000)
    requiredDegree: str = Field(default="", max_length=200)


class JobRelevanceResponse(BaseModel):
    relevant: bool
    confidence: float
    reason: str
    category: str
    source: str  # "ollama" | "fallback"


@router.post("/check", response_model=JobRelevanceResponse)
def check(body: JobRelevanceRequest) -> JobRelevanceResponse:
    result = check_job_relevance(
        title=body.title,
        description=body.description,
        required_degree=body.requiredDegree,
    )
    return JobRelevanceResponse(**result)
