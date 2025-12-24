from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

import main
from common import auth as auth_module
from database.base import Base, engine


@pytest.fixture(scope="session", autouse=True)
def _register_models():
    """Import all models so Base.metadata includes every table."""

    from database import models  # noqa: F401
    yield


@pytest.fixture(scope="function", autouse=True)
def _create_tables(_register_models):
    """Create/drop DB tables for each test.

    WARNING: only safe if your configured database is disposable.
    """

    Base.metadata.create_all(bind=engine)
    try:
        yield
    finally:
        Base.metadata.drop_all(bind=engine)


class FakeUser:
    def __init__(self, user_name: str):
        self.user_name = user_name


@pytest.fixture()
def client() -> TestClient:
    return TestClient(main.app)


@pytest.fixture()
def login_as():
    """Override auth dependencies per-test without JWT/cookies."""

    def _login(user_name: str):
        main.app.dependency_overrides[auth_module.get_current_user] = lambda: FakeUser(user_name)
        main.app.dependency_overrides[auth_module.get_current_active_user] = lambda: FakeUser(user_name)

    yield _login
    main.app.dependency_overrides.clear()
