from sqlalchemy.orm import Session
from sqlalchemy import String, cast, not_
from sqlalchemy.dialects.postgresql import JSONB
from common import constants, utils
from . import models, schemas


def get_search_list(db: Session, query: str, queryType, start: int, size: int):
    resultList = {
        "wordResultList": [],
        "templateResultList": [],
        "dataResultList": [],
        "MGIDResultList": [],
    }
    if query == "":
        return resultList
    for item in queryType:
        if item == "word":
            query_cmd = (
                db.query(models.Object)
                .filter(
                    cast(models.Object.template_id, String)
                    == cast(constants.WORD_TEMPLATE_ID, String)
                )
                .filter(
                    cast(models.Object.json_data["chinese_name"], String).like(
                        "%" + query + "%"
                    )
                    | cast(models.Object.json_data["english_name"], String).like(
                        "%" + query + "%"
                    ),
                )
                .filter(
                    cast(models.Object.json_data["review_status"], String).match(
                        cast(constants.REVIEW_STATUS_PASSED_REVIEW, String)
                    )
                )
            )
            resultList["wordResultList"] = query_cmd.offset(start).limit(size).all()
            continue
        if item == "templete":
            query_cmd = (
                db.query(models.Template)
                .filter(cast(models.Template.name, String).like("%" + query + "%"))
                .filter(
                    cast(models.Template.json_schema["review_status"], String).match(
                        cast(constants.REVIEW_STATUS_PASSED_REVIEW, String)
                    )
                )
            )
            for item in constants.EXCLUDETEMPLATES:
                query_cmd = query_cmd.filter(
                    cast(models.Template.id, String) != cast(item, String)
                )
            resultList["templateResultList"] = query_cmd.offset(start).limit(size).all()
            continue
        if item == "studydata":
            query_cmd = (
                db.query(models.Object)
                .filter(
                    cast(models.Object.json_data["title"], String).like(
                        "%" + query + "%"
                    )
                )
                .filter(
                    not_(
                        cast(models.Object.json_data["review_status"], String).match(
                            constants.REVIEW_STATUS_PASSED_REVIEW_WAITING_PUBLISHED
                        )
                    )
                )
                .filter(
                    cast(models.Object.json_data["review_status"], String).match(
                        cast(constants.REVIEW_STATUS_PASSED_REVIEW, String)
                    )
                )
            )
            resultList["dataResultList"] = query_cmd.offset(start).limit(size).all()
            continue
        if item == "MGID":
            query_cmd = (
                db.query(models.Object)
                .filter(
                    cast(models.Object.template_id, String)
                    == cast(constants.MGID_APPLY_TEMPLATE_ID, String),
                )
                .filter(
                    cast(models.Object.json_data["MGID"], String).like(
                        "%" + query + "%"
                    )
                )
            )
            resultList["MGIDResultList"] = query_cmd.offset(start).limit(size).all()
            continue
    return resultList
