import hashlib
import json
import logging
from typing import List, Optional

import redis

from src.config import settings

logger = logging.getLogger(__name__)

_client: redis.Redis | None = None
CACHE_TTL_SECONDS = 60 * 60 * 24 * 7  # 7 days


def _get_client() -> redis.Redis:
    global _client
    if _client is None:
        _client = redis.from_url(settings.redis_url, decode_responses=True)
    return _client


def _cache_key(text: str) -> str:
    digest = hashlib.sha256(text.encode()).hexdigest()
    return f"emb:{digest}"


def get(text: str) -> Optional[List[float]]:
    try:
        raw = _get_client().get(_cache_key(text))
        if raw:
            return json.loads(raw)
    except Exception:
        logger.warning("Vector cache GET failed — falling back to inference", exc_info=True)
    return None


def put(text: str, vector: List[float]) -> None:
    try:
        _get_client().setex(_cache_key(text), CACHE_TTL_SECONDS, json.dumps(vector))
    except Exception:
        logger.warning("Vector cache PUT failed — continuing without cache", exc_info=True)
