import logging
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from src.routers import bias, cv_scoring, grading, health, ranking, xai
from src.services.embedding_service import load_model

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s [%(request_id)s]: %(message)s",
)


class _RequestIdFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        if not hasattr(record, "request_id"):
            record.request_id = "-"
        return True


for handler in logging.getLogger().handlers:
    handler.addFilter(_RequestIdFilter())

logger = logging.getLogger(__name__)

app = FastAPI(title="EAA AI Service")


@app.on_event("startup")
def startup_event() -> None:
    load_model()


@app.middleware("http")
async def request_context(request: Request, call_next):
    req_id = request.headers.get("X-Request-Id") or uuid.uuid4().hex[:12]
    start = time.perf_counter()
    request.state.request_id = req_id
    try:
        response = await call_next(request)
    except Exception:
        logger.exception(
            "Unhandled error path=%s method=%s req_id=%s",
            request.url.path, request.method, req_id,
        )
        return JSONResponse(
            status_code=500,
            content={"error": "internal_server_error", "requestId": req_id},
            headers={"X-Request-Id": req_id},
        )
    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
    response.headers["X-Request-Id"] = req_id
    logger.info(
        "%s %s -> %s %sms req_id=%s",
        request.method, request.url.path, response.status_code, elapsed_ms, req_id,
    )
    return response


@app.exception_handler(StarletteHTTPException)
async def http_exc_handler(request: Request, exc: StarletteHTTPException):
    req_id = getattr(request.state, "request_id", "-")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "requestId": req_id},
        headers={"X-Request-Id": req_id},
    )


@app.exception_handler(RequestValidationError)
async def validation_exc_handler(request: Request, exc: RequestValidationError):
    req_id = getattr(request.state, "request_id", "-")
    return JSONResponse(
        status_code=422,
        content={"error": "validation_error", "details": exc.errors(), "requestId": req_id},
        headers={"X-Request-Id": req_id},
    )


app.include_router(health.router)
app.include_router(ranking.router)
app.include_router(bias.router)
app.include_router(cv_scoring.router)
app.include_router(grading.router)
app.include_router(xai.router)
