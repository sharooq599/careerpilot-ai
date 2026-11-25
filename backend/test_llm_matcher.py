
from app.services.llm_matcher import analyze_resume_with_ai

sample_resume = """
Python developer with knowledge of Python, FastAPI,
SQL, PostgreSQL, React and REST APIs.

Built an AI-powered document research project using
LangChain, LangGraph, RAG and vector databases.
"""

sample_job = """
We are looking for a Python Backend Developer.

Required skills:
Python, FastAPI, SQL, PostgreSQL, REST APIs,
Docker and AWS.

Responsibilities:
Develop backend APIs, integrate databases,
build scalable applications and deploy services.
"""

result = analyze_resume_with_ai(
    resume_text=sample_resume,
    job_title="Python Backend Developer",
    company="Tech Company",
    job_description=sample_job
)

print("\n========== AI RESUME ANALYSIS ==========")
print("Match Score:", result["match_score"])
print("Summary:", result["summary"])
print("Matched Skills:", result["matched_skills"])
print("Missing Skills:", result["missing_skills"])
print("Strengths:", result["strengths"])
print("Recommendations:", result["recommendations"])
