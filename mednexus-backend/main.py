from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import ai_chat

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


@app.get("/")
def root() -> dict[str, str]:
    return {
        "name": "MedNexus API",
        "version": "3.0.0",
        "status": "running",
    }


app.include_router(ai_chat.router)
