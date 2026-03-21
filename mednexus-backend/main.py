from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models.database import Base, engine
from routers import (
    ai_chat,
    auth,
    cv_detection,
    drug_interactions,
    emergency,
    genomics,
    hospital_ops,
    iot_vitals,
    patients,
    prescription_ocr,
)

BACKEND_ROOT = Path(__file__).resolve().parent
load_dotenv(BACKEND_ROOT / ".env")

app = FastAPI(title="MedNexus API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    Path("uploads").mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "name": "MedNexus API",
        "version": "3.0.0",
        "team": "Team Nemesis - HACK4IMPACT 2026",
        "docs": "/docs",
        "status": "running",
    }


app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(ai_chat.router)
app.include_router(cv_detection.router)
app.include_router(prescription_ocr.router)
app.include_router(drug_interactions.router)
app.include_router(genomics.router)
app.include_router(iot_vitals.router)
app.include_router(hospital_ops.router)
app.include_router(emergency.router)
