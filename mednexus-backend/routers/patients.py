from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from models.database import Patient, get_db

router = APIRouter(prefix="/api/patients", tags=["Patients"])


class PatientIn(BaseModel):
    name: str
    age: int | None = None
    gender: str | None = None
    phone: str | None = None


@router.get("/")
def list_patients(db: Session = Depends(get_db)) -> list[dict]:
    rows = db.query(Patient).order_by(Patient.created_at.desc()).all()
    return [
        {
            "id": row.id,
            "name": row.name,
            "age": row.age,
            "gender": row.gender,
            "phone": row.phone,
            "created_at": row.created_at.isoformat() if isinstance(row.created_at, datetime) else None,
        }
        for row in rows
    ]


@router.post("/")
def create_patient(payload: PatientIn, db: Session = Depends(get_db)) -> dict:
    row = Patient(name=payload.name.strip(), age=payload.age, gender=payload.gender, phone=payload.phone)
    db.add(row)
    db.commit()
    db.refresh(row)
    return {
        "id": row.id,
        "name": row.name,
        "age": row.age,
        "gender": row.gender,
        "phone": row.phone,
    }
