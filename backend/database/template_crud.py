from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, JSON, cast, update, String, func
import json
from . import models, serialnumber_crud
from common import utils, constants
import uuid
import sqlalchemy


def get_template(db: Session, template_id: str):
    try:
        return (
            db.query(models.Template).filter(models.Template.id == template_id).first()
        )
    except sqlalchemy.exc.DataError as e:
        return None
    except Exception as e:
        raise e


def get_create_template(db: Session, template_name: str, json_schema: dict):
    try:
        db_template = models.Template(name=template_name, json_schema=json_schema)
        db.add(db_template)
        db.commit()
        db.refresh(db_template)
        return db_template
    except:
        db.rollback()
        return None


def update_template(db: Session, template_name: str, id: str, json_schema: dict):
    db.query(models.Template).filter(models.Template.id == id).update(
        {models.Template.name: template_name, models.Template.json_schema: json_schema}
    )
    db.commit()


def is_template_exist(db: Session, db_template: models.Template, id: str):
    if id == "":
        # create when id is not assigned
        is_exist = (
            db.query(1).filter(models.Template.name == db_template.name)
        ).first()
    else:
        # update with known id
        is_exist = (
            db.query(1)
            .filter(
                and_(
                    models.Template.name == db_template.name,
                    models.Template.id != id,
                )
            )
            .limit(1)
        ).first()
    return is_exist != None


def get_templates_list(db: Session, user: str, start: int, size: int):
    templates_list = (
        db.query(models.Template.id, models.Template.json_schema)
        .filter(models.Template.json_schema["author"].astext == user)
        .order_by(models.Template.json_schema["create_timestamp"].astext.desc())
        .slice(start, start + size)
    ).all()
    return [
        {"id": t.id, "json_schema": t.json_schema}
        for t in templates_list
        ]


def get_templates_count(db: Session, user: str):
    templates_count = (
        db.query(func.count(models.Template.id))
        .filter(models.Template.json_schema["author"].astext == user)
        .scalar()
    )
    return templates_count


def filter_templates_list(
    db: Session,
    user: str,
    status_filter: str,
    start: int,
    size: int,
):
    templates_list = (
        db.query(models.Template.id, models.Template.json_schema)
        .filter(
            and_(
                models.Template.json_schema["author"].astext == user,
                models.Template.json_schema["review_status"].astext.like(f"%{status_filter}%"),
            )
        )
        .order_by(models.Template.json_schema["create_timestamp"].astext.desc())
        .slice(start, start + size)
        .all()
    )
    return templates_list


def filter_templates_count(db: Session, user: str, status_filter: str):
    templates_count = (
        db.query(func.count(models.Template.id))
        .filter(
            and_(
                models.Template.json_schema["author"].astext == user,
                models.Template.json_schema["review_status"].astext.like(f"%{status_filter}%"),
            )
        )
        .scalar()
    )
    return templates_count


def delete_template(db: Session, id: uuid.UUID):
    db.query(models.Template).filter(
        models.Template.id.notin_(constants.EXCLUDETEMPLATES)
    ).filter(models.Template.id == id).delete()
    db.commit()


def change_review_state(db: Session, id: str, review_status: str):
    db.query(models.Template).filter(models.Template.id == id).update(
        {
            models.Template.json_schema: func.jsonb_set(
                models.Template.json_schema,
                "{review_status}",
                json.dumps(review_status),
            )
        },
        synchronize_session="fetch",
    )
    db.commit()


def change_citation_count(db: Session, id: str):
    try:
        # 先检查模板是否存在
        template = db.query(models.Template).filter(models.Template.id == id).first()
        if not template:
            print(f"Template not found: {id}")
            return
            
        # 获取当前citation_count，处理可能不存在的情况
        citation_count = template.json_schema.get("citation_count", 0)
        # 确保citation_count是数字类型
        if not isinstance(citation_count, int):
            citation_count = 0
            
        # 更新citation_count
        db.query(models.Template).filter(models.Template.id == id).update(
            {
                models.Template.json_schema: func.jsonb_set(
                    models.Template.json_schema,
                    "{citation_count}",
                    json.dumps(citation_count + 1),
                )
            },
            synchronize_session="fetch",
        )
        db.commit()
    except Exception as e:
        # 发生异常时回滚事务
        db.rollback()
        print(f"change citation_count failed! template id: {id}")
        print(f"Error details: {str(e)}")


def get_template_list_with_begin(db: Session, begin_word: str):
    db_template_list = (
        db.query(models.Template.name, models.Template.id)
        .filter(models.Template.id.notin_(constants.UNSEARCHABLE_TEMPLATE_ID_SET))
        .filter(
            models.Template.json_schema["review_status"].astext.like(
                f"{constants.REVIEW_STATUS_PASSED_REVIEW}%"
            )
        )
        .filter(
            models.Template.json_schema["template_type"].astext != "application",
            cast(models.Template.name, String).like(f"%{begin_word}%"),
        )
    ).all()
    template_list = []
    for i in range(len(db_template_list)):
        db_template = {}
        db_template["name"] = db_template_list[i][0]
        db_template["id"] = db_template_list[i][1]
        template_list.append(db_template)
    return template_list


def get_application_template_list_with_begin(db: Session, begin_word: str):
    db_template_list = (
        db.query(
            models.Template.name,
            models.Template.id,
        )
        .filter(models.Template.id.notin_(constants.UNSEARCHABLE_TEMPLATE_ID_SET))
        .filter(
            models.Template.json_schema["review_status"].astext.like(
                f"{constants.REVIEW_STATUS_PASSED_REVIEW}%"
            )
        )
        .filter(
            models.Template.json_schema["template_type"].astext == "application",
            cast(models.Template.name, String).like(f"%{begin_word}%"),
        )
    ).all()
    template_list = []
    for i in range(len(db_template_list)):
        db_template = {}
        db_template["name"] = db_template_list[i][0]
        db_template["id"] = db_template_list[i][1]
        template_list.append(db_template)
    return template_list


def get_templates_schema_with_id(db: Session, id: str):
    templates_schema_with_id = (
        db.query(models.Template.json_schema["schema"])
        .filter(models.Template.id == id)
        .limit(1)
    ).first()[0]
    return json.dumps(templates_schema_with_id)


def get_templates_word_order_with_id(db: Session, id: str):
    query_cmd = db.query(models.Template.json_schema["word_order"]).filter(
        models.Template.id == id
    )
    word_order = query_cmd.first()[0]
    return word_order


def get_templates_data_type_map_with_id(db: Session, id: str):
    query_cmd = db.query(models.Template.json_schema["data_type_map"]).filter(
        models.Template.id == id
    )
    data_type_map = query_cmd.first()[0]
    return data_type_map


def get_templates_author_with_id(db: Session, id: str):
    query_cmd = db.query(models.Template.json_schema["author"]).filter(
        models.Template.id == id
    )
    author = query_cmd.first()[0]
    return author


def get_templates_review_status_with_id(db: Session, id: str):
    query_cmd = db.query(models.Template.json_schema["review_status"]).filter(
        models.Template.id == id
    )
    review_status = query_cmd.first()[0]
    return review_status


def deprecate_template(db: Session, id: uuid.UUID):
    db.query(models.Template).filter(models.Template.id == id).update(
        {
            models.Template.json_schema: func.jsonb_set(
                models.Template.json_schema,
                "{review_status}",
                json.dumps(constants.REVIEW_STATUS_DEPRECATED),
            )
        },
        synchronize_session="fetch",
    )
    db.commit()
