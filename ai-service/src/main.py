import logging
import uuid

from fastapi import FastAPI, Request
from pythonjsonlogger import jsonlogger

from src.routers import bias, health, ranking
from src.services.embedding_service import load_model
from src.services.kafka_consumer import start_consumer

_handler = logging.StreamHandler()
_handler.setFormatter(jsonlogger.JsonFormatter("%(asctime)s %(levelname)s %(name)s %(message)s"))
logging.root.setLevel(logging.INFO)
logging.root.handlers = [_handler]

app = FastAPI(title="EAA AI Service")

_CORRELATION_HEADER = "X-Correlation-ID"


@app.middleware("http")
async def correlation_id_middleware(request: Request, call_next):
    correlation_id = request.headers.get(_CORRELATION_HEADER) or str(uuid.uuid4())
    response = await call_next(request)
    response.headers[_CORRELATION_HEADER] = correlation_id
    return response


@app.on_event("startup")
def startup_event() -> None:
    load_model()
    start_consumer()


app.include_router(health.router)
app.include_router(ranking.router)
app.include_router(bias.router)
