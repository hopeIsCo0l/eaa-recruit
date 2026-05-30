from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    sbert_model: str = "all-MiniLM-L6-v2"
    redis_url: str = "redis://localhost:6379"
    spring_callback_url: str = "http://localhost:8080"
    pdf_storage_dir: str = "./reports"
    internal_api_key: str = "change-me-internal-key"
    ai_service_public_url: str = "http://ai-service:8000"

    # Postgres (pgvector) — override via DATABASE_URL env var
    # Docker default: postgres:5432 | Local default: localhost:5432
    database_url: str = "postgresql://postgres:postgres@localhost:5432/recruitment"

    # Ollama LLM integration
    ollama_url: str = "http://ollama:11434"
    ollama_model: str = "qwen2.5:1.5b"
    ollama_enabled: bool = True  # set False to fall back to SBERT-only scoring

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
