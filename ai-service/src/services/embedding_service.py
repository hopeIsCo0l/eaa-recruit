import logging
from typing import List

from sentence_transformers import SentenceTransformer

from src.config import settings

logger = logging.getLogger(__name__)

_model: SentenceTransformer | None = None


def load_model() -> None:
    global _model
    logger.info("Loading SBERT model: %s", settings.sbert_model)
    try:
        _model = SentenceTransformer(settings.sbert_model)
        # Warm-up pass so the first real request isn't slow
        _model.encode("warmup")
        logger.info("SBERT model loaded successfully")
    except Exception:
        logger.exception("Failed to load SBERT model '%s'", settings.sbert_model)
        raise


def get_model() -> SentenceTransformer:
    if _model is None:
        raise RuntimeError("Embedding model is not loaded")
    return _model


def embed(text: str) -> List[float]:
    from src.services import vector_cache

    cached = vector_cache.get(text)
    if cached is not None:
        return cached
    vector = get_model().encode(text, convert_to_numpy=True).tolist()
    vector_cache.put(text, vector)
    return vector


def embed_batch(texts: List[str]) -> List[List[float]]:
    from src.services import vector_cache

    if not texts:
        return []

    cached = vector_cache.get_many(texts)

    # Dedupe miss texts so the model encodes each unique text once.
    miss_unique: List[str] = []
    seen: set[str] = set()
    for t in texts:
        if cached.get(t) is None and t not in seen:
            seen.add(t)
            miss_unique.append(t)

    if miss_unique:
        vectors = get_model().encode(
            miss_unique, convert_to_numpy=True, batch_size=32, show_progress_bar=False
        ).tolist()
        vector_cache.put_many(list(zip(miss_unique, vectors)))
        for t, v in zip(miss_unique, vectors):
            cached[t] = v

    return [cached[t] for t in texts]  # type: ignore[return-value]
