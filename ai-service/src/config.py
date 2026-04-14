from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    sbert_model: str = "all-MiniLM-L6-v2"
    redis_url: str = "redis://localhost:6379"
    chroma_path: str = "./chroma_db"
    spring_callback_url: str = "http://localhost:8080"
    kafka_bootstrap_servers: str = "localhost:9092"
    pdf_storage_dir: str = "./reports"

    class Config:
        env_file = ".env"


settings = Settings()
