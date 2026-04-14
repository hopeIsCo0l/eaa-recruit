import logging
from typing import List

from src.services import vector_cache
from src.services.embedding_service import embed

logger = logging.getLogger(__name__)


def store_answer_key(question_id: str, ideal_answer: str) -> List[float]:
    """Embed the ideal answer and cache it keyed by question_id."""
    vector = embed(ideal_answer)
    vector_cache.put(f"answerkey:{question_id}", vector)
    logger.info("Answer key embedding stored for question_id=%s", question_id)
    return vector


def get_answer_key_embedding(question_id: str, ideal_answer: str) -> List[float]:
    """Return cached embedding, or generate and cache if missing."""
    cached = vector_cache.get(f"answerkey:{question_id}")
    if cached:
        return cached
    return store_answer_key(question_id, ideal_answer)
