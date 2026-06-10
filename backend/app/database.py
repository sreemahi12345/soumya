# database.py — thin re-export from the connection module.
# All application code should import engine, Base, SessionLocal, and get_db
# from here so import paths stay consistent.

from app.connection.connection import Base, SessionLocal, engine, get_db

__all__ = ["Base", "SessionLocal", "engine", "get_db"]
