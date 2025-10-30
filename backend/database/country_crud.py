from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import and_, func
from . import schemas
from common import status
from . import models
import uuid


def create_country(db: Session, country_list: list[schemas.CountryCreate]):

    list_rows = 0
    country_object_list = list()
    insert_stmt = insert(models.Country.__table__).on_conflict_do_nothing()
    for i, country in enumerate(country_list):
        try:
            country_id, country_name = country
            country_object_list.append({"id": country_id, "name": country_name})
            list_rows += 1
        except:
            continue
    result = db.execute(insert_stmt, country_object_list)
    db.commit()
    count = result.rowcount
    if count < list_rows:
        return status.API_INVALID_CSV_ROW
    return status.API_OK


def is_country_exist(db: Session, country: schemas.CountryCreate):
    is_exist = (
        db.query(1).filter(
            and_(
                models.Country.id == country.id,
                models.Country.name == country.name,
            )
        )
    ).first()
    return is_exist != None


def count_country(db: Session):
    country_count = db.query(func.count(models.Country.id)).scalar()
    return country_count


def get_country_list(
    db: Session,
    start: int,
    size: int,
):
    return db.query(models.Country).offset(start).limit(size).all()


def get_country_count(db: Session):
    return db.query(models.Country).count()


def delete_country(db: Session, id: uuid.UUID):
    db.query(models.Country).filter(models.Country.id == id).delete()
    db.commit()


def get_country_by_name(db: Session, name: str):
    return db.query(models.Country).filter(models.Country.name == name).first()
