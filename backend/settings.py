from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os
from configparser import ConfigParser
from urllib.parse import quote


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    APP_NAME: str = "MGSDB Backend"
    APP_ENV: str = os.getenv("APP_ENV", "dev")  # dev | prod | staging
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change_me_in_env")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24)))
    REFRESH_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 14)))

    AUTH_COOKIE_DOMAIN: Optional[str] = None
    AUTH_COOKIE_PATH: str = "/"
    AUTH_COOKIE_SAMESITE: str = "lax"
    AUTH_COOKIE_SECURE: Optional[bool] = None

    # Allow full URL or split env vars
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")

    # DB tuning knobs (used by create_engine elsewhere)
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "5"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "10"))
    DB_POOL_TIMEOUT: int = int(os.getenv("DB_POOL_TIMEOUT", "30"))
    DB_POOL_RECYCLE: int = int(os.getenv("DB_POOL_RECYCLE", "1800"))  # 30m
    DB_ECHO: bool = os.getenv("DB_ECHO", "0") == "1"

    # MinIO (object storage) configuration (optional)
    MINIO_ENDPOINT: Optional[str] = os.getenv("MINIO_ENDPOINT")
    MINIO_ACCESS_KEY: Optional[str] = os.getenv("MINIO_ACCESS_KEY")
    MINIO_SECRET_KEY: Optional[str] = os.getenv("MINIO_SECRET_KEY")
    MINIO_BUCKET: Optional[str] = os.getenv("MINIO_BUCKET")
    MINIO_USE_SSL: bool = os.getenv("MINIO_USE_SSL", "1") == "1"

    def _load_prod_ini(self):  # internal helper
        ini_path = "/etc/unikorn/unikorn-backend.ini"
        if not (self.APP_ENV == "prod" and os.path.exists(ini_path)):
            return
        try:
            cfg = ConfigParser()
            cfg.read(ini_path, encoding="utf-8")
            # override only if not already provided via env
            if not self.DATABASE_URL:
                self.DATABASE_URL = self._compose_url(
                    cfg.get("unikorn", "user", fallback="unikorn"),
                    cfg.get("unikorn", "database_pw", fallback="123456"),
                    cfg.get("unikorn", "db_host", fallback="127.0.0.1"),
                    cfg.get("unikorn", "port", fallback="5432"),
                    cfg.get("unikorn", "database", fallback="unikorn"),
                )
            # MinIO
            self.MINIO_ENDPOINT = self.MINIO_ENDPOINT or cfg.get("minio", "endpoint", fallback=None)
            self.MINIO_ACCESS_KEY = self.MINIO_ACCESS_KEY or cfg.get("minio", "access_key", fallback=None)
            self.MINIO_SECRET_KEY = self.MINIO_SECRET_KEY or cfg.get("minio", "secret_key", fallback=None)
            self.MINIO_BUCKET = self.MINIO_BUCKET or cfg.get("minio", "bucket", fallback=None)
            if not os.getenv("MINIO_USE_SSL"):
                use_ssl = cfg.get("minio", "use_ssl", fallback="false").lower() == "true"
                self.MINIO_USE_SSL = use_ssl
            # Tokens / app
            if self.SECRET_KEY == "change_me_in_env":
                self.SECRET_KEY = cfg.get("app", "secret_key", fallback=self.SECRET_KEY)
            if os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES") is None:
                self.ACCESS_TOKEN_EXPIRE_MINUTES = int(cfg.get("app", "access_token_expire_minutes", fallback=str(self.ACCESS_TOKEN_EXPIRE_MINUTES)))
            if os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES") is None:
                self.REFRESH_TOKEN_EXPIRE_MINUTES = int(cfg.get("app", "refresh_token_expire_minutes", fallback=str(self.REFRESH_TOKEN_EXPIRE_MINUTES)))
            if os.getenv("CORS_ORIGINS") is None:
                self.CORS_ORIGINS = cfg.get("app", "cors_origins", fallback=self.CORS_ORIGINS)
            # DB pool
            if os.getenv("DB_POOL_SIZE") is None:
                self.DB_POOL_SIZE = int(cfg.get("db_pool", "pool_size", fallback=str(self.DB_POOL_SIZE)))
            if os.getenv("DB_MAX_OVERFLOW") is None:
                self.DB_MAX_OVERFLOW = int(cfg.get("db_pool", "max_overflow", fallback=str(self.DB_MAX_OVERFLOW)))
            if os.getenv("DB_POOL_TIMEOUT") is None:
                self.DB_POOL_TIMEOUT = int(cfg.get("db_pool", "pool_timeout", fallback=str(self.DB_POOL_TIMEOUT)))
            if os.getenv("DB_POOL_RECYCLE") is None:
                self.DB_POOL_RECYCLE = int(cfg.get("db_pool", "pool_recycle", fallback=str(self.DB_POOL_RECYCLE)))
            if os.getenv("DB_ECHO") is None:
                self.DB_ECHO = cfg.get("db_pool", "echo", fallback="0") == "1"
        except Exception:
            pass

    @staticmethod
    def _compose_url(user: str, password: str, host: str, port: str, database: str) -> str:
        # URL-encode credentials to avoid parsing errors when password contains '@', ':' etc.
        return f"postgresql+psycopg://{quote(user)}:{quote(password)}@{host}:{port}/{database}"

    def get_database_url(self) -> str:
        # 1. 完整 URL
        if self.DATABASE_URL:
            return self._sanitize_full_url(self.DATABASE_URL)

        # 2. 分散式变量
        u = os.getenv("DB_USER")
        p = os.getenv("DB_PASSWORD")
        if u and p:
            h = os.getenv("DB_HOST", "127.0.0.1")
            port = os.getenv("DB_PORT", "5432")
            dbn = os.getenv("DB_NAME", "unikorn")
            return self._compose_url(u, p, h, port, dbn)

        # 3. ini 文件
        ini_path = "/etc/unikorn/unikorn-backend.ini"
        if os.path.exists(ini_path):
            try:
                cfg = ConfigParser()
                cfg.read(ini_path, encoding="utf-8")
                return self._compose_url(
                    cfg.get("postgresql", "user", fallback="unikorn"),
                    cfg.get("postgresql", "password", fallback="123456"),
                    cfg.get("postgresql", "host", fallback="127.0.0.1"),
                    cfg.get("postgresql", "port", fallback="5432"),
                    cfg.get("postgresql", "database", fallback="unikorn"),
                )
            except Exception:
                pass

        # 4. 默认
        return self._compose_url("unikorn", "123456", "127.0.0.1", "5432", "unikorn")

    @staticmethod
    def _sanitize_full_url(raw: str) -> str:
        """如果用户直接提供完整 DATABASE_URL，其中密码含未编码的 '@'，进行编码。
        仅在出现多个 '@' 且用户信息部分未包含 %40 时处理。
        """
        try:
            if '://' not in raw:
                return raw
            scheme_end = raw.index('://') + 3
            # 定位最后一个 '@' 分隔 userinfo 与 host
            ats = [i for i, ch in enumerate(raw) if ch == '@']
            if len(ats) < 2:
                return raw
            last_at = ats[-1]
            userinfo = raw[scheme_end:last_at]
            if '%40' in userinfo:
                return raw  # 已编码
            if ':' not in userinfo:
                return raw
            user, password = userinfo.split(':', 1)
            # URL 编码
            encoded = f"{quote(user)}:{quote(password)}"
            return raw[:scheme_end] + encoded + raw[last_at:]
        except Exception:
            return raw


settings = Settings()
settings._load_prod_ini()

# --- Logging bootstrap (simple) ---
def configure_logging():
    import logging
    from logging.handlers import RotatingFileHandler
    level = logging.INFO if settings.APP_ENV == "prod" else logging.DEBUG
    root = logging.getLogger()
    if not root.handlers:
        log_dir = os.getenv("LOG_DIR", "/var/log/unikorn")
        try:
            os.makedirs(log_dir, exist_ok=True)
            handler = RotatingFileHandler(os.path.join(log_dir, "backend.log"), maxBytes=5*1024*1024, backupCount=3, encoding="utf-8")
        except Exception:
            handler = logging.StreamHandler()
        fmt = logging.Formatter("[%(asctime)s] %(levelname)s %(name)s: %(message)s")
        handler.setFormatter(fmt)
        root.setLevel(level)
        root.addHandler(handler)

configure_logging()