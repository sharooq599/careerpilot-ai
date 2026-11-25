
from pydantic import BaseModel


class CareerRole(BaseModel):
    role: str
    reason: str


class SkillRecommendation(BaseModel):
    skill: str
    priority: str
    reason: str


class LearningPhase(BaseModel):
    duration: str
    topic: str
    tasks: list[str]


class ProjectRecommendation(BaseModel):
    project: str
    description: str


class CareerRecommendationResponse(BaseModel):
    resume_id: int
    career_summary: str
    recommended_roles: list[CareerRole]
    existing_skills: list[str]
    skills_to_learn: list[SkillRecommendation]
    learning_roadmap: list[LearningPhase]
    project_recommendations: list[ProjectRecommendation]
    career_tips: list[str]
