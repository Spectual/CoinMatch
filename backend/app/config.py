from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration loaded from environment variables."""

    app_name: str = "CoinMatch API"
    secret_key: str = "change-this-key"
    database_url: str = "sqlite:///./coinmatch.db"
    debug: bool = True
    token_expiry_minutes: int = 8 * 60
    cors_origins: list[str] = [
        "http://127.0.0.1:5173",
        "http://localhost:5173"
    ]

    model_config = SettingsConfigDict(
        env_prefix="coinmatch_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()

