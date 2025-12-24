from __future__ import annotations

import pytest


 


def test_project_creator_becomes_admin_and_can_manage_members(client, login_as):
    login_as("alice")
    r = client.post("/api/projects", json={"name": "P1"})
    assert r.status_code == 200, r.text
    project_id = r.json()["id"]

    # alice is admin, can add bob
    r2 = client.put(f"/api/projects/{project_id}/members", json={"user_id": "bob", "role": "user"})
    assert r2.status_code == 200
    assert r2.json()["user_id"] == "bob"
    assert r2.json()["role"] == "user"


def test_user_cannot_delete_dev_data_but_admin_can(client, login_as):
    # alice creates project => admin
    login_as("alice")
    r = client.post("/api/projects", json={"name": "P1"})
    assert r.status_code == 200, r.text
    project_id = r.json()["id"]

    # add bob as user
    r2 = client.put(f"/api/projects/{project_id}/members", json={"user_id": "bob", "role": "user"})
    assert r2.status_code == 200

    # bob creates dev-data
    login_as("bob")
    r3 = client.post(f"/api/projects/{project_id}/dev-data", json={"data": {"k": "v"}})
    assert r3.status_code == 200, r3.text
    dev_id = r3.json()["id"]

    # bob cannot delete
    r4 = client.delete(f"/api/projects/{project_id}/dev-data/{dev_id}")
    assert r4.status_code == 403

    # alice can delete
    login_as("alice")
    r5 = client.delete(f"/api/projects/{project_id}/dev-data/{dev_id}")
    assert r5.status_code == 200
    assert r5.json()["deleted"] is True


def test_non_member_forbidden(client, login_as):
    login_as("alice")
    r = client.post("/api/projects", json={"name": "P1"})
    assert r.status_code == 200, r.text
    project_id = r.json()["id"]

    # charlie is not a member
    login_as("charlie")
    r2 = client.get(f"/api/projects/{project_id}/dev-data")
    assert r2.status_code == 403
