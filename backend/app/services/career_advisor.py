
import os
import json
from pathlib import Path

from dotenv import load_dotenv
from openrouter import OpenRouter


ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_PATH)

API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")


def generate_career_recommendations(resume_text: str) -> dict:

    if not API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY is missing.")

    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text cannot be empty.")

    prompt = f"""
Analyze this candidate's resume and create a personalized career plan.

RESUME:
{resume_text}

Return ONLY valid JSON using this exact structure:

{{
    "career_summary": "Brief candidate profile",
    "recommended_roles": [
        {{
            "role": "Python Developer",
            "reason": "Why this role suits the candidate"
        }}
    ],
    "existing_skills": ["Python", "SQL"],
    "skills_to_learn": [
        {{
            "skill": "Docker",
            "priority": "High",
            "reason": "Why this skill is useful"
        }}
    ],
    "learning_roadmap": [
        {{
            "duration": "Weeks 1-2",
            "topic": "Docker fundamentals",
            "tasks": ["Learn images", "Practice containers"]
        }}
    ],
    "project_recommendations": [
        {{
            "project": "Job Portal API",
            "description": "Build a job portal using FastAPI and PostgreSQL"
        }}
    ],
    "career_tips": [
        "Practice technical interviews"
    ]
}}

Rules:
- Base recommendations on evidence in the resume.
- Do not invent experience, qualifications or skills.
- Recommend realistic entry-level opportunities where appropriate.
- Prioritize skills relevant to the candidate's existing background.
- Keep the roadmap practical and actionable.
- Return valid JSON only.
"""

    with OpenRouter(api_key=API_KEY) as client:
        response = client.chat.send(
            model=MODEL,
            stream=False,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert career advisor, "
                        "technical recruiter and learning mentor."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

    content = response.choices[0].message.content

    if not content:
        raise ValueError("AI returned an empty response.")

    content = content.strip()

    if content.startswith("```"):
        content = content.split("\n", 1)[1]
        content = content.rsplit("```", 1)[0].strip()

    try:
        result = json.loads(content)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"AI returned invalid JSON: {content[:500]}"
        ) from exc

    required_fields = [
        "career_summary",
        "recommended_roles",
        "existing_skills",
        "skills_to_learn",
        "learning_roadmap",
        "project_recommendations",
        "career_tips"
    ]

    for field in required_fields:
        if field not in result:
            raise ValueError(f"AI response is missing: {field}")

    return result
