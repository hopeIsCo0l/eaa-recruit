"""Redis-backed cache for preprocessed CV text.

Stashes the masked + tokenised CV text produced by `_process_cv` so the XAI
report builder can recover it later without re-extracting the file.
"""
from __future__ import annotations

import logging
from typing import Optional

import redis

from src.config import settings

logger = logging.getLogger(__name__)

CACHE_TTL_SECONDS = 86_400  # 24h — long enough to span an interview cycle
KEY_PREFIX = "cv-text:"

_client: redis.Redis | None = None


def _get_client() -> redis.Redis:
    global _client
    if _client is None:
        _client = redis.from_url(settings.redis_url, decode_responses=True)
    return _client


def _key(application_id: int) -> str:
    return f"{KEY_PREFIX}{application_id}"


def put(application_id: int, text: str) -> None:
    try:
        _get_client().setex(_key(application_id), CACHE_TTL_SECONDS, text)
    except redis.RedisError as exc:
        logger.warning("Redis put failed for cv-text applicationId=%s: %s", application_id, exc)


def get(application_id: int) -> Optional[str]:
    try:
        return _get_client().get(_key(application_id))
    except redis.RedisError as exc:
        logger.warning("Redis get failed for cv-text applicationId=%s: %s", application_id, exc)
        return None
