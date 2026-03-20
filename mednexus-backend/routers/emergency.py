import math
from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from models.database import EmergencyEvent, get_db

router = APIRouter(prefix="/api/emergency", tags=["Emergency"])


class SOSIn(BaseModel):
    patient_name: str | None = None
    lat: float | None = None
    lng: float | None = None
    message: str | None = "Emergency assistance needed"


HOSPITALS = [
    {"name": "KIIT Medical Emergency", "lat": 20.3537, "lng": 85.8167},
    {"name": "Bhubaneswar City ER", "lat": 20.2961, "lng": 85.8245},
    {"name": "Capital Trauma Center", "lat": 20.2855, "lng": 85.8342},
]


def _distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    return 2 * radius * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.post("/sos")
def sos(payload: SOSIn, db: Session = Depends(get_db)) -> dict:
    event = EmergencyEvent(
        patient_name=payload.patient_name,
        lat=payload.lat,
        lng=payload.lng,
        message=payload.message,
        status="dispatched",
        created_at=datetime.now(UTC),
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    return {
        "event_id": event.id,
        "status": event.status,
        "message": "SOS dispatched to nearest response unit",
    }


@router.get("/nearest-hospitals")
def nearest_hospitals(lat: float, lng: float) -> dict:
    ranked = []
    for h in HOSPITALS:
        dist = _distance_km(lat, lng, h["lat"], h["lng"])
        ranked.append({**h, "distance_km": round(dist, 2)})

    ranked.sort(key=lambda x: x["distance_km"])
    return {"count": len(ranked), "hospitals": ranked}
