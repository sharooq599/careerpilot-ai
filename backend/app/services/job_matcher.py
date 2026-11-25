
import re


# Initial skill dictionary for baseline matching.
# We can expand this as the project grows.
SKILL_ALIASES = {
    "python": ["python"],
    "fastapi": ["fastapi"],
    "django": ["django"],
    "flask": ["flask"],
    "sql": ["sql"],
    "postgresql": ["postgresql", "postgres"],
    "mysql": ["mysql"],
    "sqlalchemy": ["sqlalchemy"],
    "javascript": ["javascript"],
    "typescript": ["typescript"],
    "react": ["react", "react.js"],
    "node.js": ["node.js", "nodejs"],
    "html": ["html"],
    "css": ["css"],
    "git": ["git"],
    "docker": ["docker"],
    "aws": ["aws", "amazon web services"],
    "rest api": ["rest api", "restful api", "rest apis"],
    "machine learning": ["machine learning"],
    "generative ai": ["generative ai", "genai", "gen ai"],
    "llm": ["llm", "large language model", "large language models"],
    "langchain": ["langchain"],
    "communication": ["communication"],
    "problem solving": ["problem solving", "problem-solving"],
}


def normalize_text(text: str) -> str:
    """Normalize text for consistent skill matching."""
    return re.sub(r"\s+", " ", text.lower()).strip()


def extract_skills(text: str) -> set[str]:
    """Find known skills mentioned in a piece of text."""
    normalized = normalize_text(text)
    found_skills = set()

    for skill, aliases in SKILL_ALIASES.items():
        for alias in aliases:
            # Avoid matching a short skill inside a larger word.
            pattern = (
                r"(?<![a-z0-9+#.])"
                + re.escape(alias.lower())
                + r"(?![a-z0-9+#.])"
            )

            if re.search(pattern, normalized):
                found_skills.add(skill)
                break

    return found_skills


def calculate_match(
    resume_text: str,
    job_description: str,
) -> dict:
    """Compare resume skills against skills in a job description."""
    resume_skills = extract_skills(resume_text)
    required_skills = extract_skills(job_description)

    matched_skills = sorted(resume_skills & required_skills)
    missing_skills = sorted(required_skills - resume_skills)

    if not required_skills:
        match_score = 0
    else:
        match_score = round(
            len(matched_skills) / len(required_skills) * 100
        )

    recommendations = [
        f"Consider building practical experience with {skill}."
        for skill in missing_skills
    ]

    if not required_skills:
        recommendations.append(
            "The job description did not contain any recognized "
            "skills. Review the description or expand the skill dictionary."
        )
    elif not missing_skills:
        recommendations.append(
            "Your resume includes all the skills recognized in this "
            "job description. Review the job responsibilities as well."
        )

    return {
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "recommendations": recommendations,
    }
