import base64
import io
import os
from pathlib import Path
from uuid import uuid4

import google.generativeai as genai
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from PIL import Image

router = APIRouter(prefix="/api/cv", tags=["CV Detection"])


def _gemini_key() -> str | None:
    return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")


def _pick_model(category: str) -> Path | None:
    category_key = category.lower()
    mapping = {
        "skin": os.getenv("YOLO_SKIN_MODEL", "ml/yolov8_skin.pt"),
        "eye": os.getenv("YOLO_EYE_MODEL", "ml/yolov8_eye.pt"),
        "xray": os.getenv("YOLO_XRAY_MODEL", "ml/yolov8_xray.pt"),
        "wound": os.getenv("YOLO_WOUND_MODEL", "ml/yolov8_wound.pt"),
    }
    model_path = Path(mapping.get(category_key, ""))
    if model_path.exists():
        return model_path
    return None


@router.post("/detect")
async def detect(file: UploadFile = File(...), category: str = Form("skin")) -> dict:
    suffix = Path(file.filename or "upload.jpg").suffix or ".jpg"
    out_name = f"{uuid4().hex}{suffix}"
    out_path = Path("uploads") / out_name

    raw = await file.read()
    out_path.write_bytes(raw)

    detections: list[dict] = []
    yolo_used = False

    model_path = _pick_model(category)
    if model_path:
        try:
            from ultralytics import YOLO

            model = YOLO(str(model_path))
            results = model.predict(str(out_path), verbose=False)
            yolo_used = True

            if results:
                result = results[0]
                names = result.names or {}
                for box in result.boxes:
                    cls = int(box.cls[0]) if box.cls is not None else -1
                    conf = float(box.conf[0]) if box.conf is not None else 0.0
                    x1, y1, x2, y2 = [float(v) for v in box.xyxy[0].tolist()]
                    detections.append(
                        {
                            "condition": names.get(cls, f"class_{cls}"),
                            "confidence": round(conf * 100, 2),
                            "bbox": [x1, y1, x2, y2],
                        }
                    )
        except Exception:
            yolo_used = False

    ai_summary = "Gemini analysis unavailable."
    key = _gemini_key()
    if key:
        try:
            genai.configure(api_key=key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            image = Image.open(io.BytesIO(raw))
            prompt = (
                f"Analyze this {category} clinical image. Provide key findings, risk flags, "
                "and immediate next steps in concise bullet points."
            )
            response = model.generate_content([prompt, image])
            ai_summary = (response.text or "").strip() or ai_summary
        except Exception:
            pass

    return {
        "filename": file.filename,
        "saved_as": str(out_path),
        "category": category,
        "yolo_used": yolo_used,
        "detections": detections,
        "ai_summary": ai_summary,
    }
