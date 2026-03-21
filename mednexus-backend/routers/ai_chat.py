import os

import google.generativeai as genai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/ai", tags=["AI Chat"])


def _gemini_key() -> str | None:
    return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")


def _candidate_models() -> list[str]:
    # Prefer modern flash-class models first, then fall back to common legacy IDs.
    preferred = [
        "models/gemini-2.5-flash",
        "models/gemini-2.0-flash",
        "models/gemini-1.5-flash-latest",
        "models/gemini-1.5-flash",
    ]

    discovered: list[str] = []
    try:
        for m in genai.list_models():
            methods = getattr(m, "supported_generation_methods", []) or []
            if "generateContent" not in methods:
                continue
            name = getattr(m, "name", "")
            if "flash" in name:
                discovered.append(name)
    except Exception:
        pass

    ordered = preferred + discovered
    deduped: list[str] = []
    for name in ordered:
        if name and name not in deduped:
            deduped.append(name)
    return deduped


class ChatIn(BaseModel):
    message: str = Field(min_length=1)


@router.post("/chat")
def chat(payload: ChatIn) -> dict:
    key = _gemini_key()
    if not key:
        raise HTTPException(status_code=500, detail="Missing Gemini API key in backend .env")

    genai.configure(api_key=key)
    model_names = _candidate_models()
    prompt = (
        "You are MedNexus AI, an advanced medical assistant. "
        "Be empathetic and structured. For serious conditions, recommend a clinician consult.\n\n"
        f"User message: {payload.message}"
    )

    last_exc: Exception | None = None
    for model_name in model_names:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            text = (response.text or "").strip() if response else ""
            return {"reply": text or "No response.", "model": model_name}
        except Exception as exc:
            last_exc = exc

    raise HTTPException(status_code=502, detail=f"Gemini request failed: {last_exc}")
