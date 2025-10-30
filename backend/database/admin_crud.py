from sqlalchemy.orm import Session
from sqlalchemy import String, cast, update, func
from sqlalchemy.dialects.postgresql import JSONB
from . import models, template_crud
from common import constants, utils
import uuid
from typing import List
import json


def admin_words_list(
    db: Session,
    word_template_id: str,
    start: int,
    size: int,
):
    return (
        db.query(models.Object)
        .filter(
            models.Object.template_id == word_template_id,
            models.Object.json_data["review_status"]
            != cast(constants.REVIEW_STATUS_DRAFT, JSONB),
        )
        .order_by(models.Object.json_data["create_timestamp"].desc())
        .offset(start)
        .limit(size)
        .all()
    )


def admin_words_count(db: Session, word_template_id: str):
    query_cmd = db.query(models.Object).filter(
        models.Object.template_id == word_template_id,
        models.Object.json_data["review_status"]
        != cast(constants.REVIEW_STATUS_DRAFT, JSONB),
    )
    return query_cmd.count()


def admin_templates_list(
    db: Session,
    start: int,
    size: int,
):
    query_cmd = db.query(models.Template.id, models.Template.json_schema).filter(
        models.Template.json_schema["review_status"]
        != cast(constants.REVIEW_STATUS_DRAFT, JSONB),
    )
    for item in constants.EXCLUDETEMPLATES:
        query_cmd = query_cmd.filter(
            cast(models.Template.id, String) != cast(item, String)
        )
    templates_result = query_cmd.order_by(
        models.Template.json_schema["create_timestamp"].desc()
    ).offset(start).limit(size).all()
    return [
       {"id": t.id, "json_schema": t.json_schema}
       for t in templates_result
    ]


def admin_templates_count(db: Session):
    query_cmd = db.query(models.Template.id, models.Template.json_schema).filter(
        models.Template.json_schema["review_status"]
        != cast(constants.REVIEW_STATUS_DRAFT, JSONB),
    )
    for item in constants.EXCLUDETEMPLATES:
        query_cmd = query_cmd.filter(
            cast(models.Template.id, String) != cast(item, String)
        )
    return query_cmd.count()


def filter_words_list(
    db: Session,
    word_template_id: str,
    status_filter: str,
    start: int,
    size: int,
):
    query_cmd = db.query(models.Object).filter(
        models.Object.template_id == word_template_id,
        cast(models.Object.json_data["review_status"], String).match(status_filter),
    )
    return (
        query_cmd.order_by(models.Object.json_data["create_timestamp"].desc())
        .offset(start)
        .limit(size)
        .all()
    )


def filter_words_count(db: Session, word_template_id: str, status_filter: str):
    query_cmd = db.query(models.Object).filter(
        models.Object.template_id == word_template_id,
        cast(models.Object.json_data["review_status"], String).match(status_filter),
    )
    return query_cmd.count()


def filter_templates_list(
    db: Session,
    status_filter: str,
    start: int,
    size: int,
):
    query_cmd = db.query(models.Template.id, models.Template.json_schema).filter(
        cast(models.Template.json_schema["review_status"], String).match(status_filter)
    )
    for item in constants.EXCLUDETEMPLATES:
        query_cmd = query_cmd.filter(
            cast(models.Template.id, String) != cast(item, String)
        )
    templates_result = query_cmd.order_by(models.Template.json_schema["create_timestamp"].desc()).offset(start).limit(size).all()
    return [
       {"id": t.id, "json_schema": t.json_schema}
       for t in templates_result
    ]


def filter_templates_count(db: Session, status_filter: str):
    query_cmd = db.query(models.Template.id, models.Template.json_schema).filter(
        cast(models.Template.json_schema["review_status"], String).match(status_filter)
    )
    for item in constants.EXCLUDETEMPLATES:
        query_cmd = query_cmd.filter(
            cast(models.Template.id, String) != cast(item, String)
        )
    return query_cmd.count()


