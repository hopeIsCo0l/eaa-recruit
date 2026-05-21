"""Shared internal API-key dependency for FastAPI routers."""
from __future__ import annotations

from fastapi import Header, HTTPException, status

from src.config import settings


def verify_internal_api_key(
    x_internal_api_key: str | None = Header(default=None, alias="X-Internal-Api-Key"),
) -> None:
    if x_internal_api_key != settings.internal_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal API key",
        )
