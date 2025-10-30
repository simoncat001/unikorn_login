from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, not_, String, cast, JSON, Numeric, func, text
from sqlalchemy.dialects.postgresql import JSONB
import uuid, json, datetime
from . import models
from common import utils, constants
from database import template_crud
import config
import sqlalchemy


def get_dev_data(db: Session, object_id: str):
    try:
        return (
            db.query(models.Object)
            .filter(models.Object.template_id.notin_(constants.EXCLUDETEMPLATES))
            .filter(models.Object.id == object_id)
            .first()
        )
    except sqlalchemy.exc.DataError as e:
        return None
    except Exception as e:
        raise e


def get_create_development_data(json_data: dict, template_id: str, db: Session):
    try:
        print("get_create_development_data！")
        
        # 单独处理citation_count更新，即使失败也不影响对象创建
        try:
            # 创建一个新的会话来更新citation_count，避免影响主事务
            from sqlalchemy.orm import Session
            from database.db import SessionLocal
            citation_db = SessionLocal()
            try:
                template_crud.change_citation_count(db=citation_db, id=template_id)
            finally:
                citation_db.close()
        except Exception as citation_error:
            print(f"Citation count update failed but continuing with object creation: {citation_error}")
        
        # 继续创建对象，这是核心功能，不应该因为citation_count更新失败而中断
        db_object = models.Object(template_id=template_id, json_data=json_data)
        db.add(db_object)
        db.commit()
        db.refresh(db_object)
        return db_object
    except Exception as e:
        db.rollback()
        print(f"An error occurred during object creation: {e}")
        return None


def get_data_list_by_type(
    post_data: dict,
    template_id: str,
    template_name: str,
    template_type: str,
    start: int,
    size: int,
    db: Session,
):
    development_object = models.Object
    object_json_data = development_object.json_data
    init_filter = and_(
        development_object.template_id != constants.WORD_TEMPLATE_ID,
        object_json_data["template_type"].astext == template_type,
        object_json_data["review_status"].astext != constants.REVIEW_STATUS_PASSED_REVIEW_WAITING_PUBLISHED,
        object_json_data["review_status"].astext.like(f"{constants.REVIEW_STATUS_PASSED_REVIEW}%"),
    )
    query_cmd = db.query(development_object).filter(init_filter)
    sample_list = []
    object_orgin_data = object_json_data["origin_post_data"]
    word_order = template_crud.get_template(db, template_id).json_schema["word_order"]
    search_content_list = []
    for obj in word_order:
        obj_title = obj["title"]
        if obj_title in post_data:
            obj_type = obj["type"]
            if obj_type not in ["string", "number", "number_range", "enum_text"]:
                continue
            if obj_type == "string":
                query_cmd = query_cmd.filter(
                    object_orgin_data[obj_title].astext.like(
                        f"%{post_data[obj_title]}%"
                    )
                )
                if post_data[obj_title] != "":
                    search_content_list.append(post_data[obj_title])
            elif obj_type == "number":
                query_cmd = query_cmd.filter(
                    cast(object_orgin_data[obj_title], Numeric)
                    == cast(post_data[obj_title], Numeric)
                )
                if str(post_data[obj_title]) != "":
                    search_content_list.append(str(post_data[obj_title]))
            elif obj_type == "number_range":
                number_range_list = ["", ""]
                if "start" in post_data[obj_title]:
                    query_cmd = query_cmd.filter(
                        cast(object_orgin_data[obj_title]["start"], Numeric)
                        >= cast(post_data[obj_title]["start"], Numeric)
                    )
                    number_range_list[0] = str(post_data[obj_title]["start"])
                if "end" in post_data[obj_title]:
                    query_cmd = query_cmd.filter(
                        cast(object_orgin_data[obj_title]["end"], Numeric)
                        <= cast(post_data[obj_title]["end"], Numeric)
                    )
                    number_range_list[1] = str(post_data[obj_title]["end"])
                if number_range_list[0] != "" or number_range_list[1] != "":
                    search_content_list.append("~".join(number_range_list))
            elif obj_type == "enum_text":
                query_cmd = query_cmd.filter(
                    object_orgin_data[obj_title].contains(post_data[obj_title])
                )
                if len(post_data) > 0:
                    search_content_list.append(
                        "[" + ",".join(post_data[obj_title]) + "]"
                    )
        search_engine = config.PLATFORM_NAME
        search_content = ",".join(search_content_list)
        website = config.PLATFORM_WEBSITE
        search_time = datetime.datetime.now().strftime("%Y-%m-%d-%I:%M:%S")
        citation_content_list = [
            search_engine,
            search_content,
            website,
            template_name,
            search_time,
        ]
    return {
        "sample_list": query_cmd.offset(start).limit(size).all(),
        "citation_content": ", ".join(citation_content_list),
    }


