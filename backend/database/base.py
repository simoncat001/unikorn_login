from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import config
import os, socket, logging
from sqlalchemy.engine import make_url

logger = logging.getLogger("db.init")
if not logger.handlers:
	logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s %(name)s: %(message)s")

# 原始 URL（可能包含不可解析的主机名）
_raw_url = config.SQLALCHEMY_DATABASE_URL

try:
	url_obj = make_url(_raw_url)
	host = url_obj.host
	if host:
		try:
			# 仅解析，不实际连接端口；失败则触发回退
			socket.getaddrinfo(host, None)
		except socket.gaierror:
			fallback_host = os.getenv("DB_FALLBACK_HOST", "127.0.0.1")
			logger.warning(f"[DB] Hostname '{host}' unresolved; falling back to {fallback_host}")
			url_obj = url_obj.set(host=fallback_host)
			_raw_url = str(url_obj)
except Exception as e:
	logger.warning(f"[DB] Unable to inspect database URL for fallback: {e}")

# 创建引擎，启用 pool_pre_ping 以自动剔除失效连接
engine = create_engine(_raw_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
