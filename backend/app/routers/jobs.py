from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Job, Application, ResumeAnalysis
from app.routers.auth import get_current_user
from app.schemas.job import JobCreate, JobUpdate, JobResponse

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(payload: JobCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    job = Job(owner_id=current_user.id, title=payload.title.strip(), company=payload.company.strip(), description=payload.description.strip(), url=str(payload.url) if payload.url else None)
    db.add(job); db.commit(); db.refresh(job)
    return job

@router.get("", response_model=list[JobResponse])
def get_jobs(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.scalars(select(Job).where(or_(Job.owner_id == current_user.id, Job.owner_id.is_(None))).order_by(Job.created_at.desc())).all()

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    job = db.scalar(select(Job).where(Job.id == job_id, or_(Job.owner_id == current_user.id, Job.owner_id.is_(None))))
    if not job: raise HTTPException(404, "Job not found")
    return job

@router.patch("/{job_id}", response_model=JobResponse)
def update_job(job_id: int, payload: JobUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    job = db.scalar(select(Job).where(Job.id == job_id, Job.owner_id == current_user.id))
    if not job: raise HTTPException(404, "Job not found or you do not own it")
    for key, value in payload.model_dump(exclude_unset=True).items():
        if key == "url": value = str(value) if value else None
        if value is not None: setattr(job, key, value.strip() if isinstance(value, str) else value)
    db.commit(); db.refresh(job); return job

@router.delete("/{job_id}", status_code=204)
def delete_job(job_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    job = db.scalar(select(Job).where(Job.id == job_id, Job.owner_id == current_user.id))
    if not job: raise HTTPException(404, "Job not found or you do not own it")
    db.query(Application).filter(Application.job_id == job.id).delete(synchronize_session=False)
    db.query(ResumeAnalysis).filter(ResumeAnalysis.job_id == job.id).delete(synchronize_session=False)
    db.delete(job); db.commit(); return None
