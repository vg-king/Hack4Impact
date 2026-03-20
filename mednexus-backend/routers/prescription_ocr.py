import io
import json
import os
from pathlib import Path
from uuid import uuid4

import google.generativeai as genai
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from PIL import Image
from sqlalchemy.orm import Session

from models.database import PrescriptionRecord, get_db

router = APIRouter(prefix="/api/prescription", tags=["Prescription OCR"])


def _gemini_key() -> str | None:
    return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")


@router.post("/parse")
async def parse_prescription(
    file: UploadFile = File(...),
    patient_id: int | None = None,
    db: Session = Depends(get_db),
) -> dict:
    suffix = Path(file.filename or "prescription.jpg").suffix or ".jpg"
    out_name = f"rx_{uuid4().hex}{suffix}"
    out_path = Path("uploads") / out_name

    raw = await file.read()
    out_path.write_bytes(raw)

    key = _gemini_key()
    if not key:
        raise HTTPException(status_code=500, detail="Missing Gemini API key in backend .env")

    genai.configure(api_key=key)
    model = genai.GenerativeModel("gemini-1.5-flash")

    image = Image.open(io.BytesIO(raw))
    prompt = (
        "Read this handwritten prescription image and return strict JSON only with keys: "
        "doctor, date, drugs, diagnosis, confidence, flags."
    )

    try:
        response = model.generate_content([prompt, image])
        text = (response.text or "").strip()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini OCR request failed: {exc}") from exc

    normalized = text.removeprefix("```json").removesuffix("```").strip()
    parsed = {"raw": text}
    try:
        parsed = json.loads(normalized)
    except Exception:
        pass

    record = PrescriptionRecord(
        patient_id=patient_id,
        raw_text=text,
        structured_json=json.dumps(parsed),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "record_id": record.id,
        "filename": file.filename,
        "saved_as": str(out_path),
        "result": parsed,
    }
