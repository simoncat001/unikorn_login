from __future__ import annotations

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from common import auth
from common import db as db_dep
from database import dev_data_crud, project_member_crud, schemas

router = APIRouter()


def _current_user_id(user) -> str:
    uid = getattr(user, "user_name", None)
    if not isinstance(uid, str) or not uid:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    return uid


# --- Dev Data ---

@router.get("/api/projects/{project_id}/dev-data", response_model=List[schemas.DevData])
def list_dev_data(
    project_id: str,
    start: int = Query(0, ge=0),
    size: int = Query(50, ge=1, le=200),
    db: Session = Depends(db_dep.get_db),
    current_user=Depends(auth.get_current_active_user),
):
    user_id = _current_user_id(current_user)
    role = auth.get_project_role(db_session=db, project_id=project_id, user_id=user_id)
    if role not in {"admin", "user"}:
        raise HTTPException(status_code=403, detail="Not a project member")

    return dev_data_crud.list_dev_data(db=db, project_id=project_id, skip=start, limit=size)


@router.post("/api/projects/{project_id}/dev-data", response_model=schemas.DevData)
def create_dev_data(
    project_id: str,
    payload: schemas.DevDataCreate,
    db: Session = Depends(db_dep.get_db),
    current_user=Depends(auth.get_current_active_user),
):
    user_id = _current_user_id(current_user)
    role = auth.get_project_role(db_session=db, project_id=project_id, user_id=user_id)
    if role not in {"admin", "user"}:
        raise HTTPException(status_code=403, detail="Not a project member")

    return dev_data_crud.create_dev_data(db=db, project_id=project_id, data=payload.data, created_by=user_id)


@router.put("/api/projects/{project_id}/dev-data/{dev_data_id}", response_model=schemas.DevData)
def update_dev_data(
    project_id: str,
    dev_data_id: uuid.UUID,
    payload: schemas.DevDataUpdate,
    db: Session = Depends(db_dep.get_db),
    current_user=Depends(auth.get_current_active_user),
):
    user_id = _current_user_id(current_user)
    role = auth.get_project_role(db_session=db, project_id=project_id, user_id=user_id)
    if role not in {"admin", "user"}:
        raise HTTPException(status_code=403, detail="Not a project member")

    obj = dev_data_crud.get_dev_data(db=db, dev_data_id=dev_data_id)
    if obj is None or str(obj.project_id) != project_id:
        raise HTTPException(status_code=404, detail="dev_data not found")

    return dev_data_crud.update_dev_data(db=db, dev_data_id=dev_data_id, data=payload.data, updated_by=user_id)


@router.delete("/api/projects/{project_id}/dev-data/{dev_data_id}")
def delete_dev_data(
    project_id: str,
    dev_data_id: uuid.UUID,
    db: Session = Depends(db_dep.get_db),
    current_user=Depends(auth.get_current_active_user),
):
    user_id = _current_user_id(current_user)
    role = auth.get_project_role(db_session=db, project_id=project_id, user_id=user_id)
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")

    obj = dev_data_crud.get_dev_data(db=db, dev_data_id=dev_data_id)
    if obj is None or str(obj.project_id) != project_id:
        raise HTTPException(status_code=404, detail="dev_data not found")

    ok = dev_data_crud.delete_dev_data(db=db, dev_data_id=dev_data_id)
    return {"deleted": bool(ok)}


# --- Project member management (admin only) ---

@router.get("/api/projects/{project_id}/members", response_model=List[schemas.ProjectMember])
def list_members(
    project_id: str,
    db: Session = Depends(db_dep.get_db),
    current_user=Depends(auth.get_current_active_user),
):
    user_id = _current_user_id(current_user)
    role = auth.get_project_role(db_session=db, project_id=project_id, user_id=user_id)
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")

    return project_member_crud.list_members(db=db, project_id=project_id)


@router.put("/api/projects/{project_id}/members", response_model=schemas.ProjectMember)
def upsert_member(
    project_id: str,
    payload: schemas.ProjectMemberUpsert,
    db: Session = Depends(db_dep.get_db),
    current_user=Depends(auth.get_current_active_user),
):
    user_id = _current_user_id(current_user)
    role = auth.get_project_role(db_session=db, project_id=project_id, user_id=user_id)
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")

    try:
        return project_member_crud.upsert_member(db=db, project_id=project_id, user_id=payload.user_id, role=payload.role)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/api/projects/{project_id}/members/{member_user_id}")
def remove_member(
    project_id: str,
    member_user_id: str,
    db: Session = Depends(db_dep.get_db),
    current_user=Depends(auth.get_current_active_user),
):
    user_id = _current_user_id(current_user)
    role = auth.get_project_role(db_session=db, project_id=project_id, user_id=user_id)
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")

    try:
        ok = project_member_crud.remove_member(db=db, project_id=project_id, user_id=member_user_id)
        return {"removed": bool(ok)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
