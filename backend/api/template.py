from fastapi import Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session
import warnings, json

from database import template_crud, user_crud, models, schemas
from database.base import SessionLocal, engine
from common import constants, status, utils, db, error, auth
from schema_parser import template_create_schema, basic_information_schema
from data_parser import file_submit
import uvicorn
import uuid


router = APIRouter()


@router.get("/api/templates/{template_id}")
def read_template(
    template_id: str,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    db_template = template_crud.get_template(db, template_id=template_id)
    if db_template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    # 统一返回格式 {status:0, data:{id,name,json_schema}}
    return {"status": status.API_OK, "data": {"id": str(db_template.id), "name": db_template.name, "json_schema": db_template.json_schema}}


@router.post("/api/templates/")
def create_template(
    template: schemas.TemplateCreate,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    current_user = current_user.user_name
    template_json_schema, ERROR = utils.generate_json_schema(
        template=template, db=db, id=""
    )

    if template_json_schema is None:
        return ERROR

    json_schema = utils.initialize_template_metadata(
        data=template_json_schema, current_user=current_user, db=db
    )
    # (Deprecated) 原对象存储写入已停用
    utils.concurrency_write("template.json", json.dumps(json_schema).encode("utf-8"))
    template_create = template_crud.get_create_template(
        db=db, template_name=template.name, json_schema=json_schema
    )
    if template_create is None:
        warnings.warn("Warning: Unable to create the template.")
        return {
            "status": status.API_ERR_DB_FAILED,
            "message": "Unable to create the template",
        }
    return {"status": status.API_OK, "data": template_create}


@router.post("/api/update_templates/{template_id}")
def update_template(
    template_id: str,
    template: schemas.TemplateCreate,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    requester = current_user.user_name
    # 作者校验
    existing_tpl = template_crud.get_template(db, template_id)
    if not existing_tpl:
        return {"status": status.API_INVALID_PARAMETER, "message": "template not found"}
    tpl_author = existing_tpl.json_schema.get("author") if existing_tpl.json_schema else None
    if tpl_author and tpl_author != requester:
        return {"status": status.API_PERMISSION_DENIED}
    template_json_schema, ERROR = utils.generate_json_schema(
        template=template, db=db, id=template_id
    )

    if template_json_schema is None:
        return ERROR

    old_template = template_crud.get_template(db, template_id)
    if (
        old_template.json_schema["review_status"]
        == constants.REVIEW_STATUS_PASSED_REVIEW
        or old_template.json_schema["review_status"]
        == constants.REVIEW_STATUS_PASSED_REVIEW_PREVIEW
    ):
        json_schema = utils.initialize_template_metadata(
            data=template_json_schema, current_user=current_user, db=db
        )
        template_crud.deprecate_template(db=db, id=template_id)
        # (Deprecated) 对象存储写入已停用
        utils.concurrency_write("template.json", json.dumps(json_schema).encode("utf-8"))
        template_create = template_crud.get_create_template(
            db=db, template_name=template.name, json_schema=json_schema
        )
        if template_create is None:
            warnings.warn("Warning: Unable to create the template.")
            return {
                "status": status.API_ERR_DB_FAILED,
                "message": "Unable to create the template",
            }
        return {"status": status.API_OK, "data": template_create}
    else:
        utils.concurrency_write("template.json", json.dumps(template_json_schema).encode("utf-8"))
        template_crud.update_template(
            db=db,
            template_name=template.name,
            json_schema=template_json_schema,
            id=template_id,
        )
        return {"status": status.API_OK}


@router.get("/api/get_template_schema")
def get_template_schema(
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    # 注意: 原先使用 @utils.isAuthor 会因为没有 object_id/template_id/word_id 参数
    # 直接返回 {"status":6} (API_INVALID_PARAMETER)，前端拿不到 basic_information/schema_create 导致一直加载。
    # 这里去掉鉴权装饰器，仅依赖前端传入的用户头部(如果后面需要可改成 token 校验)。
    current_user = current_user.user_name
    db_template_basic_information = template_crud.get_template(
        db, template_id=constants.TEMPLATE_BASIC_INFORMATION_ID
    )
    if not db_template_basic_information or not isinstance(getattr(db_template_basic_information, "json_schema", None), dict):
        return {"status": status.API_ERR_DB_FAILED, "message": "basic_information_template_missing"}
    current_user_organization = user_crud.get_user_organization(
        db=db, name=current_user
    )
    basic_information_schema_ui = basic_information_schema.get_basic_information_schema(
        db_template_basic_information=db_template_basic_information,
        organization=current_user_organization,
    )
    template_create_schema_form = template_create_schema.template_schema_recurrent(
        0, "object"
    )
    return {
        "basic_information": basic_information_schema_ui,
        "schema_create": template_create_schema_form,
    }


@router.get("/api/get_preset_word_list")
def get_preset_word_list(db: Session = Depends(db.get_db)):
    # Note: Removed @utils.isAuthor because the decorator expects identifiers like
    # object_id/template_id/word_id to validate authorship. This endpoint only
    # aggregates preset template words and does not take such params, causing
    # it to always return {"status": API_INVALID_PARAMETER} (6) before.
    template_preset_word = {}
    for template_type in constants.TEMPLATE_PRESET:
        preset_word = []
        template_id = constants.TEMPLATE_PRESET[template_type]
        if template_id != "":
            tpl = template_crud.get_template(db, template_id)
            if tpl and isinstance(getattr(tpl, "json_schema", None), dict):
                preset_template = tpl.json_schema
                word_order = preset_template.get("word_order", [])
                for obj in word_order:
                    # Defensive: ensure expected keys exist
                    title = obj.get("title")
                    typ = obj.get("type")
                    if title and typ:
                        preset_word.append(
                            utils.generate_name_type_id_string(title, typ, "")
                        )
        template_preset_word[template_type] = preset_word
    return template_preset_word


@router.post("/api/templates_list")
def get_templates_list(
    query: utils.ListQuery,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    current_user_name = current_user.user_name
    if query.status_filter == "all":
        db_template_list = template_crud.get_templates_list(
            db=db,
            user=current_user_name,
            start=query.start,
            size=query.size,
        )
    else:
        db_template_list = template_crud.filter_templates_list(
            db=db,
            user=current_user_name,
            status_filter=query.status_filter,
            start=query.start,
            size=query.size,
        )
    return {"status": status.API_OK, "data": db_template_list}


@router.post("/api/templates_count")
def get_templates_count(
    query: utils.ListQuery,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    current_user_name = current_user.user_name
    if query.status_filter == "all":
        count = template_crud.get_templates_count(
            db=db,
            user=current_user_name,
        )
    else:
        count = template_crud.filter_templates_count(
            db=db,
            user=current_user_name,
            status_filter=query.status_filter,
        )
    return {"status": status.API_OK, "count": count}


@router.post("/api/delete_template/{template_id}")
@utils.isPresetTemplate
def delete_template(
    template_id: uuid.UUID,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    tpl = template_crud.get_template(db, template_id)
    if not tpl:
        return {"status": status.API_INVALID_PARAMETER, "message": "template not found"}
    author = tpl.json_schema.get("author") if tpl.json_schema else None
    if author and author != current_user.user_name:
        return {"status": status.API_PERMISSION_DENIED}
    template_crud.delete_template(db=db, id=template_id)
    return {"status": status.API_OK}


@router.post("/api/change_template_review_status")
def changeTemplateReviewStatus(
    template_id: uuid.UUID,
    review_status: str,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    tpl = template_crud.get_template(db, template_id)
    if not tpl:
        return {"status": status.API_INVALID_PARAMETER, "message": "template not found"}
    author = tpl.json_schema.get("author") if tpl.json_schema else None
    if author and author != current_user.user_name:
        return {"status": status.API_PERMISSION_DENIED}
    if utils.validate_review_status(review_status):
        template_crud.change_review_state(
            db=db, id=template_id, review_status=review_status
        )
        return {"status": status.API_OK}
    else:
        return {"status": status.API_INVALID_PARAMETER}


@router.get("/api/template_list/{begin_word}")
def get_template_list_with_begin(begin_word: str, db: Session = Depends(db.get_db)):
    template_list = template_crud.get_template_list_with_begin(
        db, begin_word=begin_word
    )
    name_list = []
    name_dict = {}
    for template in template_list:
        name_list.append(template["name"])
        name_dict[template["name"]] = template["id"]
    return {"name_list": name_list, "name_dict": name_dict}


@router.get("/api/template_list/application/{begin_word}")
def get_application_template_list_with_begin(
    begin_word: str, db: Session = Depends(db.get_db)
):
    template_list = template_crud.get_application_template_list_with_begin(
        db, begin_word=begin_word
    )
    name_list = []
    name_dict = {}
    for template in template_list:
        name_list.append(template["name"])
        name_dict[template["name"]] = template["id"]
    return {"name_list": name_list, "name_dict": name_dict}


@router.get("/api/templates_schema/{id}")
def get_templates_schema_with_id(
    id: str,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    return json.loads(template_crud.get_templates_schema_with_id(db, id=id))


@router.get("/api/templates_word_order/{id}")
def get_templates_word_order_with_id(
    id: str,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    return template_crud.get_templates_word_order_with_id(db=db, id=id)


@router.get("/api/templates_empty/{id}")
def get_templates_empty_with_id(
    id: str,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    #data_type_map = template_crud.get_templates_data_type_map_with_id(db=db, id=id)
    #for obj_name in data_type_map:
    #    data_type = data_type_map[obj_name]["type"]
    #    if data_type == "file" or data_type == "image":
    #        return {"status": status.API_CONTAIN_FILE_WORD, "data": {}}
    word_order = template_crud.get_templates_word_order_with_id(db=db, id=id)
    empty_template = file_submit.get_template_empty(word_order)
    return {"status": status.API_OK, "data": empty_template}


@router.post("/api/template_apply_passed_preview/{template_id}")
@utils.isPresetTemplate
def apply_passed_preview(
    template_id: str,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    current_review_status = template_crud.get_templates_review_status_with_id(
        id=template_id, db=db
    )
    if current_review_status == constants.REVIEW_STATUS_PASSED_REVIEW_PREVIEW:
        template_crud.change_review_state(
            db=db,
            id=template_id,
            review_status=constants.REVIEW_STATUS_PASSED_REVIEW_WAITING_REVIEW,
        )
    else:
        return {"status": status.API_INVALID_PARAMETER}
    return {"status": status.API_OK}
