from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Application, Job, Resume, ResumeAnalysis
from app.routers.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    resume_count = db.scalar(select(func.count(Resume.id)).where(Resume.user_id == current_user.id)) or 0
    job_count = db.scalar(select(func.count(Job.id)).where((Job.owner_id == current_user.id) | (Job.owner_id.is_(None)))) or 0
    application_count = db.scalar(select(func.count(Application.id)).where(Application.user_id == current_user.id)) or 0
    analysis_count = db.scalar(select(func.count(ResumeAnalysis.id)).join(Resume, Resume.id == ResumeAnalysis.resume_id).where(Resume.user_id == current_user.id)) or 0
    statuses = db.execute(select(Application.status, func.count(Application.id)).where(Application.user_id == current_user.id).group_by(Application.status)).all()
    upcoming = db.scalars(select(Application).where(Application.user_id == current_user.id, Application.follow_up_date >= date.today()).order_by(Application.follow_up_date).limit(5)).all()
    return {"resumes": resume_count, "jobs": job_count, "applications": application_count, "analyses": analysis_count, "statuses": {status: count for status, count in statuses}, "upcoming_follow_ups": [{"id": a.id, "job_title": a.job.title if a.job else "Job", "company": a.job.company if a.job else "", "date": a.follow_up_date.isoformat(), "status": a.status} for a in upcoming]}
