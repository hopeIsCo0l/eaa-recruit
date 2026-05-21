from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    sbert_model: str = "all-MiniLM-L6-v2"
    redis_url: str = "redis://localhost:6379"
    spring_callback_url: str = "http://localhost:8080"
    pdf_storage_dir: str = "./reports"
    internal_api_key: str = "change-me-internal-key"
    ai_service_public_url: str = "http://ai-service:8000"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
