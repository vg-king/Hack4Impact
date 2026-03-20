import itertools
import json
import os

import google.generativeai as genai
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from models.database import DrugCheckRecord, get_db

router = APIRouter(prefix="/api/drugs", tags=["Drug Interactions"])


class DrugCheckIn(BaseModel):
    drugs: list[str] = Field(min_length=2)
    patient_id: int | None = None


def _gemini_key() -> str | None:
    return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")


KNOWN = {
    frozenset(["warfarin", "aspirin"]): ("high", "Bleeding risk increases significantly."),
    frozenset(["ibuprofen", "lisinopril"]): ("moderate", "May reduce antihypertensive effect and impact renal perfusion."),
    frozenset(["metformin", "contrast"]): ("high", "Risk of lactic acidosis in renal stress contexts."),
}


@router.post("/check")
def check(payload: DrugCheckIn, db: Session = Depends(get_db)) -> dict:
    normalized = [d.strip().lower() for d in payload.drugs if d.strip()]
    pairs = list(itertools.combinations(normalized, 2))
    interactions = []

    for a, b in pairs:
        severity, summary = KNOWN.get(frozenset([a, b]), ("low", "No major interaction in quick ruleset."))
        interactions.append({"pair": [a, b], "severity": severity, "summary": summary})

    ai_notes = ""
    key = _gemini_key()
    if key:
        try:
            genai.configure(api_key=key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                "You are a clinical pharmacologist. Given these drugs: "
                f"{', '.join(normalized)}. Summarize top interaction concerns and management in 5 bullets."
            )
            response = model.generate_content(prompt)
            ai_notes = (response.text or "").strip()
        except Exception:
            ai_notes = ""

    result = {"interactions": interactions, "ai_notes": ai_notes}

    row = DrugCheckRecord(
        patient_id=payload.patient_id,
        drugs_json=json.dumps(normalized),
        result_json=json.dumps(result),
    )
    db.add(row)
    db.commit()

    return result
