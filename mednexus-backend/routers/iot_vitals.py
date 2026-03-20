import asyncio
import random
from datetime import datetime

from fastapi import APIRouter, Depends, WebSocket
from pydantic import BaseModel
from sqlalchemy.orm import Session

from models.database import Vital, get_db

router = APIRouter(prefix="/api/iot", tags=["IoT Vitals"])


class VitalsIn(BaseModel):
    patient_id: int
    heart_rate: int | None = None
    spo2: int | None = None
    temperature: float | None = None
    steps: int | None = None


@router.post("/vitals")
def save_vitals(payload: VitalsIn, db: Session = Depends(get_db)) -> dict:
    row = Vital(
        patient_id=payload.patient_id,
        heart_rate=payload.heart_rate,
        spo2=payload.spo2,
        temperature=payload.temperature,
        steps=payload.steps,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {
        "id": row.id,
        "patient_id": row.patient_id,
        "heart_rate": row.heart_rate,
        "spo2": row.spo2,
        "temperature": row.temperature,
        "steps": row.steps,
        "recorded_at": row.recorded_at.isoformat(),
    }


@router.get("/vitals/{patient_id}")
def get_vitals(patient_id: int, db: Session = Depends(get_db)) -> list[dict]:
    rows = (
        db.query(Vital)
        .filter(Vital.patient_id == patient_id)
        .order_by(Vital.recorded_at.desc())
        .limit(100)
        .all()
    )
    return [
        {
            "id": r.id,
            "patient_id": r.patient_id,
            "heart_rate": r.heart_rate,
            "spo2": r.spo2,
            "temperature": r.temperature,
            "steps": r.steps,
            "recorded_at": r.recorded_at.isoformat() if isinstance(r.recorded_at, datetime) else None,
        }
        for r in rows
    ]


@router.websocket("/live/{patient_id}")
async def live_vitals(websocket: WebSocket, patient_id: int) -> None:
    await websocket.accept()
    while True:
        sample = {
            "patient_id": patient_id,
            "heart_rate": random.randint(66, 92),
            "spo2": random.randint(95, 100),
            "temperature": round(random.uniform(97.1, 99.3), 1),
            "steps": random.randint(1200, 9000),
            "timestamp": datetime.utcnow().isoformat(),
        }
        await websocket.send_json(sample)
        await asyncio.sleep(1)
