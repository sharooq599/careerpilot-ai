
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Resume
from app.routers.auth import get_current_user
from app.schemas.career import CareerRecommendationResponse
from app.services.career_advisor import generate_career_recommendations


router = APIRouter(
    prefix="/career",
    tags=["AI Career Recommendations"],
)


@router.post(
    "/recommendations",
    response_model=CareerRecommendationResponse,
    status_code=status.HTTP_200_OK,
)
def get_career_recommendations(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Verify resume ownership
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id,
    ).first()

    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    if not resume.parsed_text or not resume.parsed_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume has no extracted text.",
        )

    try:
        result = generate_career_recommendations(
            resume_text=resume.parsed_text
        )

    except Exception as exc:
        print(f"Career recommendation error: {exc}")

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI career recommendation failed. Please try again.",
        )

    return {
        "resume_id": resume.id,
        **result,
    }
