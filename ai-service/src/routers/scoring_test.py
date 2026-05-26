"""
Test endpoint for manual AI scoring (dev/demo only).

POST /api/v1/test/score-cv — score a CV snippet against a job description
POST /api/v1/test/grade-answer — grade a candidate answer
GET  /api/v1/test/ollama-status — check Ollama connectivity
"""
from __future__ import annotations

import logging

from fastapi import APIRouter
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/test")


class TestScoreCvRequest(BaseModel):
    cv_text: str = Field(min_length=10, max_length=5000)
    job_description: str = Field(min_length=10, max_length=3000)


class TestScoreCvResponse(BaseModel):
    score: float
    score_percent: float
    method: str
    reasoning: str | None = None


class TestGradeRequest(BaseModel):
    ideal_answer: str = Field(min_length=5, max_length=3000)
    candidate_answer: str = Field(max_length=3000)
    max_marks: float = Field(gt=0, le=100, default=10.0)


class TestGradeResponse(BaseModel):
    similarity: float
    awarded_marks: float
    max_marks: float
    method: str
    feedback: str | None = None


@router.post("/score-cv", response_model=TestScoreCvResponse)
def test_score_cv(body: TestScoreCvRequest) -> TestScoreCvResponse:
    from src.config import settings

    if settings.ollama_enabled:
        try:
            from src.services.ollama_scoring import score_cv
            result = score_cv(body.cv_text, body.job_description)
            if result is not None:
                score_unit, reasoning = result
                return TestScoreCvResponse(
                    score=score_unit,
                    score_percent=round(score_unit * 100, 2),
                    method="ollama",
                    reasoning=reasoning,
                )
        except Exception as ex:
            logger.warning("Ollama test scoring failed: %s", ex)

    # Fallback to SBERT
    from src.services.similarity_service import _sbert_score
    score_100 = _sbert_score(body.cv_text, body.job_description)
    return TestScoreCvResponse(
        score=round(score_100 / 100.0, 4),
        score_percent=score_100,
        method="sbert_fallback",
    )


@router.post("/grade-answer", response_model=TestGradeResponse)
def test_grade_answer(body: TestGradeRequest) -> TestGradeResponse:
    from src.config import settings

    if settings.ollama_enabled:
        try:
            from src.services.ollama_scoring import grade_answer
            result = grade_answer(body.ideal_answer, body.candidate_answer, body.max_marks)
            if result is not None:
                similarity, awarded, feedback = result
                return TestGradeResponse(
                    similarity=similarity,
                    awarded_marks=awarded,
                    max_marks=body.max_marks,
                    method="ollama",
                    feedback=feedback,
                )
        except Exception as ex:
            logger.warning("Ollama test grading failed: %s", ex)

    # Fallback to SBERT
    from src.services.answer_scorer import _sbert_grade
    result = _sbert_grade("test", body.ideal_answer, body.candidate_answer, body.max_marks)
    return TestGradeResponse(
        similarity=result.raw_similarity,
        awarded_marks=result.awarded_marks,
        max_marks=result.max_marks,
        method="sbert_fallback",
    )


@router.get("/ollama-status")
def ollama_status():
    from src.config import settings

    if not settings.ollama_enabled:
        return {"enabled": False, "status": "disabled"}

    from src.services.ollama_scoring import is_available, _model_ready
    available = is_available()
    return {
        "enabled": True,
        "url": settings.ollama_url,
        "model": settings.ollama_model,
        "reachable": available,
        "modelReady": _model_ready,
    }
