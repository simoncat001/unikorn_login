from __future__ import annotations

import uuid
from typing import Any

import sqlalchemy
import logging
from sqlalchemy import String, cast, func
from sqlalchemy.orm import Session

from . import models
from common import constants


logger = logging.getLogger("template_draft_crud")


def get_draft(db: Session, draft_id: str):
    try:
        return db.query(models.TemplateDraft).filter(models.TemplateDraft.id == draft_id).first()
    except sqlalchemy.exc.DataError:
        return None


def create_draft(db: Session, *, owner: str, title: str, payload: dict) -> models.TemplateDraft | None:
    try:
        draft = models.TemplateDraft(
            owner=owner,
            title=title,
            json_data=payload,
            status=constants.REVIEW_STATUS_DRAFT,
        )
        db.add(draft)
        db.commit()
        db.refresh(draft)
        return draft
    except Exception as e:
        logger.exception("Failed to create template draft (owner=%s, title=%s): %s", owner, title, e)
        db.rollback()
        # Attach last error for API layer to translate into a user-friendly message.
        try:
            setattr(db, "_last_error", e)
        except Exception:
            pass
        return None


def update_draft(db: Session, *, draft_id: str, owner: str, title: str, payload: dict) -> bool:
    # Ownership check in query to prevent updating others' drafts.
    q = (
        db.query(models.TemplateDraft)
        .filter(models.TemplateDraft.id == draft_id)
        .filter(models.TemplateDraft.owner == owner)
    )
    exists = q.first()
    if not exists:
        return False

    q.update(
        {
            models.TemplateDraft.title: title,
            models.TemplateDraft.json_data: payload,
            models.TemplateDraft.updated_at: func.now(),
        }
    )
    db.commit()
    return True


def delete_draft(db: Session, *, draft_id: str, owner: str) -> bool:
    q = (
        db.query(models.TemplateDraft)
        .filter(models.TemplateDraft.id == draft_id)
        .filter(models.TemplateDraft.owner == owner)
    )
    if not q.first():
        return False
    q.delete()
    db.commit()
    return True


def list_drafts(db: Session, *, owner: str, start: int, size: int):
    rows = (
        db.query(models.TemplateDraft)
        .filter(models.TemplateDraft.owner == owner)
        .order_by(models.TemplateDraft.updated_at.desc())
        .offset(start)
        .limit(size)
        .all()
    )
    return rows


def count_drafts(db: Session, *, owner: str) -> int:
    return (
        db.query(func.count(models.TemplateDraft.id))
        .filter(models.TemplateDraft.owner == owner)
        .scalar()
    )


def publish_to_template(db: Session, *, draft: models.TemplateDraft) -> models.Template | None:
    # Create a real Template using the same json_schema structure used elsewhere.
    # The front-end provides the full template payload component-level; server will generate json_schema.
    # Here we just return None because publish is implemented in api layer via utils.generate_json_schema.
    # This helper is kept for future extension.
    return None
