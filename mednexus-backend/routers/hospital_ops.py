from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from models.database import HospitalState, get_db

router = APIRouter(prefix="/api/hospital", tags=["Hospital Ops"])


class BedUpdateIn(BaseModel):
    total_beds: int = Field(gt=0)
    occupied_beds: int = Field(ge=0)


@router.get("/beds")
def get_beds(db: Session = Depends(get_db)) -> dict:
    state = db.query(HospitalState).filter(HospitalState.id == 1).first()
    if not state:
        state = HospitalState(id=1, total_beds=100, occupied_beds=65)
        db.add(state)
        db.commit()
        db.refresh(state)

    available = max(state.total_beds - state.occupied_beds, 0)
    return {
        "total_beds": state.total_beds,
        "occupied_beds": state.occupied_beds,
        "available_beds": available,
        "updated_at": state.updated_at.isoformat(),
    }


@router.put("/beds")
def update_beds(payload: BedUpdateIn, db: Session = Depends(get_db)) -> dict:
    if payload.occupied_beds > payload.total_beds:
        raise HTTPException(status_code=400, detail="occupied_beds cannot be greater than total_beds")

    state = db.query(HospitalState).filter(HospitalState.id == 1).first()
    if not state:
        state = HospitalState(id=1)
        db.add(state)

    state.total_beds = payload.total_beds
    state.occupied_beds = payload.occupied_beds
    state.updated_at = datetime.now(UTC)
    db.commit()

    return {
        "total_beds": state.total_beds,
        "occupied_beds": state.occupied_beds,
        "available_beds": state.total_beds - state.occupied_beds,
        "updated_at": state.updated_at.isoformat(),
    }
