"""
Create admin table and seed a default admin user.

Run:
    python create_admin.py
"""

import logging
import os
import sys

if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

from sqlalchemy import inspect

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.models import AdminUser
from app.services.admin_auth import hash_password


def create_or_update_admin() -> None:
    print(f"Using database URL: {settings.database_url}")
    inspector = inspect(engine)
    expected_tables = sorted(Base.metadata.tables.keys())
    existing_before = set(inspector.get_table_names())
    Base.metadata.create_all(bind=engine)
    table_names = sorted(inspect(engine).get_table_names())
    created_tables = [table for table in expected_tables if table not in existing_before]
    if created_tables:
        logger.info("Created tables: %s", ", ".join(created_tables))
    else:
        logger.info("No new tables were created. All expected tables already existed.")
    if table_names:
        logger.info("Tables available: %s", ", ".join(sorted(table_names)))
    else:
        logger.warning("No tables found after create_all().")

    db = SessionLocal()
    try:
        username = settings.admin_default_username
        password_hash = hash_password(settings.admin_default_password)

        admin = db.query(AdminUser).filter(AdminUser.username == username).first()
        if admin:
            admin.password_hash = password_hash
            db.commit()
            logger.info("Updated admin user: %s", username)
            return

        db.add(AdminUser(username=username, password_hash=password_hash))
        db.commit()
        logger.info("Created admin user: %s", username)
    finally:
        db.close()


if __name__ == "__main__":
    create_or_update_admin()
