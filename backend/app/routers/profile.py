from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password
from app.models import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])
class ProfileUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)

@router.patch("")
def update_profile(payload: ProfileUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    email = str(payload.email).lower()
    existing = db.query(User).filter(User.email == email, User.id != user.id).first()
    if existing: raise HTTPException(409, "Email is already in use")
    user.name = payload.name.strip(); user.email = email
    db.commit(); db.refresh(user)
    return {"id": user.id, "name": user.name, "email": user.email, "created_at": user.created_at}

@router.patch("/password")
def update_password(payload: PasswordUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not verify_password(payload.current_password, user.password_hash): raise HTTPException(400, "Current password is incorrect")
    user.password_hash = hash_password(payload.new_password); db.commit()
    return {"message": "Password updated successfully. Please log in again on other devices."}
