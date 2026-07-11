import os
from pydantic_settings import BaseSettings, SettingsConfigDict

# Prevent stale environment variables from overriding the values we want to use.
for key in ("DATABASE_URL", "DB_SERVER", "DB_NAME", "DB_USER", "DB_PASSWORD"):
    os.environ.pop(key, None)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        # Point to backend/.env relative to backend/core/config.py
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    DATABASE_URL: str = "mssql+pymssql://malik:admin%40123@network.database.windows.net/lab"


settings = Settings()

