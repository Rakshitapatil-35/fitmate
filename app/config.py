"""Application configuration powered by pydantic-settings and python-dotenv."""

from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralized settings loaded from environment variables or .env file."""

    APP_NAME: str = "Size Recommendation API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "sqlite:///./size_recommendation.db"

    JWT_SECRET_KEY: str = "change-this-super-secret-jwt-key-in-production-min-32-bytes"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:8000,chrome-extension://*"

    AUTH_RATE_LIMIT_REQUESTS: int = 10
    AUTH_RATE_LIMIT_WINDOW_SECONDS: int = 60

    ML_MODEL_PATH: str = "app/ml/artifacts/size_model.joblib"
    ML_ENABLED: bool = True
    ML_MIN_CONFIDENCE: float = 0.55
    EASE_CONFIG_PATH: str = "app/services/ease_config.json"
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> List[str]:
        """Parse comma-separated CORS origins into a clean list."""
        if not self.CORS_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @field_validator("ML_MIN_CONFIDENCE")
    @classmethod
    def validate_confidence(cls, value: float) -> float:
        """Ensure minimum confidence is between 0.0 and 1.0."""
        if not 0.0 <= value <= 1.0:
            raise ValueError("ML_MIN_CONFIDENCE must be between 0.0 and 1.0")
        return value


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings instance."""
    return Settings()


settings = get_settings()
