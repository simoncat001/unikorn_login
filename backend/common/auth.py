import os
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Callable

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

# --- bcrypt compatibility shim (passlib expects bcrypt.__about__.__version__) ---
try:
    import bcrypt as _bcrypt_mod  # type: ignore
    if not getattr(_bcrypt_mod, "__about__", None):
        class _About:  # minimal stub
            __version__ = getattr(_bcrypt_mod, "__version__", "0")
        _bcrypt_mod.__about__ = _About()  # type: ignore[attr-defined]
except Exception:
    # If anything fails we ignore; passlib will still work (only a warning suppressed)
    pass
from pydantic import BaseModel

from database import user_crud, models
# Logger
auth_logger = logging.getLogger("auth")
if not auth_logger.handlers:
    logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s %(name)s: %(message)s")
from sqlalchemy.orm import Session
from common import db
from settings import settings

# --- Configuration ---
# Configurable security settings
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

# --- Pydantic Models ---

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: Optional[str] = None

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None

# --- Security Setup ---

# Password Hashing context
# Revert to pure bcrypt to avoid ambiguous detection between bcrypt_sha256 and raw bcrypt hashes.
# We rely on PostgreSQL pgcrypto (crypt) which produces standard bcrypt ($2a/$2b) hashes.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")  # retained for potential future use

# OAuth2 Scheme
# The tokenUrl points to our future login endpoint.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token", auto_error=False)

ACCESS_COOKIE_NAME = "access_token"


# --- Password and Token Utility Functions ---

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password using PostgreSQL pgcrypto directly.

    We avoid passlib here due to observed false negatives where crypt() matches
    but passlib.verify() returns False. Bcrypt truncates >72 chars internally; we emulate.
    """
    if len(plain_password) > 72:
        plain_password = plain_password[:72]
    try:
        from sqlalchemy import text
        from database.base import engine as _eng
        with _eng.connect() as conn:
            row = conn.execute(text("SELECT crypt(:p, :h)=:h AS m"), {"p": plain_password, "h": hashed_password}).first()
            return bool(row and row[0])
    except Exception as e:
        auth_logger.warning(f"verify_password_pgcrypto_failed err={e}")
        return False

def get_password_hash(password: str) -> str:
    """Generate bcrypt hash using PostgreSQL pgcrypto (crypt + gen_salt('bf', 12)).

    This enforces a single hashing source (database). If pgcrypto is misconfigured,
    we raise an explicit 500 error to avoid silently mixing hashing schemes.
    """
    from sqlalchemy import text
    from database.base import engine
    try:
        with engine.connect() as conn:
            row = conn.execute(text("SELECT crypt(:p, gen_salt('bf', 12)) AS h"), {"p": password}).first()
            if row and row[0]:
                return row[0]
    except Exception as e:
        auth_logger.error(f"pgcrypto hash failed (no fallback): {e}")
        raise HTTPException(status_code=500, detail="Password hashing service unavailable")
    raise HTTPException(status_code=500, detail="Password hashing service unavailable (empty result)")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Creates a new JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(username: str):
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": username, "type": "refresh", "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

def refresh_access_token(refresh_token: str):
    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=400, detail="Invalid token type")
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=400, detail="Invalid token subject")
        new_access = create_access_token({"sub": username}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        new_refresh = create_refresh_token(username)
        return TokenPair(access_token=new_access, refresh_token=new_refresh)
    except JWTError:
        raise HTTPException(status_code=401, detail="Refresh token invalid or expired")


# --- Main Authentication Functions ---

def authenticate_user(db_session: Session, username: str, password: str):
    """
    Finds a user by username and verifies their password.
    Returns the user object if successful, otherwise returns False.
    """
    user = user_crud.get_userinfo_by_name(db=db_session, name=username)
    if not user:
        auth_logger.info(f"login failed: user_not_found username={username}")
        return False
    hp = getattr(user, "hashed_password", None)
    if not hp:
        auth_logger.info(f"login failed: empty_hash username={username}")
        return False
    if not verify_password(password, hp):
        # 追加二级校验：直接用 pgcrypto crypt 比较，区分哈希不匹配还是 passlib 解析异常
        pgcrypto_match = None
        try:
            from sqlalchemy import text
            from database.base import engine as _eng
            with _eng.connect() as _conn:
                row = _conn.execute(text("SELECT crypt(:p, :h)=:h AS m"), {"p": password, "h": hp}).first()
                if row is not None:
                    pgcrypto_match = bool(row[0])
        except Exception as e:
            auth_logger.warning(f"debug_pgcrypto_failed username={username} err={e}")
        auth_logger.info(
            f"login failed: bad_password username={username} hash_prefix={hp[:12]} len_pwd={len(password)} pgcrypto_match={pgcrypto_match}"
        )
        return False
    auth_logger.info(f"login success username={username} method=pgcrypto")
    return user

async def get_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db_session: Session = Depends(db.get_db),
):
    """
    Decodes the JWT token, validates it, and returns the user model.
    This function will be used as a dependency for protected endpoints.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_value = token or request.cookies.get(ACCESS_COOKIE_NAME)
    if not token_value:
        raise credentials_exception

    try:
        payload = jwt.decode(token_value, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not isinstance(username, str):
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    assert isinstance(token_data.username, str)
    user = user_crud.get_userinfo_by_name(db=db_session, name=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    # 未来可扩展 is_active 字段
    return current_user

def require_roles(roles: List[str]) -> Callable:
    """返回一个 FastAPI 依赖，用于限制角色访问。

    用法:
        @router.get("/admin")
        async def admin_endpoint(user=Depends(require_roles(["admin","super_admin"]))):
            ...
    """
    role_set = {r.strip().lower() for r in roles}

    def _dependency(current_user: models.User = Depends(get_current_active_user)):
        raw = getattr(current_user, "user_type", "") or ""
        normalized = raw.strip().lower()
        # 兼容旧数据可能存在的填充空格/大小写问题
        if role_set and normalized not in role_set:
            raise HTTPException(status_code=403, detail="Forbidden")
        return current_user
    return _dependency

def create_token_for_user(username: str) -> str:
    """便于内部调用的包装。"""
    return create_access_token({"sub": username}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
