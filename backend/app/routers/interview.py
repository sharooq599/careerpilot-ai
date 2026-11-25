import json, os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.routers.auth import get_current_user

router = APIRouter(prefix="/interview", tags=["Interview Preparation"])
class InterviewRequest(BaseModel):
    role: str = Field(min_length=2, max_length=120)
    level: str = "Fresher"
    topics: list[str] = Field(default_factory=list)

@router.post("/questions")
def interview_questions(payload: InterviewRequest, user=Depends(get_current_user)):
    key = os.getenv("OPENROUTER_API_KEY")
    if key:
        try:
            from openrouter import OpenRouter
            prompt = f"Create 10 interview questions for a {payload.level} candidate applying for {payload.role}. Topics: {', '.join(payload.topics) or 'role fundamentals, projects, behavioral'}. Return JSON array of objects with question, category, and a concise answer_outline."
            with OpenRouter(api_key=key) as client:
                response = client.chat.send(model=os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini"), stream=False, messages=[{"role":"system","content":"You are an experienced technical interviewer. Return valid JSON only."},{"role":"user","content":prompt}])
            raw = response.choices[0].message.content.strip().removeprefix("```json").removesuffix("```").strip()
            data = json.loads(raw)
            if isinstance(data, list): return {"role": payload.role, "questions": data}
        except Exception:
            pass
    base = [
      ("Tell me about yourself.", "Introduction"),
      (f"Why are you interested in the {payload.role} role?", "Motivation"),
      ("Explain a project you built and the problem it solves.", "Projects"),
      ("Describe a technical challenge you faced and how you solved it.", "Problem solving"),
      ("How do you debug an issue you cannot reproduce easily?", "Technical"),
      ("How do you prioritize tasks when several deadlines overlap?", "Behavioral"),
      ("What technical skill are you currently improving?", "Growth"),
      ("Explain a concept from your strongest technical area to a beginner.", "Technical"),
      ("Tell me about a time you received feedback and acted on it.", "Behavioral"),
      ("What questions would you ask the interviewer about this role?", "Closing")]
    return {"role": payload.role, "questions": [{"question": q, "category": c, "answer_outline": "Use a clear, specific example. Explain the context, your actions, and the result."} for q,c in base]}
