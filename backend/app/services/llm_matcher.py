
import os
import json
from pathlib import Path

from dotenv import load_dotenv
from openrouter import OpenRouter


# Load backend/.env
ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_PATH)

API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")


def analyze_resume_with_ai(
    resume_text: str,
    job_title: str,
    company: str,
    job_description: str
) -> dict:

    if not API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY is missing from .env")

    if not resume_text.strip():
        raise ValueError("Resume text cannot be empty")

    prompt = f"""
Analyze the candidate's resume against the job description.

JOB TITLE: {job_title}
COMPANY: {company}

JOB DESCRIPTION:
{job_description}

CANDIDATE RESUME:
{resume_text}

Return ONLY valid JSON with this exact structure:

{{
    "match_score": 75,
    "summary": "Short explanation of the candidate's suitability.",
    "matched_skills": ["Python", "SQL"],
    "missing_skills": ["Docker", "AWS"],
    "strengths": ["Relevant project experience"],
    "recommendations": [
        "Learn Docker fundamentals",
        "Improve cloud deployment knowledge"
    ]
}}

Rules:
- match_score must be an integer between 0 and 100.
- Use evidence from the resume and job description.
- Do not invent candidate experience or skills.
- Keep recommendations practical and specific.
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
                        "You are an expert technical recruiter "
                        "and AI career advisor. Analyze resumes "
                        "fairly and accurately."
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
        raise ValueError("OpenRouter returned an empty response")

    # Remove Markdown code fences if the model includes them
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

    # Validate and normalize the response
    score = int(result.get("match_score", 0))

    if not 0 <= score <= 100:
        raise ValueError("AI match score must be between 0 and 100")

    return {
        "match_score": score,
        "summary": str(result.get("summary", "")),
        "matched_skills": result.get("matched_skills", []),
        "missing_skills": result.get("missing_skills", []),
        "strengths": result.get("strengths", []),
        "recommendations": result.get("recommendations", [])
    }