def get_related_data(
    template_id: str, sample_MGID: str, start: int, size: int, db: Session
):
    development_object = models.Object
    object_json_data = development_object.json_data
    init_filter = and_(
        development_object.template_id != constants.WORD_TEMPLATE_ID,
        or_(
            object_json_data["template_type"].astext == "source",
            object_json_data["template_type"].astext == "derived",
        ),
        object_json_data["origin_post_data"]["关联样品MGID"].contains([sample_MGID]),
        object_json_data["review_status"].astext != constants.REVIEW_STATUS_PASSED_REVIEW_WAITING_PUBLISHED,
        object_json_data["review_status"].astext.like(f"{constants.REVIEW_STATUS_PASSED_REVIEW}%"),
    )
    query_cmd = db.query(
        models.Object,
        development_object.template_id,
    ).filter(init_filter)
    related_data = {}
    for db_obj in query_cmd.offset(start).limit(size).all():
        template_name = template_crud.get_template(db, db_obj[1]).name
        single_related_data = db_obj[0]
        if template_name in related_data:
            related_data[template_name].append(single_related_data)
        else:
            related_data[template_name] = [single_related_data]
    return related_data


def get_dev_data_list(db: Session, user: str, start: int, size: int):
    return (
        db.query(models.Object)
        .filter(models.Object.json_data["author"].astext == user)
        .filter(models.Object.template_id.notin_(constants.EXCLUDETEMPLATES))
        .order_by(models.Object.json_data["create_timestamp"].astext.desc())
        .limit(size)
        .offset(start)
        .all()
    )


def get_dev_data_count(db: Session, user: str):
    return (
        db.query(func.count(models.Object.id))
        .filter(models.Object.json_data["author"].astext == user)
        .filter(models.Object.template_id.notin_(constants.EXCLUDETEMPLATES))
        .scalar()
    )


def filter_dev_data_list(
    db: Session,
    user: str,
    status_filter: str,
    start: int,
    size: int,
):
    return (
        db.query(models.Object)
        .filter(models.Object.json_data["author"].astext == user)
        .filter(
            models.Object.json_data["review_status"].astext.like(f"{status_filter}%")
        )
        .filter(models.Object.template_id.notin_(constants.EXCLUDETEMPLATES))
        .order_by(models.Object.json_data["create_timestamp"].astext.desc())
        .limit(size)
        .offset(start)
        .all()
    )


def filter_dev_data_count(db: Session, user: str, status_filter: str):
    return (
        db.query(func.count(models.Object.id))
        .filter(models.Object.json_data["author"].astext == user)
        .filter(
            models.Object.json_data["review_status"].astext.like(f"{status_filter}%")
        )
        .filter(models.Object.template_id.notin_(constants.EXCLUDETEMPLATES))
        .scalar()
    )


def delete_dev_data(db: Session, id: uuid.UUID):
    db.query(models.Object).filter(models.Object.id == id).delete()
    db.commit()


def deprecate_dev_data(db: Session, id: uuid.UUID):
    db.query(models.Object).filter(models.Object.id == id).update(
        {
            models.Object.json_data: func.jsonb_set(
                models.Object.json_data,
                "{review_status}",
                json.dumps(constants.REVIEW_STATUS_DEPRECATED),
            )
        },
        synchronize_session="fetch",
    )
    db.commit()


def update_development_data(
    json_data: dict, template_id: str, db: Session, object_id: str
):
    db.query(models.Object).filter(models.Object.id == object_id).update(
        {models.Object.json_data: json_data}
    )
    db.commit()


def get_development_data_author_with_id(db: Session, object_id: str):
    return (
        db.query(models.Object)
        .filter(models.Object.id == object_id)
        .first()
        .json_data["author"]
    )


def get_development_data_review_status_with_id(db: Session, id: str):
    query_cmd = db.query(models.Object.json_data["review_status"]).filter(
        models.Object.id == id
    )
    review_status = query_cmd.first()[0]
    return review_status


def change_review_state(db: Session, id: str, review_status: str):
    db.query(models.Object).filter(models.Object.id == id).update(
        {
            models.Object.json_data: func.jsonb_set(
                models.Object.json_data,
                text("'{review_status}'"),
                text(f"'{json.dumps(review_status)}'"),
            )
        },
        synchronize_session="fetch",
    )
    db.commit()
