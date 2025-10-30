from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import or_, func
from . import schemas
from common import status
from . import models
import uuid


def create_organization(
    db: Session, organization_list: list[schemas.OrganizationCreate]
):

    list_rows = 0
    organization_object_list = list()
    insert_stmt = insert(models.Organization.__table__).on_conflict_do_nothing()
    for i, organization in enumerate(organization_list):
        try:
            organization_id, organization_name = organization
            organization_object_list.append(
                {"id": organization_id, "name": organization_name}
            )
            list_rows += 1
        except:
            continue
    result = db.execute(insert_stmt, organization_object_list)
    db.commit()
    count = result.rowcount
    if count < list_rows:
        return status.API_INVALID_CSV_ROW
    return status.API_OK


def is_organization_exist(db: Session, organization: schemas.OrganizationCreate):
    query_filter = or_(
        models.Organization.id == organization.id,
        models.Organization.name == organization.name,
    )
    query_cmd = db.query(models.Organization).filter(query_filter)
    return query_cmd.all() != None


def count_organization(db: Session):
    organization_count = db.query(func.count(models.Organization.id)).scalar()
    return organization_count


def get_organization_list_with_begin(db: Session, begin_word: str):
    query_cmd = db.query(models.Organization.name).filter(
        models.Organization.name.like("%" + begin_word + "%")
    )
    db_organization_list = query_cmd.all()
    organization_list = []
    for db_organization in db_organization_list:
        organization_list.append(db_organization[0])
    return organization_list


def get_organization_list(
    db: Session,
    start: int,
    size: int,
):
    return db.query(models.Organization).offset(start).limit(size).all()


def get_organization_count(db: Session):
    return db.query(models.Organization).count()


def delete_organization(db: Session, id: uuid.UUID):
    db.query(models.Organization).filter(models.Organization.id == id).delete()
    db.commit()


def get_organization_by_name(db: Session, name: str):
    return (
        db.query(models.Organization).filter(models.Organization.name == name).first()
    )
