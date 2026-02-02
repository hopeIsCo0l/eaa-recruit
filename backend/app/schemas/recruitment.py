"""
Pydantic schemas for API request/response validation.
"""
from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class JobDescriptionUpload(BaseModel):
    """Schema for job description upload."""
    filename: str
    content: str


class ResumeUpload(BaseModel):
    """Schema for resume upload."""
    id: str
    filename: str
    content: str


class MatchingTerm(BaseModel):
    """Schema for matching term with relevance score."""
    term: str
    relevance: float


class CandidateReport(BaseModel):
    """Schema for individual candidate report."""
    candidate_id: str
    rank: Optional[int] = None
    similarity_score: float
    match_percentage: float
    top_matching_terms: List[MatchingTerm]


class RankingReport(BaseModel):
    """Schema for complete ranking report."""
    timestamp: str
    job_description_summary: str
    total_candidates: int
    candidates: List[CandidateReport]


class RankingResponse(BaseModel):
    """Schema for ranking response."""
    status: str
    report: RankingReport
    text_report: Optional[str] = None


class JobProcessResponse(BaseModel):
    """Schema for job description processing response."""
    status: str
    message: str
    preprocessed_length: int


class HealthResponse(BaseModel):
    """Schema for health check response."""
    status: str = "healthy"
