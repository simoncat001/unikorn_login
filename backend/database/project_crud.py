from __future__ import annotations

from sqlalchemy import String
from sqlalchemy.orm import Session

from . import models


def create_project(db: Session, *, name: str, created_by: str) -> models.Project:
    obj = models.Project(name=name, created_by=created_by)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_project(db: Session, *, project_id) -> models.Project | None:
    return db.query(models.Project).filter(models.Project.id == project_id).first()


def list_projects(db: Session, *, skip: int = 0, limit: int = 50) -> list[models.Project]:
    return db.query(models.Project).offset(skip).limit(limit).all()


def list_projects_for_user(db: Session, *, user_id: str, skip: int = 0, limit: int = 50) -> list[models.Project]:
    """List projects where the user is a member."""

    return (
        db.query(models.Project)
    .join(models.ProjectMember, models.ProjectMember.project_id == models.Project.id.cast(String))
        .filter(models.ProjectMember.user_id == user_id)
        .order_by(models.Project.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
