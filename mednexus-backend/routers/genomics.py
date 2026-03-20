import os

import google.generativeai as genai
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/genomics", tags=["Genomics"])


class GenomicsIn(BaseModel):
    variants: list[str]


def _gemini_key() -> str | None:
    return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")


@router.post("/analyze")
def analyze(payload: GenomicsIn) -> dict:
    variants = [v.strip().upper() for v in payload.variants if v.strip()]
    risk_points = sum(1 for v in variants if any(key in v for key in ["BRCA", "APOE", "TP53", "MTHFR"]))
    risk_label = "low"
    if risk_points >= 3:
        risk_label = "high"
    elif risk_points == 2:
        risk_label = "medium"

    pharmaco_alerts = []
    for v in variants:
        if "CYP2C19" in v:
            pharmaco_alerts.append("Possible clopidogrel metabolism variability.")
        if "SLCO1B1" in v:
            pharmaco_alerts.append("Potential statin myopathy susceptibility.")

    ai_summary = ""
    key = _gemini_key()
    if key:
        try:
            genai.configure(api_key=key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                "You are a clinical geneticist. Analyze these variants for disease risk and care plan: "
                f"{', '.join(variants) if variants else 'none provided'}."
            )
            response = model.generate_content(prompt)
            ai_summary = (response.text or "").strip()
        except Exception:
            ai_summary = ""

    return {
        "variants": variants,
        "risk": risk_label,
        "pharmacogenomic_alerts": pharmaco_alerts,
        "ai_summary": ai_summary,
    }