def admin_data_list(
    db: Session,
    start: int,
    size: int,
):
    return (
        db.query(models.Object)
        .filter(models.Object.template_id.notin_(constants.EXCLUDETEMPLATES))
        .filter(
            models.Object.json_data["review_status"]
            != cast(constants.REVIEW_STATUS_DRAFT, JSONB),
        )
        .order_by(models.Object.json_data["create_timestamp"].desc())
        .offset(start)
        .limit(size)
        .all()
    )


def admin_data_count(db: Session):
    query_cmd = (
        db.query(models.Object)
        .filter(models.Object.template_id.notin_(constants.EXCLUDETEMPLATES))
        .filter(
            models.Object.json_data["review_status"]
            != cast(constants.REVIEW_STATUS_DRAFT, JSONB),
        )
    )
    return query_cmd.count()


def filter_data_list(
    db: Session,
    status_filter: str,
    start: int,
    size: int,
):
    query_cmd = (
        db.query(models.Object)
        .filter(models.Object.template_id.notin_(constants.EXCLUDETEMPLATES))
        .filter(
            cast(models.Object.json_data["review_status"], String).like(f"{status_filter}%"),
        )
    )
    return (
        query_cmd.order_by(models.Object.json_data["create_timestamp"].desc())
        .offset(start)
        .limit(size)
        .all()
    )


def filter_data_count(db: Session, status_filter: str):
    query_cmd = (
        db.query(models.Object)
        .filter(models.Object.template_id.notin_(constants.EXCLUDETEMPLATES))
        .filter(
            cast(models.Object.json_data["review_status"], String).like(f"{status_filter}%"),
        )
    )
    return query_cmd.count()


def get_MGID_list(db: Session, template_id: str, start: int, size: int):
    return (
        db.query(models.Object)
        .filter(models.Object.template_id == template_id)
        .order_by(models.Object.json_data["create_timestamp"].desc())
        .offset(start)
        .limit(size)
        .all()
    )


def get_MGID_count(db: Session, template_id: str):
    return (
        db.query(func.count(models.Object.id))
        .filter(models.Object.template_id == template_id)
        .scalar()
    )


def object_review_update(
    db: Session, id: str, reviewer: str, review_status: str, rejected_reason: str
):
    current_template_id = str(
        db.query(models.Object).filter(models.Object.id == id).first().template_id
    )
    review_status_template = review_status
    if (
        current_template_id not in constants.EXCLUDETEMPLATES
        and review_status == constants.REVIEW_STATUS_PASSED_REVIEW
    ):
        review_status_template = constants.REVIEW_STATUS_PASSED_REVIEW_WAITING_PUBLISHED
    # Safer approach: load JSON, mutate in Python, assign back.
    obj = db.query(models.Object).filter(models.Object.id == id).first()
    if not obj:
        return
    data = dict(obj.json_data or {})
    data["reviewer"] = reviewer
    data["review_status"] = review_status_template
    data["rejected_reason"] = rejected_reason
    obj.json_data = data
    db.commit()


def template_review_update(
    db: Session, id: str, reviewer: str, review_status: str, rejected_reason: str
):
    current_status = template_crud.get_templates_review_status_with_id(id=id, db=db)
    if (
        current_status == constants.REVIEW_STATUS_PASSED_REVIEW_WAITING_REVIEW
        and review_status == constants.REVIEW_STATUS_PASSED_REVIEW
    ):
        db.query(models.Object).filter(models.Object.template_id == id).filter(
            cast(models.Object.json_data["review_status"], String).match(
                constants.REVIEW_STATUS_PASSED_REVIEW
            ),
        ).update(
            {
                models.Object.json_data: func.jsonb_set(
                    models.Object.json_data,
                    "{review_status}",
                    json.dumps(review_status),
                )
            },
            synchronize_session="fetch",
        )
    tmpl = db.query(models.Template).filter(models.Template.id == id).first()
    if not tmpl:
        return
    schema = dict(tmpl.json_schema or {})
    schema["reviewer"] = reviewer
    schema["review_status"] = review_status
    schema["rejected_reason"] = rejected_reason
    tmpl.json_schema = schema
    db.commit()
