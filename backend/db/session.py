import urllib.parse
from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.config import settings

# Raw ODBC connection string using Pydantic Settings
CONNECTION_STRING = (
    f"DRIVER={{ODBC Driver 18 for SQL Server}};"
    f"SERVER={settings.DB_SERVER};"
    f"DATABASE={settings.DB_NAME};"
    f"UID={settings.DB_USER};"
    f"PWD={settings.DB_PASSWORD};"
    f"TrustServerCertificate=yes;"
    f"Connection Timeout=30;"
)

# Convert connection string for SQLAlchemy
params = urllib.parse.quote_plus(CONNECTION_STRING)
DATABASE_URL = f"mssql+pyodbc:///?odbc_connect={params}"

# Create engine and sessionmaker
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=1800,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI generator dependency to yield database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_ctx():
    """Context manager helper for SQLAlchemy database sessions with auto-commit (for offline scripts)."""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
