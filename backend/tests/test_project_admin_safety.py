from __future__ import annotations

import pytest


def test_cannot_demote_last_admin(client, login_as):
    login_as("alice")
    r = client.post("/api/projects", json={"name": "P1"})
    assert r.status_code == 200, r.text
    pid = r.json()["id"]

    # demote alice from admin->user should fail (last admin)
    r2 = client.put(f"/api/projects/{pid}/members", json={"user_id": "alice", "role": "user"})
    assert r2.status_code == 400


def test_cannot_remove_last_admin(client, login_as):
    login_as("alice")
    r = client.post("/api/projects", json={"name": "P1"})
    assert r.status_code == 200, r.text
    pid = r.json()["id"]

    # removing alice should fail (last admin)
    r2 = client.delete(f"/api/projects/{pid}/members/alice")
    assert r2.status_code == 400


def test_can_remove_admin_if_another_admin_exists(client, login_as):
    login_as("alice")
    r = client.post("/api/projects", json={"name": "P1"})
    assert r.status_code == 200, r.text
    pid = r.json()["id"]

    # promote bob to admin
    r1 = client.put(f"/api/projects/{pid}/members", json={"user_id": "bob", "role": "admin"})
    assert r1.status_code == 200, r1.text

    # now removing alice is allowed
    r2 = client.delete(f"/api/projects/{pid}/members/alice")
    assert r2.status_code == 200, r2.text
    assert r2.json()["removed"] is True
