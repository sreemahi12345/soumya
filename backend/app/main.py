import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect

from app.config import settings
from app.database import Base, engine
from app.connection.connection import verify_connection
from app import models as _models  # noqa: F401 — ensures models are registered on Base
from app.routers.admin import router as admin_router
from app.routers.contact import router as contact_router
from app.routers.products import router as products_router
from create_admin import create_or_update_admin

logger = logging.getLogger("uvicorn.error")

app = FastAPI(title=settings.app_name)

# CORS Configuration - Must be added first
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

app.include_router(contact_router)
app.include_router(admin_router)
app.include_router(products_router)


@app.on_event("startup")
def on_startup():
    logger.info("Verifying database connection...")
    verify_connection()
    logger.info("Database connection established.")
    inspector = inspect(engine)
    expected_tables = sorted(Base.metadata.tables.keys())
    existing_before = set(inspector.get_table_names())
    # Create all tables after confirming the connection is live
    Base.metadata.create_all(bind=engine)
    table_names = sorted(inspect(engine).get_table_names())
    created_tables = [table for table in expected_tables if table not in existing_before]
    if created_tables:
        logger.info("Created missing tables: %s", ", ".join(created_tables))
    else:
        logger.info("No new tables were created. All expected tables already existed.")
    if table_names:
        logger.info("Database tables available: %s", ", ".join(table_names))
    else:
        logger.warning("No database tables were found after startup.")

    logger.info("Ensuring admin user is present...")
    create_or_update_admin()
    logger.info("Admin bootstrap completed.")


@app.get("/")
def health_check():
    return {"status": "ok", "service": settings.app_name}
