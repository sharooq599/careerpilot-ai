
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ResumeAnalysis(Base):
    __tablename__ = "resume_analysis"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    resume_id: Mapped[int] = mapped_column(
        ForeignKey("resumes.id"),
        nullable=False,
        index=True
    )

    job_id: Mapped[int] = mapped_column(
        ForeignKey("jobs.id"),
        nullable=False,
        index=True
    )

    match_score: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    matched_skills: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    missing_skills: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    recommendations: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # New AI analysis fields
    summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    strengths: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )
