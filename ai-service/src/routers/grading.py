"""Short-answer grading endpoints (FR-56/57).

Called by the Go exam-engine for free-text question grading.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from src.services.answer_scorer import score_answer
from src.utils.auth import verify_internal_api_key

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1", dependencies=[Depends(verify_internal_api_key)])


class GradeAnswerRequest(BaseModel):
    questionId:       str = Field(min_length=1, max_length=64)
    idealAnswer:      str = Field(min_length=1, max_length=10_000)
    candidateAnswer:  str = Field(max_length=20_000)
    maxMarks:         float = Field(gt=0, le=100)
    requiredKeywords: list[str] | None = Field(default=None, max_length=50)


class GradeAnswerResponse(BaseModel):
    questionId:        str
    rawSimilarity:     float
    awardedMarks:      float
    maxMarks:          float
    missingKeywords:   list[str] = []


class GradeBatchRequest(BaseModel):
    answers: list[GradeAnswerRequest] = Field(min_length=1, max_length=500)


class GradeBatchResponse(BaseModel):
    results: list[GradeAnswerResponse]


def _grade(req: GradeAnswerRequest) -> GradeAnswerResponse:
    result = score_answer(
        question_id=req.questionId,
        ideal_answer=req.idealAnswer,
        candidate_answer=req.candidateAnswer,
        max_marks=req.maxMarks,
        required_keywords=req.requiredKeywords,
    )
    return GradeAnswerResponse(
        questionId=result.question_id,
        rawSimilarity=result.raw_similarity,
        awardedMarks=result.awarded_marks,
        maxMarks=result.max_marks,
        missingKeywords=result.keyword_result.missing if result.keyword_result else [],
    )


@router.post("/grade-answer", response_model=GradeAnswerResponse)
def grade_answer(body: GradeAnswerRequest) -> GradeAnswerResponse:
    return _grade(body)


@router.post("/grade-batch", response_model=GradeBatchResponse)
def grade_batch(body: GradeBatchRequest) -> GradeBatchResponse:
    return GradeBatchResponse(results=[_grade(a) for a in body.answers])
