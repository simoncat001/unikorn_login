from common import constants
from sqlalchemy.orm import Session
from sqlalchemy import or_
from . import models


def add_user(db: Session, db_user: models.User):
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_list(db: Session, start: int, size: int):
    return db.query(models.User).offset(start).limit(size).all()


def get_user_count(db: Session):
    return db.query(models.User).count()


def get_user_organization(db: Session, name: str):
    if not name:
        return None
    result = (
        db.query(models.User.organization)
        .filter(models.User.user_name == name)
        .first()
    )
    return result[0] if result else None


def delete_user(db: Session, id: str):
    db.query(models.User).filter(models.User.user_number == id).delete()
    db.commit()


def is_user_admin(db: Session, name: str):
    is_exist = (
        db.query(models.User)
        .filter(
            or_(
                models.User.user_type == "admin", models.User.user_type == "super_admin"
            )
        )
        .filter(models.User.user_name == name)
        .count()
    )
    return is_exist == 1


def is_user_super_admin(db: Session, name: str):
    is_exist = (
        db.query(models.User)
        .filter(models.User.user_type == "super_admin")
        .filter(models.User.user_name == name)
        .count()
    )
    return is_exist == 1


def get_admin_level(db: Session, name: str):
    user_type = (
        db.query(models.User.user_type).filter(models.User.user_name == name).first()[0]
    )
    return constants.ADMIN_LEVEL[user_type]


def get_userinfo_by_name(db: Session, name: str):
    return db.query(models.User).filter(models.User.user_name == name).first()


def get_username_by_id(db: Session, id: str):
    return (
        db.query(models.User.user_name).filter(models.User.user_number == id).first()[0]
    )
