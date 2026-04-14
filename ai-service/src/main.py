import logging

from fastapi import FastAPI

from src.routers import bias, health, ranking
from src.services.embedding_service import load_model
from src.services.kafka_consumer import start_consumer

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

app = FastAPI(title="EAA AI Service")


@app.on_event("startup")
def startup_event() -> None:
    load_model()
    start_consumer()


app.include_router(health.router)
app.include_router(ranking.router)
app.include_router(bias.router)
