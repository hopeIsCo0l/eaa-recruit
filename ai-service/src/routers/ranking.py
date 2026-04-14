from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/rank")


class CandidateInput(BaseModel):
    candidateId: str
    cvScore: float = Field(ge=0, le=100)
    examScore: float = Field(ge=0, le=100)
    hardFilterPassed: bool


class CandidateResult(BaseModel):
    candidateId: str
    cvScore: float
    examScore: float
    hardFilterPassed: bool
    finalScore: float


class BatchRankRequest(BaseModel):
    candidates: list[CandidateInput]


class BatchRankResponse(BaseModel):
    ranked: list[CandidateResult]


def _compute_final(c: CandidateInput) -> float:
    if not c.hardFilterPassed:
        return 0.0
    return round(c.cvScore * 0.4 + c.examScore * 0.4 + 100 * 0.2, 2)


@router.post("/batch", response_model=BatchRankResponse)
def rank_batch(body: BatchRankRequest) -> BatchRankResponse:
    results = [
        CandidateResult(
            candidateId=c.candidateId,
            cvScore=c.cvScore,
            examScore=c.examScore,
            hardFilterPassed=c.hardFilterPassed,
            finalScore=_compute_final(c),
        )
        for c in body.candidates
    ]
    results.sort(key=lambda r: r.finalScore, reverse=True)
    return BatchRankResponse(ranked=results)
