import os

import google.generativeai as genai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/ai", tags=["AI Chat"])
MODEL_REQUEST_TIMEOUT_SECONDS = 20


def _gemini_key() -> str | None:
    return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")


def _candidate_models() -> list[str]:
    # Keep model selection deterministic and fast. Dynamic list_models() can be slow.
    return [
        "models/gemini-2.5-flash",
        "models/gemini-2.0-flash",
        "models/gemini-1.5-flash-latest",
        "models/gemini-1.5-flash",
    ]


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
            try:
                response = model.generate_content(
                    prompt,
                    request_options={"timeout": MODEL_REQUEST_TIMEOUT_SECONDS},
                )
            except TypeError:
                # Older SDK fallback.
                response = model.generate_content(prompt)
            text = (response.text or "").strip() if response else ""
            return {"reply": text or "No response.", "model": model_name}
        except Exception as exc:
            last_exc = exc

    raise HTTPException(status_code=502, detail=f"Gemini request failed: {last_exc}")
