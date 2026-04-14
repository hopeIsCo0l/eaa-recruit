"""
Health check endpoint (FR-77).

GET /health → { status, modelLoaded, cpuUsagePercent, ramUsageMb, gpuMemoryMb }

status is "UP" when the SBERT model is loaded, "DEGRADED" otherwise.
gpuMemoryMb is omitted when no CUDA device is available.
"""

import logging

import psutil
from fastapi import APIRouter

logger = logging.getLogger(__name__)

router = APIRouter()


def _gpu_memory_mb() -> float | None:
    """Return allocated GPU memory in MB, or None if CUDA unavailable."""
    try:
        import torch

        if torch.cuda.is_available():
            return round(torch.cuda.memory_allocated() / (1024 ** 2), 2)
    except Exception:
        logger.debug("GPU memory check failed", exc_info=True)
    return None


@router.get("/health")
def health_check():
    from src.services.embedding_service import _model

    model_loaded = _model is not None
    status = "UP" if model_loaded else "DEGRADED"

    proc = psutil.Process()
    ram_mb = round(proc.memory_info().rss / (1024 ** 2), 2)
    cpu_pct = round(psutil.cpu_percent(interval=None), 2)

    response: dict = {
        "status": status,
        "modelLoaded": model_loaded,
        "cpuUsagePercent": cpu_pct,
        "ramUsageMb": ram_mb,
    }

    gpu_mb = _gpu_memory_mb()
    if gpu_mb is not None:
        response["gpuMemoryMb"] = gpu_mb

    return response
