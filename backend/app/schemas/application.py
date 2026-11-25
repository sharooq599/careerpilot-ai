from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field
STATUSES = {"Saved", "Applied", "Assessment", "Interview", "Offer", "Rejected", "Withdrawn"}
class ApplicationCreate(BaseModel):
    job_id: int = Field(gt=0)
    status: str = "Applied"
    applied_date: date | None = None
    follow_up_date: date | None = None
    notes: str | None = None
class ApplicationUpdate(BaseModel):
    status: str | None = None
    applied_date: date | None = None
    follow_up_date: date | None = None
    notes: str | None = None
class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    job_id: int
    status: str
    applied_date: date | None
    follow_up_date: date | None
    notes: str | None
    created_at: datetime
    job_title: str | None = None
    company: str | None = None
