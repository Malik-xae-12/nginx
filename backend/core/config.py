import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        # Point to backend/.env relative to backend/core/config.py
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    DB_SERVER: str = r"localhost\SQLEXPRESS"
    DB_NAME: str = "TestDB"
    DB_USER: str = "migration_user"
    DB_PASSWORD: str = "Migration@123456"


settings = Settings()
