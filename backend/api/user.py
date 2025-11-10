from fastapi import Depends, APIRouter, HTTPException, Request, Response
from starlette import status as http_status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import warnings
from typing import Optional
from database import (
    user_crud,
    serialnumber_crud,
    country_crud,
    organization_crud,
    models,
    schemas,
)
from database.base import engine
from common import constants, status, db, auth
from settings import settings
from datetime import timedelta
import json

router = APIRouter()


REFRESH_COOKIE_NAME = "refresh_token"
ACCESS_COOKIE_NAME = auth.ACCESS_COOKIE_NAME


def _user_payload(user: models.User) -> dict:
    return {
        "username": getattr(user, "user_name", None),
        "display_name": getattr(user, "display_name", getattr(user, "user_name", None)),
        "user_type": getattr(user, "user_type", None),
    }


def _apply_no_cache_headers(response: Response) -> None:
    response.headers["Cache-Control"] = "no-store"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    vary_header = response.headers.get("Vary")
    vary_tokens = [] if vary_header is None else [part.strip() for part in vary_header.split(",") if part.strip()]
    for header_name in ("Authorization", "Cookie"):
        if header_name not in vary_tokens:
            vary_tokens.append(header_name)
    if vary_tokens:
        response.headers["Vary"] = ", ".join(vary_tokens)


def _cookie_secure_default() -> bool:
    """Derive secure flag when not explicitly configured."""
    if settings.AUTH_COOKIE_SECURE is not None:
        return settings.AUTH_COOKIE_SECURE
    return settings.APP_ENV.lower() in {"prod", "production"}


def _cookie_samesite() -> str:
    raw = (settings.AUTH_COOKIE_SAMESITE or "lax").strip().lower()
    return raw if raw in {"lax", "strict", "none"} else "lax"


def _set_refresh_cookie(response: Response, token: str):
    """Store refresh token in HttpOnly cookie for browser-based flows."""
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=_cookie_secure_default(),
        samesite=_cookie_samesite(),
        max_age=settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60,
        path=settings.AUTH_COOKIE_PATH,
        domain=settings.AUTH_COOKIE_DOMAIN,
    )


def _set_access_cookie(response: Response, token: str):
    """Persist access token in an HttpOnly cookie for proxy compatibility."""
    response.set_cookie(
        key=ACCESS_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=_cookie_secure_default(),
        samesite=_cookie_samesite(),
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path=settings.AUTH_COOKIE_PATH,
        domain=settings.AUTH_COOKIE_DOMAIN,
    )


@router.post("/api/token", response_model=auth.Token)
async def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(db.get_db),
):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=http_status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.user_name}, expires_delta=access_token_expires
    )
    refresh_token = auth.create_refresh_token(user.user_name)
    _set_refresh_cookie(response, refresh_token)
    _set_access_cookie(response, access_token)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": _user_payload(user),
    }


@router.post("/api/token/refresh", response_model=auth.TokenPair)
def refresh_token(
    request: Request,
    response: Response,
    refresh_payload: Optional[dict] = None,
):
    payload = refresh_payload or {}
    token = payload.get("refresh_token") or request.cookies.get(REFRESH_COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=400, detail="Missing refresh_token")
    pair = auth.refresh_access_token(token)
    _set_refresh_cookie(response, pair.refresh_token)
    _set_access_cookie(response, pair.access_token)
    return pair


@router.post("/api/logout", status_code=http_status.HTTP_204_NO_CONTENT)
def logout(response: Response, request: Request):
    response.delete_cookie(
        REFRESH_COOKIE_NAME,
        path=settings.AUTH_COOKIE_PATH,
        domain=settings.AUTH_COOKIE_DOMAIN,
        httponly=True,
        secure=_cookie_secure_default(),
        samesite=_cookie_samesite(),
    )
    response.delete_cookie(
        ACCESS_COOKIE_NAME,
        path=settings.AUTH_COOKIE_PATH,
        domain=settings.AUTH_COOKIE_DOMAIN,
        httponly=True,
        secure=_cookie_secure_default(),
        samesite=_cookie_samesite(),
    )

    # If the client still presents a refresh token in the payload or cookie,
    # make sure it can no longer be used by forcing a rotation through an
    # immediate expiration response.
    if request.cookies.get(REFRESH_COOKIE_NAME):
        response.set_cookie(
            key=REFRESH_COOKIE_NAME,
            value="",
            max_age=0,
            expires=0,
            httponly=True,
            secure=_cookie_secure_default(),
            samesite=_cookie_samesite(),
            path=settings.AUTH_COOKIE_PATH,
            domain=settings.AUTH_COOKIE_DOMAIN,
        )


@router.post("/api/user_add/")
def add_user(data: schemas.UserAdd, db: Session = Depends(db.get_db)):
    user_data = json.loads(data.user_json_data)
    # to avoid repeated username causing serial number increasing
    if user_crud.get_userinfo_by_name(db=db, name=user_data["user_name"]) is not None:
        return {
            "status": status.API_INVALID_USER_NAME,
        }
    elif (
        organization_crud.get_organization_by_name(
            db=db, name=user_data["organization"]
        )
        is None
    ):
        return {
            "status": status.API_INVALID_USER_ORGANIZATION,
        }
    elif country_crud.get_country_by_name(db=db, name=user_data["country"]) is None:
        return {
            "status": status.API_INVALID_USER_COUNTRY,
        }
    user_number = serialnumber_crud.get_serial_number(db=db, type="user")
    user_number = "{0:04d}".format(user_number)
    
    hashed_password = auth.get_password_hash(user_data["password"])
    
    db_user = models.User(
                            user_name=user_data["user_name"],
                            display_name=user_data["display_name"],
                            hashed_password=hashed_password,
                            country=user_data["country"],
                            organization=user_data["organization"],
                            user_number=user_number,
                            user_type=user_data["user_type"],
                        )
    try:
        obj = user_crud.add_user(db=db, db_user=db_user)
    except:
        warnings.warn("Warning: Unable to add the user.")
        return {
            "status": status.API_ERR_DB_FAILED,
            "message": "Unable to add the user",
        }
    return {"status": status.API_OK, "data": obj}


@router.get("/api/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user


# 兼容旧前端：提供 /api/userinfo/ 路由，返回当前用户基础信息
@router.get("/api/userinfo/")
def userinfo(response: Response, current_user: models.User = Depends(auth.get_current_active_user)):
    _apply_no_cache_headers(response)
    return _user_payload(current_user)
