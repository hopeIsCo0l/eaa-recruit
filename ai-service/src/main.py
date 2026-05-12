import logging

from fastapi import FastAPI

from src.routers import bias, cv_scoring, health, ranking
from src.services.embedding_service import load_model

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

app = FastAPI(title="EAA AI Service")


@app.on_event("startup")
def startup_event() -> None:
    load_model()


app.include_router(health.router)
app.include_router(ranking.router)
app.include_router(bias.router)
app.include_router(cv_scoring.router)
