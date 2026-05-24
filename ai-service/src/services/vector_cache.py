import hashlib
import json
import logging
import threading
from collections import OrderedDict
from typing import Dict, List, Optional

import redis

from src.config import settings

logger = logging.getLogger(__name__)

_client: redis.Redis | None = None
CACHE_TTL_SECONDS = 60 * 60 * 24 * 7  # 7 days

# In-process LRU in front of Redis. Cuts roundtrip on hot keys
# (answer-key embeddings, repeated CV chunks during LIME perturbation).
_LRU_MAX = 2048
_lru: "OrderedDict[str, List[float]]" = OrderedDict()
_lru_lock = threading.Lock()


def _get_client() -> redis.Redis:
    global _client
    if _client is None:
        _client = redis.from_url(settings.redis_url, decode_responses=True)
    return _client


def _cache_key(text: str) -> str:
    digest = hashlib.sha256(text.encode()).hexdigest()
    return f"emb:{digest}"


def _lru_get(key: str) -> Optional[List[float]]:
    with _lru_lock:
        vec = _lru.get(key)
        if vec is not None:
            _lru.move_to_end(key)
        return vec


def _lru_put(key: str, vector: List[float]) -> None:
    with _lru_lock:
        _lru[key] = vector
        _lru.move_to_end(key)
        while len(_lru) > _LRU_MAX:
            _lru.popitem(last=False)


def get(text: str) -> Optional[List[float]]:
    key = _cache_key(text)
    hit = _lru_get(key)
    if hit is not None:
        return hit
    try:
        raw = _get_client().get(key)
        if raw:
            vec = json.loads(raw)
            _lru_put(key, vec)
            return vec
    except Exception:
        logger.warning("Vector cache GET failed — falling back to inference", exc_info=True)
    return None


def put(text: str, vector: List[float]) -> None:
    key = _cache_key(text)
    _lru_put(key, vector)
    try:
        _get_client().setex(key, CACHE_TTL_SECONDS, json.dumps(vector))
    except Exception:
        logger.warning("Vector cache PUT failed — continuing without cache", exc_info=True)


def get_many(texts: List[str]) -> Dict[str, Optional[List[float]]]:
    """Bulk fetch. Returns dict keyed by original text, value None on miss."""
    if not texts:
        return {}
    out: Dict[str, Optional[List[float]]] = {}
    redis_lookup: List[tuple[str, str]] = []  # (text, cache_key)
    for t in texts:
        key = _cache_key(t)
        hit = _lru_get(key)
        if hit is not None:
            out[t] = hit
        else:
            out[t] = None
            redis_lookup.append((t, key))

    if redis_lookup:
        try:
            raws = _get_client().mget([k for _, k in redis_lookup])
            for (t, key), raw in zip(redis_lookup, raws):
                if raw:
                    vec = json.loads(raw)
                    _lru_put(key, vec)
                    out[t] = vec
        except Exception:
            logger.warning("Vector cache MGET failed — falling back to inference", exc_info=True)
    return out


def put_many(items: List[tuple[str, List[float]]]) -> None:
    """Bulk store via Redis pipeline. Items: (text, vector)."""
    if not items:
        return
    try:
        pipe = _get_client().pipeline(transaction=False)
        for text, vector in items:
            key = _cache_key(text)
            _lru_put(key, vector)
            pipe.setex(key, CACHE_TTL_SECONDS, json.dumps(vector))
        pipe.execute()
    except Exception:
        logger.warning("Vector cache pipeline PUT failed — continuing without cache", exc_info=True)
