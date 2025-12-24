from sqlalchemy.orm import Session
from sqlalchemy import or_
from . import models, schemas

import uuid

def create_standard(db: Session, standard: schemas.StandardCreate):
    db_standard = models.Standard(
        name_zh=standard.name_zh,
        name_en=standard.name_en,
        file_url=standard.file_url,
        review_status=standard.review_status,
        owner=standard.owner
    )
    db.add(db_standard)
    db.commit()
    db.refresh(db_standard)
    return db_standard

def update_standard_status(db: Session, standard_id: str, status: str):
    # 尝试将字符串转换为 UUID 对象
    try:
        if isinstance(standard_id, str):
            standard_uuid = uuid.UUID(standard_id)
        else:
            standard_uuid = standard_id
    except ValueError:
        return None

    db_standard = db.query(models.Standard).filter(models.Standard.id == standard_uuid).first()
    if db_standard:
        db_standard.review_status = status
        db.commit()
        db.refresh(db_standard)
        return db_standard
    return None

def get_standards(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Standard).offset(skip).limit(limit).all()

def get_standards_by_owner(db: Session, owner: str, skip: int = 0, limit: int = 100):
    return db.query(models.Standard).filter(models.Standard.owner == owner).offset(skip).limit(limit).all()

def count_standards_by_owner(db: Session, owner: str):
    return db.query(models.Standard).filter(models.Standard.owner == owner).count()

def search_standards(db: Session, query: str, skip: int = 0, limit: int = 100):
    return db.query(models.Standard).filter(
        or_(
            models.Standard.name_zh.ilike(f"%{query}%"),
            models.Standard.name_en.ilike(f"%{query}%")
        )
    ).offset(skip).limit(limit).all()

def get_standard(db: Session, standard_id: str):
    print(f"DEBUG: get_standard called with id={standard_id!r} type={type(standard_id)}")
    # 尝试将字符串转换为 UUID 对象，以确保数据库查询兼容性
    try:
        if isinstance(standard_id, str):
            standard_uuid = uuid.UUID(standard_id)
        else:
            standard_uuid = standard_id
    except ValueError:
        print(f"DEBUG: Invalid UUID string: {standard_id}")
        return None
        
    result = db.query(models.Standard).filter(models.Standard.id == standard_uuid).first()
    print(f"DEBUG: get_standard result={result}")
    return result

def delete_standard(db: Session, standard_id: str):
    db_standard = db.query(models.Standard).filter(models.Standard.id == standard_id).first()
    if db_standard:
        db.delete(db_standard)
        db.commit()
        return True
    return False
