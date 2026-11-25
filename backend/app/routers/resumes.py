
from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Resume, ResumeAnalysis
from app.routers.auth import get_current_user
from app.schemas.resume import ResumeResponse
from app.services.resume_parser import extract_resume_text


router = APIRouter(
    prefix="/resumes",
    tags=["Resumes"],
)

# Store uploaded resumes inside backend/uploads/resumes
UPLOAD_DIR = (
    Path(__file__).resolve().parents[2]
    / "uploads"
    / "resumes"
)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {".pdf", ".docx"}


@router.post(
    "/upload",
    response_model=ResumeResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    original_filename = Path(file.filename or "").name
    extension = Path(original_filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and DOCX files are allowed.",
        )

    content = file.file.read(MAX_FILE_SIZE + 1)

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Maximum resume size is 5 MB.",
        )

    try:
        parsed_text = extract_resume_text(
            content,
            extension,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Could not read this resume. "
                "Please upload a valid PDF or DOCX file "
                "containing readable text."
            ),
        ) from exc

    UPLOAD_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    stored_filename = f"{uuid4().hex}{extension}"
    file_path = UPLOAD_DIR / stored_filename

    try:
        file_path.write_bytes(content)

        resume = Resume(
            user_id=current_user.id,
            filename=original_filename,
            file_path=str(file_path),
            parsed_text=parsed_text,
        )

        db.add(resume)
        db.commit()
        db.refresh(resume)

        return resume

    except Exception:
        db.rollback()

        if file_path.exists():
            file_path.unlink()

        raise

    finally:
        file.file.close()


@router.get(
    "/my-resumes",
    response_model=list[ResumeResponse],
)
def get_my_resumes(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    statement = (
        select(Resume)
        .where(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
    )

    return db.scalars(statement).all()


@router.get(
    "/{resume_id}",
    response_model=ResumeResponse,
)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    statement = select(Resume).where(
        Resume.id == resume_id,
        Resume.user_id == current_user.id,
    )

    resume = db.scalar(statement)

    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    return resume

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(resume_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    resume = db.scalar(select(Resume).where(Resume.id == resume_id, Resume.user_id == current_user.id))
    if resume is None:
        raise HTTPException(status_code=404, detail="Resume not found.")
    path = Path(resume.file_path)
    db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == resume.id).delete(synchronize_session=False)
    db.delete(resume)
    db.commit()
    if path.exists():
        try: path.unlink()
        except OSError: pass
    return None
