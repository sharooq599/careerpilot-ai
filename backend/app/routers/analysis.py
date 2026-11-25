
import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Job, Resume, ResumeAnalysis
from app.routers.auth import get_current_user
from app.schemas.resume_analysis import (
    MatchRequest,
    ResumeAnalysisResponse,
)
from app.services.llm_matcher import analyze_resume_with_ai


router = APIRouter(
    prefix="/analysis",
    tags=["Resume Analysis"],
)


@router.post(
    "/match",
    response_model=ResumeAnalysisResponse,
    status_code=status.HTTP_201_CREATED,
)
def match_resume_to_job(
    payload: MatchRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # 1. Verify resume ownership
    resume = db.query(Resume).filter(
        Resume.id == payload.resume_id,
        Resume.user_id == current_user.id,
    ).first()

    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    # 2. Find job
    job = db.get(Job, payload.job_id)

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        )

    # 3. Validate resume text
    if not resume.parsed_text or not resume.parsed_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The resume has no extracted text to analyze.",
        )

    # 4. Perform AI analysis
    try:
        result = analyze_resume_with_ai(
            resume_text=resume.parsed_text,
            job_title=job.title,
            company=job.company,
            job_description=job.description,
        )

    except Exception as exc:
        print(f"AI analysis error: {exc}")

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI resume analysis failed. Please try again.",
        )

    # 5. Save AI results in PostgreSQL
    analysis = ResumeAnalysis(
        resume_id=resume.id,
        job_id=job.id,
        match_score=result["match_score"],
        summary=result["summary"],
        matched_skills=json.dumps(result["matched_skills"]),
        missing_skills=json.dumps(result["missing_skills"]),
        strengths=json.dumps(result["strengths"]),
        recommendations=json.dumps(result["recommendations"]),
    )

    try:
        db.add(analysis)
        db.commit()
        db.refresh(analysis)

    except Exception:
        db.rollback()
        raise

    # 6. Return response
    return {
        "id": analysis.id,
        "resume_id": analysis.resume_id,
        "job_id": analysis.job_id,
        "match_score": analysis.match_score,
        "summary": analysis.summary,
        "matched_skills": result["matched_skills"],
        "missing_skills": result["missing_skills"],
        "strengths": result["strengths"],
        "recommendations": result["recommendations"],
        "created_at": analysis.created_at,
    }
