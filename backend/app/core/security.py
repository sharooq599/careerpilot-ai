import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
import jwt
from dotenv import load_dotenv
from pwdlib import PasswordHash

load_dotenv(Path(__file__).resolve().parents[2] / ".env")
SECRET_KEY = os.getenv("SECRET_KEY", "")
if not SECRET_KEY:
    # Development fallback only; configure a strong key in backend/.env for deployment.
    SECRET_KEY = "development-only-change-this-secret-before-deployment"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))
password_hash = PasswordHash.recommended()

def hash_password(password: str) -> str:
    return password_hash.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return password_hash.verify(plain_password, hashed_password)
    except Exception:
        return False

def create_access_token(user_id: int) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": str(user_id), "exp": expires_at, "iat": datetime.now(timezone.utc)}, SECRET_KEY, algorithm=ALGORITHM)
