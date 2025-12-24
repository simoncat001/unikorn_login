from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
import sqlalchemy
from sqlalchemy.orm import Session

from common import auth, status
from common import db as db_dep
from database import models, schemas
from database import template_draft_crud


router = APIRouter()


@router.post("/api/template_drafts")
def create_template_draft(
    draft: schemas.TemplateDraftUpsert,
    db: Session = Depends(db_dep.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    owner = str(current_user.user_name)
    try:
        created = template_draft_crud.create_draft(
            db,
            owner=owner,
            title=draft.title,
            payload=draft.payload,
        )
    except Exception as e:
        # create_draft() should not raise, but keep this guard for safety.
        return {"status": status.API_ERR_DB_FAILED, "message": f"Unable to create draft: {type(e).__name__}"}

    if created is None:
        # Most common root cause in deployments: DB user lacks privileges.
        last_err = getattr(db, "_last_error", None)
        msg = "Unable to create draft (db error)."
        try:
            # Detect permission error signatures across psycopg/sqlalchemy.
            err_text = str(last_err) if last_err else ""
            if (
                "InsufficientPrivilege" in err_text
                or "permission denied" in err_text.lower()
                or "权限不够" in err_text
            ):
                msg = (
                    "Database permission denied on table template_drafts. "
                    "Please GRANT SELECT,INSERT,UPDATE,DELETE on public.template_drafts to the DB user used by backend (e.g. unicorn)."
                )
        except Exception:
            pass

        return {"status": status.API_ERR_DB_FAILED, "message": msg}
    return {"status": status.API_OK, "data": created}


@router.put("/api/template_drafts/{draft_id}")
def update_template_draft(
    draft_id: str,
    draft: schemas.TemplateDraftUpsert,
    db: Session = Depends(db_dep.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    owner = str(current_user.user_name)
    ok = template_draft_crud.update_draft(
        db,
        draft_id=draft_id,
        owner=owner,
        title=draft.title,
        payload=draft.payload,
    )
    if not ok:
        return {"status": status.API_PERMISSION_DENIED}
    return {"status": status.API_OK}


@router.get("/api/template_drafts")
def list_template_drafts(
    start: int = 0,
    size: int = 20,
    db: Session = Depends(db_dep.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    owner = str(current_user.user_name)
    rows = template_draft_crud.list_drafts(
        db,
        owner=owner,
        start=start,
        size=size,
    )
    return {"status": status.API_OK, "data": rows}


@router.get("/api/template_drafts/count")
def count_template_drafts(
    db: Session = Depends(db_dep.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    owner = str(current_user.user_name)
    count = template_draft_crud.count_drafts(db, owner=owner)
    return {"status": status.API_OK, "count": count}


@router.get("/api/template_drafts/{draft_id}")
def get_template_draft(
    draft_id: str,
    db: Session = Depends(db_dep.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    owner = str(current_user.user_name)
    draft = template_draft_crud.get_draft(db, draft_id)
    if not draft:
        raise HTTPException(status_code=404, detail="draft not found")
    if str(draft.owner) != owner:
        return {"status": status.API_PERMISSION_DENIED}
    return {"status": status.API_OK, "data": draft}


@router.delete("/api/template_drafts/{draft_id}")
def delete_template_draft(
    draft_id: str,
    db: Session = Depends(db_dep.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    owner = str(current_user.user_name)
    ok = template_draft_crud.delete_draft(db, draft_id=draft_id, owner=owner)
    if not ok:
        return {"status": status.API_PERMISSION_DENIED}
    return {"status": status.API_OK}
