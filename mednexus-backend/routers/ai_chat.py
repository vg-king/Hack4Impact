import os

import google.generativeai as genai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/ai", tags=["AI Chat"])


def _gemini_key() -> str | None:
    return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")


class ChatIn(BaseModel):
    message: str = Field(min_length=1)


@router.post("/chat")
def chat(payload: ChatIn) -> dict:
    key = _gemini_key()
    if not key:
        raise HTTPException(status_code=500, detail="Missing Gemini API key in backend .env")

    genai.configure(api_key=key)
    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = (
        "You are MedNexus AI, an advanced medical assistant. "
        "Be empathetic and structured. For serious conditions, recommend a clinician consult.\n\n"
        f"User message: {payload.message}"
    )

    try:
        response = model.generate_content(prompt)
        text = (response.text or "").strip() if response else ""
        return {"reply": text or "No response.", "model": "gemini-1.5-flash"}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini request failed: {exc}") from exc
