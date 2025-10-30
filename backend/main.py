from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from settings import settings
from database.base import engine
from sqlalchemy import text
import logging, re
from api import (
    word,
    template,
    search,
    development_data,
    country,
    organization,
    admin,
    MGID_apply,
    user,
)
import uvicorn

# 配置全局日志，确保能打印到文件
logger = logging.getLogger("mgsdb")
logger.setLevel(logging.INFO)

# 检查是否已经有处理器，如果没有则添加
if not logger.handlers:
    # 创建控制台处理器
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter("[%(asctime)s] %(levelname)s %(name)s: %(message)s")
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    # 创建文件处理器，确保日志可以打印
    try:
        file_handler = logging.FileHandler('backend.log', encoding='utf-8')
        file_handler.setLevel(logging.INFO)
        file_formatter = logging.Formatter("[%(asctime)s] %(levelname)s %(name)s: %(message)s")
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)
        print("全局日志文件处理器初始化成功")
    except Exception as e:
        print(f"无法创建全局日志文件: {e}，将仅使用控制台输出")

# 获取启动日志记录器
logger = logging.getLogger("mgsdb.startup")


def _diagnose_unicode_error(exc: Exception) -> str:
    msg = str(exc)
    # 尝试捕获形如 byte 0x.. 的片段
    hex_bytes = re.findall(r"0x([0-9a-fA-F]{2})", msg)
    hint = []
    if hex_bytes:
        hint.append(f"raw_bytes={','.join(hex_bytes)}")
    hint.append("Check: 1) 密码/用户名是否包含非 UTF-8 可编码字符 2) 环境变量编码 3) 终端/容器 locale")
    return " | ".join(hint)


def _dump_env_bytes():
    import os, binascii
    vars_to_check = ["DB_USER", "DB_PASSWORD", "DB_HOST", "DB_NAME", "DATABASE_URL"]
    out = {}
    for k in vars_to_check:
        v = os.getenv(k)
        if v is None:
            continue
        try:
            raw = v.encode('utf-8')  # encode to bytes (always succeeds for str in Py)
            out[k] = {
                "repr": repr(v),
                "hex": binascii.hexlify(raw).decode('ascii'),
                "len": len(raw),
            }
        except Exception as e:  # unlikely
            out[k] = {"error": str(e)}
    return out


def _attempt_simple_connection():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("[DB] Simple SELECT 1 success before create_all")
        return True
    except UnicodeDecodeError as ue:  # 更精确捕获
        logger.warning(
            f"[DB] UnicodeDecodeError during simple connect: {ue} | {_diagnose_unicode_error(ue)} | env={_dump_env_bytes()}"
        )
    except Exception as e:  # 其它错误
        logger.warning(f"[DB] Simple connect failed (non-fatal at startup): {e!r}")
    return False



@asynccontextmanager
async def lifespan(app: FastAPI):
    # 先做一次简单连接测试
    _attempt_simple_connection()
    yield
    # TODO: 清理资源 (连接池 / 临时文件 等)
app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
 CORSMiddleware,
 allow_origins=["*"] if settings.CORS_ORIGINS=="*" else [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()],
 allow_credentials=True,
 allow_methods=["*"],
 allow_headers=["*"],
)
app.include_router(word.router)
app.include_router(template.router)
app.include_router(search.router)
app.include_router(development_data.router)
app.include_router(country.router)
app.include_router(organization.router)
app.include_router(admin.router)
app.include_router(MGID_apply.router)
app.include_router(user.router)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/health/db")
def health_db():
    """Lightweight DB health check.
    Returns status plus optional diagnostics if failure occurs.
    """
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok"}
    except UnicodeDecodeError as ue:
        return {"status": "unicode_error", "detail": str(ue)}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, log_level="info")
