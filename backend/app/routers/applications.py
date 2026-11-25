from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Application, Job
from app.routers.auth import get_current_user
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse, STATUSES

router = APIRouter(prefix="/applications", tags=["Job Application Tracking"])

def serialize(app):
    return {"id": app.id, "user_id": app.user_id, "job_id": app.job_id, "status": app.status, "applied_date": app.applied_date, "follow_up_date": app.follow_up_date, "notes": app.notes, "created_at": app.created_at, "job_title": app.job.title if app.job else None, "company": app.job.company if app.job else None}

@router.post("", response_model=ApplicationResponse, status_code=201)
def create_application(payload: ApplicationCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    job = db.get(Job, payload.job_id)
    if not job: raise HTTPException(404, "Job not found")
    if payload.status not in STATUSES: raise HTTPException(400, f"Status must be one of: {', '.join(sorted(STATUSES))}")
    app = Application(user_id=current_user.id, job_id=payload.job_id, status=payload.status, applied_date=payload.applied_date, follow_up_date=payload.follow_up_date, notes=payload.notes)
    db.add(app); db.commit(); db.refresh(app); return serialize(app)

@router.get("/my-applications", response_model=list[ApplicationResponse])
def get_my_applications(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    rows = db.scalars(select(Application).where(Application.user_id == current_user.id).order_by(Application.created_at.desc())).all()
    return [serialize(row) for row in rows]

@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(application_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    app = db.scalar(select(Application).where(Application.id == application_id, Application.user_id == current_user.id))
    if not app: raise HTTPException(404, "Application not found")
    return serialize(app)

@router.patch("/{application_id}", response_model=ApplicationResponse)
def update_application(application_id: int, payload: ApplicationUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    app = db.scalar(select(Application).where(Application.id == application_id, Application.user_id == current_user.id))
    if not app: raise HTTPException(404, "Application not found")
    updates = payload.model_dump(exclude_unset=True)
    if updates.get("status") is not None and updates["status"] not in STATUSES: raise HTTPException(400, f"Status must be one of: {', '.join(sorted(STATUSES))}")
    for field, value in updates.items(): setattr(app, field, value)
    db.commit(); db.refresh(app); return serialize(app)

@router.delete("/{application_id}", status_code=204)
def delete_application(application_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    app = db.scalar(select(Application).where(Application.id == application_id, Application.user_id == current_user.id))
    if not app: raise HTTPException(404, "Application not found")
    db.delete(app); db.commit(); return None
