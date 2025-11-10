from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os
from configparser import ConfigParser


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    APP_NAME: str = "MGSDB Backend"
    APP_ENV: str = "dev"
    CORS_ORIGINS: str = "*"

    # 默认从环境变量读取数据库 URL；若未设置，则尝试兼容旧 ini
    DATABASE_URL: Optional[str] = None

    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
    # 兼容旧 /etc/unikorn/unikorn-backend.ini
        ini_path = "/etc/unikorn/unikorn-backend.ini"
        if os.path.exists(ini_path):
            cfg = ConfigParser()
            cfg.read(ini_path, encoding="utf-8")
        try:
            db_user = cfg.get("postgresql", "user", fallback="postgres")
            db_pass = cfg.get("postgresql", "password", fallback="postgres")
            db_host = cfg.get("postgresql", "host", fallback="127.0.0.1")
            db_port = cfg.get("postgresql", "port", fallback="5432")
            db_name = cfg.get("postgresql", "database", fallback="mgsdb")
            return f"postgresqlpsycopg2://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"
        except Exception:
            pass
        # 最后兜底
        return "postgresqlpsycopg2://postgres:postgres@127.0.0.1:5432/mgsdb"
settings = Settings()