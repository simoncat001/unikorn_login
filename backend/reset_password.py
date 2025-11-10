"""Utility script to reset a user's password using pgcrypto bcrypt.

Usage (example):
  APP_ENV=prod python reset_password.py kevin NewPass123!

It updates the hashed_password column for the given user_name.
Return codes:
  0 success
  1 invalid args
  2 user not found
  3 update failed
"""
import sys
from sqlalchemy import text
from database.base import engine

def reset(username: str, new_password: str) -> int:
    if not username or not new_password:
        print("[ERR] username and new_password required")
        return 1
    try:
        with engine.begin() as conn:
            # verify user exists
            row = conn.execute(text("SELECT user_name FROM users WHERE user_name=:u"), {"u": username}).first()
            if not row:
                print(f"[ERR] user '{username}' not found")
                return 2
            # update with pgcrypto bcrypt (cost default from gen_salt)
            res = conn.execute(text("UPDATE users SET hashed_password = crypt(:p, gen_salt('bf',12)) WHERE user_name=:u"), {"p": new_password, "u": username})
            if res.rowcount != 1:
                print(f"[ERR] update affected {res.rowcount} rows")
                return 3
            new_hash = conn.execute(text("SELECT hashed_password FROM users WHERE user_name=:u"), {"u": username}).scalar()
        if isinstance(new_hash, str):
            print(f"[OK] password reset for '{username}' hash_prefix={new_hash[:20]} length={len(new_hash)}")
        else:
            print(f"[OK] password reset for '{username}' (hash unreadable)")
        return 0
    except Exception as e:
        print(f"[ERR] exception: {e}")
        return 3

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python reset_password.py <username> <new_password>")
        sys.exit(1)
    sys.exit(reset(sys.argv[1], sys.argv[2]))