from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from common import auth
from common import db as db_dep
from database import project_crud, project_member_crud, schemas

router = APIRouter()


def _current_user_id(user) -> str:
    uid = getattr(user, "user_name", None)
    if not isinstance(uid, str) or not uid:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    return uid


@router.post("/api/projects", response_model=schemas.Project)
def create_project(
    payload: schemas.ProjectCreate,
    db: Session = Depends(db_dep.get_db),
    current_user=Depends(auth.get_current_active_user),
):
    """Create a project and make the creator its admin."""

    user_id = _current_user_id(current_user)

    project = project_crud.create_project(db=db, name=payload.name, created_by=user_id)

    # Creator becomes project admin
    project_member_crud.upsert_member(db=db, project_id=str(project.id), user_id=user_id, role="admin")

    return project


@router.get("/api/projects", response_model=List[schemas.Project])
def list_projects(
    start: int = Query(0, ge=0),
    size: int = Query(50, ge=1, le=200),
    db: Session = Depends(db_dep.get_db),
    current_user=Depends(auth.get_current_active_user),
):
    user_id = _current_user_id(current_user)
    return project_crud.list_projects_for_user(db=db, user_id=user_id, skip=start, limit=size)
