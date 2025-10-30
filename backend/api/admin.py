from fastapi import Depends, HTTPException, APIRouter, Header
from sqlalchemy.orm import Session
from common import constants, status, utils
from common import auth
from database import (
    admin_crud,
    country_crud,
    organization_crud,
    user_crud,
    models,
    schemas,
)
from database.base import SessionLocal, engine
import uvicorn
from common import db
import uuid
from sqlalchemy import update
from database import models as _models


router = APIRouter()


@router.get("/api/whoami")
def whoami(current_user=Depends(auth.get_current_active_user)):
    """调试用：返回当前登录用户及角色，用于前端诊断 401/403。"""
    return {"status": status.API_OK, "data": {"user_name": current_user.user_name, "user_type": getattr(current_user, "user_type", None)}}


@router.post("/api/admin/words_list")
def get_admin_words_list(
    query: utils.ListQuery,
    current_user=Depends(auth.require_roles(["admin", "super_admin"])),
    db: Session = Depends(db.get_db),
):
    if query.status_filter == "all":
        db_word_list = admin_crud.admin_words_list(
            db=db,
            word_template_id=constants.WORD_TEMPLATE_ID,
            start=query.start,
            size=query.size,
        )
    else:
        db_word_list = admin_crud.filter_words_list(
            db=db,
            word_template_id=constants.WORD_TEMPLATE_ID,
            status_filter=query.status_filter,
            start=query.start,
            size=query.size,
        )
    return {"status": status.API_OK, "data": db_word_list}


@router.post("/api/admin/words_count")
def get_words_count(
    query: utils.FilterQuery,
    current_user=Depends(auth.require_roles(["admin", "super_admin"])),
    db: Session = Depends(db.get_db),
):
    if query.status_filter == "all":
        count = admin_crud.admin_words_count(
            db=db,
            word_template_id=constants.WORD_TEMPLATE_ID,
        )
    else:
        count = admin_crud.filter_words_count(
            db=db,
            word_template_id=constants.WORD_TEMPLATE_ID,
            status_filter=query.status_filter,
        )
    return {"status": status.API_OK, "count": count}


@router.post("/api/admin/templates_list")
def get_admin_templates_list(
    query: utils.ListQuery,
    current_user=Depends(auth.require_roles(["admin", "super_admin"])),
    db: Session = Depends(db.get_db),
):
    if query.status_filter == "all":
        db_template_list = admin_crud.admin_templates_list(
            db=db,
            start=query.start,
            size=query.size,
        )
    else:
        db_template_list = admin_crud.filter_templates_list(
            db=db,
            status_filter=query.status_filter,
            start=query.start,
            size=query.size,
        )
    return {"status": status.API_OK, "data": db_template_list}


@router.post("/api/admin/templates_count")
def get_templates_count(
    query: utils.FilterQuery,
    current_user=Depends(auth.require_roles(["admin", "super_admin"])),
    db: Session = Depends(db.get_db),
):
    if query.status_filter == "all":
        count = admin_crud.admin_templates_count(db=db)
    else:
        count = admin_crud.filter_templates_count(
            db=db,
            status_filter=query.status_filter,
        )
    return {"status": status.API_OK, "count": count}


@router.post("/api/admin/data_list")
def get_admin_data_list(
    query: utils.ListQuery,
    current_user=Depends(auth.require_roles(["admin", "super_admin"])),
    db: Session = Depends(db.get_db),
):
    if query.status_filter == "all":
        db_word_list = admin_crud.admin_data_list(
            db=db,
            start=query.start,
            size=query.size,
        )
    else:
        db_word_list = admin_crud.filter_data_list(
            db=db,
            status_filter=query.status_filter,
            start=query.start,
            size=query.size,
        )
    return {"status": status.API_OK, "data": db_word_list}


@router.post("/api/admin/data_count")
def get_data_count(
    query: utils.FilterQuery,
    current_user=Depends(auth.require_roles(["admin", "super_admin"])),
    db: Session = Depends(db.get_db),
):
    if query.status_filter == "all":
        count = admin_crud.admin_data_count(
            db=db,
        )
    else:
        count = admin_crud.filter_data_count(
            db=db,
            status_filter=query.status_filter,
        )
    return {"status": status.API_OK, "count": count}


