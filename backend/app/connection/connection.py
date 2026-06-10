"""
Database connection module supporting both SQLite and PostgreSQL.

Provides:
  - engine        — SQLAlchemy Engine
  - SessionLocal  — Session factory
  - Base          — Declarative base for all ORM models
  - get_db()      — FastAPI dependency that yields a DB session
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------
if settings.db_type == "sqlite":
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False},
        echo=(settings.app_env == "development"),
    )
else:
    # PostgreSQL
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        echo=(settings.app_env == "development"),
    )

# ---------------------------------------------------------------------------
# Session factory
# ---------------------------------------------------------------------------
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ---------------------------------------------------------------------------
# Declarative base (shared by all ORM models)
# ---------------------------------------------------------------------------
Base = declarative_base()


# ---------------------------------------------------------------------------
# FastAPI dependency
# ---------------------------------------------------------------------------
def get_db():
    """Yield a SQLAlchemy session and guarantee it is closed afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# Connectivity check (called once at startup from main.py)
# ---------------------------------------------------------------------------
def verify_connection() -> None:
    """Raise an exception if the database is unreachable."""
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
