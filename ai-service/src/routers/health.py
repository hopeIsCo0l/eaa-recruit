from fastapi import APIRouter
from src.services.embedding_service import get_model

router = APIRouter()


@router.get("/")
def health_check():
    model = get_model()
    return {
        "status": "UP",
        "model": model.get_sentence_embedding_dimension(),
    }
