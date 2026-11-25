from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, HttpUrl
class JobCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    company: str = Field(min_length=2, max_length=255)
    description: str = Field(min_length=20)
    url: HttpUrl | None = None
class JobUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    company: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = Field(default=None, min_length=20)
    url: HttpUrl | None = None
class JobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    owner_id: int | None = None
    title: str
    company: str
    description: str
    url: str | None
    created_at: datetime
