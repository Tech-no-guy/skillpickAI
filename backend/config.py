from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash-exp"
    DATABASE_URL: str = "sqlite:///./skillpick.db"
    BACKEND_CORS_ORIGINS: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()


def get_cors_origins() -> List[str]:
    raw = settings.BACKEND_CORS_ORIGINS
    return [o.strip() for o in raw.split(",") if o.strip()]
