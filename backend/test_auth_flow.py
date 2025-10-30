"""Minimal manual test script for JWT auth flow.
Run while backend server (uvicorn main:app) is up.
"""
import requests, json, random, string

BASE = "http://127.0.0.1:8000"

username = "testuser_" + ''.join(random.choices(string.ascii_lowercase, k=4))
password = "Passw0rd!"
print(f"Creating user: {username}")

# 1. register user (expects /api/user_add/ with user_json_data JSON)
user_payload = {
    "user_name": username,
    "display_name": username.capitalize(),
    "country": "CN",  # ensure exists in country table
    "organization": "ORG",  # ensure exists in organization table
    "password": password,
    "user_type": "admin",
}
resp = requests.post(
    f"{BASE}/api/user_add/",
    json={"user_json_data": json.dumps(user_payload)},
    timeout=10,
)
print("Register status:", resp.status_code, resp.text)

# 2. get token
form = {"username": username, "password": password}
resp = requests.post(f"{BASE}/api/token", data=form, timeout=10)
print("Token status:", resp.status_code, resp.text)
token_json = resp.json()
access_token = token_json.get("access_token")
refresh_token = token_json.get("refresh_token")

# 3. call protected endpoint
headers = {"Authorization": f"Bearer {access_token}"}
resp = requests.get(f"{BASE}/api/users/me", headers=headers, timeout=10)
print("/api/users/me (initial):", resp.status_code, resp.text)

# 4. refresh token
if refresh_token:
    r2 = requests.post(f"{BASE}/api/token/refresh", json={"refresh_token": refresh_token}, timeout=10)
    print("Refresh status:", r2.status_code, r2.text)
    if r2.ok:
        new_pair = r2.json()
        new_access = new_pair.get("access_token")
        headers = {"Authorization": f"Bearer {new_access}"}
        r3 = requests.get(f"{BASE}/api/users/me", headers=headers, timeout=10)
        print("/api/users/me (after refresh):", r3.status_code, r3.text)

if resp.ok:
    print("SUCCESS: Auth flow works.")
else:
    print("FAILED: Check logs.")
