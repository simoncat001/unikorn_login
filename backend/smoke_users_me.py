"""Smoke test for GET /api/users/me.

Why this exists:
- /api/users/me uses response_model=schemas.User.
- If the underlying DB user row misses fields (e.g. display_name), FastAPI can 500
  with ResponseValidationError.

Usage (PowerShell):
  $env:BASE_URL='http://127.0.0.1:8000'
  $env:USERNAME='simon'
  $env:PASSWORD='your_password'
  python .\smoke_users_me.py

Notes:
- This script uses the OAuth2PasswordRequestForm login endpoint /api/token.
- It sends the access token as Authorization: Bearer <token>.
"""

from __future__ import annotations

import os
import sys
from typing import Any

import requests


def must_env(name: str) -> str:
    val = os.getenv(name)
    if not val:
        raise SystemExit(f"Missing env var {name}")
    return val


def main() -> int:
    base = os.getenv("BASE_URL", "http://127.0.0.1:8000").rstrip("/")
    username = must_env("USERNAME")
    password = must_env("PASSWORD")

    # OAuth2PasswordRequestForm expects form-encoded.
    token_resp = requests.post(
        f"{base}/api/token",
        data={"username": username, "password": password},
        timeout=10,
    )
    print("/api/token:", token_resp.status_code)
    if not token_resp.ok:
        print(token_resp.text)
        return 1

    token_json: dict[str, Any] = token_resp.json()
    access_token = token_json.get("access_token")
    if not isinstance(access_token, str) or not access_token:
        print("No access_token in response:", token_json)
        return 1

    me_resp = requests.get(
        f"{base}/api/users/me",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=10,
    )
    print("/api/users/me:", me_resp.status_code)
    print(me_resp.text)

    return 0 if me_resp.ok else 2


if __name__ == "__main__":
    raise SystemExit(main())
