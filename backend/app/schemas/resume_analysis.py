
from datetime import datetime

from pydantic import BaseModel, Field


class MatchRequest(BaseModel):
    resume_id: int = Field(gt=0)
    job_id: int = Field(gt=0)


class ResumeAnalysisResponse(BaseModel):
    id: int
    resume_id: int
    job_id: int
    match_score: int
    summary: str
    matched_skills: list[str]
    missing_skills: list[str]
    strengths: list[str]
    recommendations: list[str]
    created_at: datetime
