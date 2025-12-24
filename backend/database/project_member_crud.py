from __future__ import annotations

from typing import Optional, List

from sqlalchemy.orm import Session

from . import models


def _count_admins(db: Session, project_id: str) -> int:
    return (
        db.query(models.ProjectMember)
        .filter(models.ProjectMember.project_id == project_id)
        .filter(models.ProjectMember.role == "admin")
        .count()
    )


def get_member(db: Session, project_id: str, user_id: str) -> Optional[models.ProjectMember]:
    return (
        db.query(models.ProjectMember)
        .filter(models.ProjectMember.project_id == project_id)
        .filter(models.ProjectMember.user_id == user_id)
        .first()
    )


def list_members(db: Session, project_id: str) -> List[models.ProjectMember]:
    return (
        db.query(models.ProjectMember)
        .filter(models.ProjectMember.project_id == project_id)
        .order_by(models.ProjectMember.created_at.asc())
        .all()
    )


def upsert_member(db: Session, project_id: str, user_id: str, role: str) -> models.ProjectMember:
    role = (role or "").strip().lower()
    if role not in {"admin", "user"}:
        raise ValueError("role must be 'admin' or 'user'")

    existing = get_member(db=db, project_id=project_id, user_id=user_id)
    if existing:
        # Prevent demoting the last admin
        if str(existing.role) == "admin" and role != "admin":
            if _count_admins(db=db, project_id=project_id) <= 1:
                raise ValueError("cannot demote the last admin in a project")
        existing.role = role  # type: ignore[assignment]
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing

    member = models.ProjectMember(project_id=project_id, user_id=user_id, role=role)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


def remove_member(db: Session, project_id: str, user_id: str) -> bool:
    member = get_member(db=db, project_id=project_id, user_id=user_id)
    if not member:
        return False
    # Prevent removing the last admin
    if str(member.role) == "admin" and _count_admins(db=db, project_id=project_id) <= 1:
        raise ValueError("cannot remove the last admin in a project")
    db.delete(member)
    db.commit()
    return True
