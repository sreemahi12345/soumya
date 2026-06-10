from pathlib import Path

from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[1]
SQLITE_DB_PATH = BACKEND_DIR / "sowmyakka.db"
ENV_FILE_PATH = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=(str(ENV_FILE_PATH),), env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Sowmyakka Reachout API"
    app_env: str = "development"

    # Database Configuration
    # db_type options: "sqlite" (local dev) or "postgresql" (production)
    # Override by setting DB_TYPE in backend/.env
    db_type: str = "sqlite"
    
    # ========== LOCAL PostgreSQL (uncomment to use) ==========
    # db_user: str = "postgres"
    # db_password: str = "root"
    # db_host: str = "localhost"
    # db_port: int = 5432
    # db_name: str = "project"
    
    # ========== SERVER PostgreSQL (Render) - uncomment to use ==========
    db_user: str = "soumya_db_user"
    db_password: str = "jBw5SWEBA4BSId7xrL0vA5nyhUFVy3x6"
    db_host: str = "dpg-d8juqti8qa3s73bbt0e0-a"
    db_port: int = 5432
    db_name: str = "soumya_db"

    @computed_field  # type: ignore[prop-decorator]
    @property
    def database_url(self) -> str:
        if self.db_type == "sqlite":
            return f"sqlite:///{SQLITE_DB_PATH.as_posix()}"
        else:
            return (
                f"postgresql+psycopg2://{self.db_user}:{self.db_password}"
                f"@{self.db_host}:{self.db_port}/{self.db_name}"
            )

    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 465
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_use_tls: bool = False
    smtp_use_ssl: bool = True

    contact_receiver_email: str = "kanyabysoumya@gmail.com"

    frontend_origin: str = "http://localhost:3000"
    allowed_origins: str = (
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,"  # local dev
        "http://127.0.0.1:8000,https://soumyasreemahi.vercel.app"
    )

    @computed_field
    @property
    def cors_allow_origins(self) -> list[str]:
        origins = [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]
        if self.frontend_origin and self.frontend_origin not in origins:
            origins.append(self.frontend_origin)
        return origins

    # Default admin bootstrap credentials for create_admin.py
    admin_default_username: str = "sowmyakka_admin"
    admin_default_password: str = "admin@123"

    # Session token lifetime for admin login
    admin_session_minutes: int = 120


settings = Settings()
