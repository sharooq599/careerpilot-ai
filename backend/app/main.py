
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine

from app.models import (
    User,
    Resume,
    Job,
    ResumeAnalysis,
    Application,
)

from app.routers.auth import router as auth_router
from app.routers.resumes import router as resumes_router
from app.routers.jobs import router as jobs_router
from app.routers.analysis import router as analysis_router
from app.routers.career import router as career_router
from app.routers.applications import router as applications_router
from app.routers.dashboard import router as dashboard_router
from app.routers.profile import router as profile_router
from app.routers.interview import router as interview_router


# Create database tables
Base.metadata.create_all(bind=engine)


# Initialize FastAPI
app = FastAPI(
    title="AI Career Agent",
    description="AI-powered Job and Career Assistant",
    version="2.0.0",
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routers
app.include_router(auth_router)
app.include_router(resumes_router)
app.include_router(jobs_router)
app.include_router(analysis_router)
app.include_router(career_router)
app.include_router(applications_router)
app.include_router(dashboard_router)
app.include_router(profile_router)
app.include_router(interview_router)


# Root endpoint
@app.get("/")
def root():
    return {"message": "AI Career Agent API is running"}


# Health check endpoint
@app.get("/health")
def health():
    return {"status": "healthy"}
