from __future__ import annotations

import uuid
from typing import List, Optional

from sqlalchemy.orm import Session

from . import models


def get_dev_data(db: Session, dev_data_id: uuid.UUID) -> Optional[models.DevData]:
    return db.query(models.DevData).filter(models.DevData.id == dev_data_id).first()


def list_dev_data(db: Session, project_id: str, skip: int = 0, limit: int = 50) -> List[models.DevData]:
    return (
        db.query(models.DevData)
        .filter(models.DevData.project_id == project_id)
        .order_by(models.DevData.updated_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_dev_data(
    db: Session,
    project_id: str,
    data: dict,
    created_by: str,
) -> models.DevData:
    obj = models.DevData(project_id=project_id, data=data, created_by=created_by, updated_by=created_by)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update_dev_data(
    db: Session,
    dev_data_id: uuid.UUID,
    data: dict,
    updated_by: str,
) -> models.DevData:
    obj = get_dev_data(db=db, dev_data_id=dev_data_id)
    if obj is None:
        raise ValueError("dev_data not found")
    obj.data = data
    obj.updated_by = updated_by
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def delete_dev_data(db: Session, dev_data_id: uuid.UUID) -> bool:
    obj = get_dev_data(db=db, dev_data_id=dev_data_id)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
