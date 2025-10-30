from fastapi import Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session
import warnings
from database import word_crud, template_crud, models, schemas, MGID_crud
from database.base import SessionLocal, engine
from common import constants, status, utils, error, auth
from api import user
import uvicorn, json
from common import db
import uuid

router = APIRouter()


@router.get("/api/get_MGID_apply_schema")
def get_MGID_apply_schema(db: Session = Depends(db.get_db)):
    db_template = template_crud.get_template(
        db, template_id=constants.MGID_APPLY_TEMPLATE_ID
    )
    MGID_apply_template_schema = db_template.json_schema
    schema = {
        "title": "",
        "type": "object",
    }
    schema["properties"] = {}
    schema["required"] = []
    for key in MGID_apply_template_schema:
        if not MGID_apply_template_schema[key][constants.INPUT_FLAG]:
            continue
        if MGID_apply_template_schema[key][constants.REQUIRED_FLAG]:
            schema["required"].append(key)
        if not "options" in MGID_apply_template_schema[key]:
            schema["properties"][key] = {
                "type": MGID_apply_template_schema[key]["type"],
                "title": MGID_apply_template_schema[key]["title"],
                "default": "",
            }
        else:
            schema["properties"][key] = {
                "type": "string",
                "title": MGID_apply_template_schema[key]["title"],
                "default": MGID_apply_template_schema[key]["enum"][0],
                "enum": MGID_apply_template_schema[key]["enum"],
            }
    return schema


@router.post("/api/MGID_apply/")
def create_MGID_apply_object(
    data: schemas.MGIDApplyCreate,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    current_user = current_user.user_name
    is_valid, post_data = utils.is_valid_json(json_str=data.json_data)
    if not is_valid:
        warnings.warn("Warning: " + post_data)
        return {"status": status.API_ERR_INVALID_INPUT, "message": post_data}

    json_data = utils.initialize_MGID_apply_metadata(post_data, current_user, db)
    # Removed object store write per new requirement (DB only persistence)
    db_object = models.Object(
        template_id=constants.MGID_APPLY_TEMPLATE_ID, json_data=json_data
    )
    obj = word_crud.create_object(db=db, db_object=db_object)
    if obj is None:
        warnings.warn("Warning: Unable to create the word object.")
        return {
            "status": status.API_ERR_DB_FAILED,
            "message": "Unable to create the word object",
        }
    return {"status": status.API_OK, "data": obj}


@router.get("/api/get_MGID/{MGID}/{custom}")
def get_MGID(MGID: str, custom: str, db: Session = Depends(db.get_db)):
    obj = MGID_crud.get_MGID(db, MGID=MGID + "/" + custom)
    if obj is None:
        data_type = "not_found"
        raise HTTPException(status_code=404, detail="MGID is not found")
    elif str(obj.template_id) != constants.MGID_APPLY_TEMPLATE_ID:
        data_type = "internal"
    else:
        data_type = "external"
    return {"type": data_type, "data": obj}


@router.post("/api/MGID_list")
def get_MGID_list(
    query: utils.ListQuery,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    current_user_name = current_user.user_name
    db_MGID_list = MGID_crud.get_object_list(
                        db=db,
                        user=current_user_name,
                        template_id=constants.MGID_APPLY_TEMPLATE_ID,
                        start=query.start,
                        size=query.size,)
    # Always return status=0 so frontend stops spinner even if no user header
    return {"status": status.API_OK, "data": db_MGID_list}


@router.get("/api/MGID_count")
def get_MGID_count(
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    current_user_name = current_user.user_name
    count = MGID_crud.get_MGID_count(
        db=db,
    user=current_user_name,
        template_id=constants.MGID_APPLY_TEMPLATE_ID,
    )
    return {"status": status.API_OK, "count": count}