@router.post("/api/admin/MGID_list")
def get_MGID_list(
    query: utils.ListQuery,
    current_user=Depends(auth.require_roles(["admin", "super_admin"])),
    db: Session = Depends(db.get_db),
):
    db_MGID_list = admin_crud.get_MGID_list(
        db=db,
        template_id=constants.MGID_APPLY_TEMPLATE_ID,
        start=query.start,
        size=query.size,
    )
    return {"status": status.API_OK, "data": db_MGID_list}


@router.get("/api/admin/MGID_count")
def get_MGID_count(
    current_user=Depends(auth.require_roles(["admin", "super_admin"])),
    db: Session = Depends(db.get_db),
):
    count = admin_crud.get_MGID_count(
        db=db,
        template_id=constants.MGID_APPLY_TEMPLATE_ID,
    )
    return {"status": status.API_OK, "count": count}


@router.post("/api/admin/word_review/{word_id}")
def update_word_review(
    word_id: str,
    query: utils.ReviewQuery,
    current_user=Depends(auth.require_roles(["admin", "super_admin"])),
    db: Session = Depends(db.get_db),
):
    if query.id and str(query.id) != str(word_id):
        return {"status": status.API_INVALID_PARAMETER, "message": "id mismatch"}
    admin_crud.object_review_update(
        db=db,
        id=word_id,
        reviewer=query.reviewer,
        review_status=query.review_status,
        rejected_reason=query.rejected_reason,
    )
    return {"status": status.API_OK}


@router.post("/api/admin/template_review/{template_id}")
def update_template_review(
    template_id: str,
    query: utils.ReviewQuery,
    current_user=Depends(auth.require_roles(["admin", "super_admin"])),
    db: Session = Depends(db.get_db),
):
    if query.id and str(query.id) != str(template_id):
        return {"status": status.API_INVALID_PARAMETER, "message": "id mismatch"}
    admin_crud.template_review_update(
        db=db,
        id=template_id,
        reviewer=query.reviewer,
        review_status=query.review_status,
        rejected_reason=query.rejected_reason,
    )
    return {"status": status.API_OK}


@router.post("/api/admin/data_review/{data_id}")
def update_data_review(
    data_id: str,
    query: utils.ReviewQuery,
    current_user=Depends(auth.require_roles(["admin", "super_admin"])),
    db: Session = Depends(db.get_db),
):
    if query.id and str(query.id) != str(data_id):
        return {"status": status.API_INVALID_PARAMETER, "message": "id mismatch"}
    admin_crud.object_review_update(
        db=db,
        id=data_id,
        reviewer=query.reviewer,
        review_status=query.review_status,
        rejected_reason=query.rejected_reason,
    )
    return {"status": status.API_OK}


@router.post("/api/admin/country_list")
def get_country_list(
    query: utils.ListQuery,
    current_user=Depends(auth.require_roles(["admin", "super_admin"])),
    db: Session = Depends(db.get_db),
):
    db_list = country_crud.get_country_list(
        db=db,
        start=query.start,
        size=query.size,
    )
    return {"status": status.API_OK, "data": db_list}


@router.post("/api/admin/country_count")
def get_country_count(
    query: utils.FilterQuery,
    current_user=Depends(auth.require_roles(["admin", "super_admin"])),
    db: Session = Depends(db.get_db),
):
    count = country_crud.get_country_count(
        db=db,
    )
    return {"status": status.API_OK, "count": count}


@router.post("/api/admin/delete_country/{country_id}")
def delete_country(
    country_id: str, current_user=Depends(auth.require_roles(["admin", "super_admin"])), db: Session = Depends(db.get_db)
):
    country_crud.delete_country(db=db, id=country_id)
    return {"status": status.API_OK}


