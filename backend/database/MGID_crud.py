from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models

# NOTE:
# Previous implementation compared JSONB path expressions directly to a Python string
# value wrapped with json.dumps(user). That produced a TEXT literal (e.g. '"alice"'),
# leading to PostgreSQL operator errors (jsonb = character varying) or empty result sets.
# We now extract JSONB field values as text using .astext before comparison.


def get_object_list(db: Session, user: str, template_id: str, start: int, size: int):
    """Return a paginated list of MGID application objects for a user.

    If user is falsy (missing header), return an empty list early to avoid
    filtering with a NULL/empty value that would otherwise yield no rows while
    still triggering unnecessary SQL.
    """
    if not user:
        return []

    q = (
        db.query(models.Object)
        .filter(models.Object.template_id == template_id)
        .filter(models.Object.json_data["MGID_submitter"].astext == user)
        .order_by(models.Object.json_data["create_timestamp"].astext.desc())
        .offset(start)
        .limit(size)
    )
    return q.all()


def get_MGID_count(db: Session, user: str, template_id: str):
    if not user:
        return 0
    return (
        db.query(func.count(models.Object.id))
        .filter(models.Object.template_id == template_id)
        .filter(models.Object.json_data["MGID_submitter"].astext == user)
        .scalar()
    )


def get_MGID(db: Session, MGID: str):
    return (
        db.query(models.Object)
        .filter(models.Object.json_data["MGID"].astext == MGID)
        .first()
    )
