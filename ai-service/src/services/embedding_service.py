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

    results: List[List[float] | None] = [vector_cache.get(t) for t in texts]
    miss_indices = [i for i, r in enumerate(results) if r is None]
    if miss_indices:
        miss_texts = [texts[i] for i in miss_indices]
        vectors = get_model().encode(miss_texts, convert_to_numpy=True).tolist()
        for i, vec in zip(miss_indices, vectors):
            vector_cache.put(texts[i], vec)
            results[i] = vec
    return results  # type: ignore[return-value]