@router.post("/api/admin/organization_list")
def get_organization_list(
    query: utils.ListQuery,
    current_user=Depends(auth.require_roles(["admin", "super_admin"])),
    db: Session = Depends(db.get_db),
):
    db_list = organization_crud.get_organization_list(
        db=db,
        start=query.start,
        size=query.size,
    )
    return {"status": status.API_OK, "data": db_list}


@router.post("/api/admin/organization_count")
def get_organization_count(
    query: utils.FilterQuery,
    current_user=Depends(auth.require_roles(["admin", "super_admin"])),
    db: Session = Depends(db.get_db),
):
    count = organization_crud.get_organization_count(
        db=db,
    )
    return {"status": status.API_OK, "count": count}


@router.post("/api/admin/delete_organization/{organization_id}")
def delete_organization(
    organization_id: str,
    current_user=Depends(auth.require_roles(["admin", "super_admin"])),
    db: Session = Depends(db.get_db),
):
    organization_crud.delete_organization(db=db, id=organization_id)
    return {"status": status.API_OK}


@router.post("/api/admin/user_list")
def get_organization_list(
    query: utils.ListQuery,
    current_user=Depends(auth.require_roles(["admin", "super_admin"])),
    db: Session = Depends(db.get_db),
):
    db_list = user_crud.get_user_list(
        db=db,
        start=query.start,
        size=query.size,
    )
    return {"status": status.API_OK, "data": db_list}


@router.post("/api/admin/user_count")
def get_organization_count(
    current_user=Depends(auth.require_roles(["admin", "super_admin"])), db: Session = Depends(db.get_db)
):
    count = user_crud.get_user_count(
        db=db,
    )
    return {"status": status.API_OK, "count": count}


@router.post("/api/admin/delete_user/{user_id}")
def delete_user(
    user_id: str, current_user=Depends(auth.require_roles(["admin", "super_admin"])), db: Session = Depends(db.get_db)
):
    target_user_name = user_crud.get_username_by_id(db=db, id=user_id)
    if user_crud.get_admin_level(
        db=db, name=target_user_name
    ) <= user_crud.get_admin_level(db=db, name=current_user.user_name):
        return {"status": status.API_PERMISSION_DENIED}
    user_crud.delete_user(db=db, id=user_id)
    return {"status": status.API_OK}


@router.get("/api/admin/can_delete_user/{user_id}")
def can_delete_user(
    user_id: str, current_user=Depends(auth.require_roles(["admin", "super_admin"])), db: Session = Depends(db.get_db)
):
    target_user_name = user_crud.get_username_by_id(db=db, id=user_id)
    return user_crud.get_admin_level(
        db=db, name=target_user_name
    ) > user_crud.get_admin_level(db=db, name=current_user.user_name)


@router.get("/api/admin/check_admin")
def check_admin(current_user=Depends(auth.require_roles(["admin", "super_admin"]))):
    # 如果能到达这里说明权限已通过，直接返回 True
    return True


@router.get("/api/admin/check_superadmin")
def check_superadmin(current_user=Depends(auth.require_roles(["super_admin"]))):
    return True

@router.post("/api/admin/set_user_role")
def set_user_role(
    user_name: str,
    new_role: str,
    current_user=Depends(auth.require_roles(["super_admin"])),
    db: Session = Depends(db.get_db),
):
    """仅 super_admin 可调用：更新指定用户 user_type。
    返回 {status:0} 或错误码。
    """
    new_role_norm = (new_role or "").strip().lower()
    if new_role_norm not in {"normal", "admin", "super_admin"}:
        return {"status": status.API_INVALID_PARAMETER, "message": "invalid role"}
    target = user_crud.get_userinfo_by_name(db=db, name=user_name)
    if not target:
        return {"status": status.API_INVALID_PARAMETER, "message": "user not found"}
    # 防止降级自己导致失去权限（可选逻辑）
    if user_name == current_user.user_name and new_role_norm != "super_admin":
        return {"status": status.API_PERMISSION_DENIED, "message": "cannot downgrade self"}
    db.query(models.User).filter(models.User.user_name == user_name).update({models.User.user_type: new_role_norm})
    db.commit()
    return {"status": status.API_OK}
