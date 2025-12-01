import datetime, string, random, base58, hashlib, struct
import time as pytime
import warnings, json, asyncio
from sqlalchemy.orm import Session
from . import constants
from pydantic import BaseModel
from database import (
    word_crud,
    template_crud,
    development_data_crud,
    user_crud,
    organization_crud,
    country_crud,
    models,
    schemas,
)
from common import status, object_store_service, error
from schema_parser import data_create_schema
from data_parser import web_submit
import config
from functools import wraps


class ListQuery(BaseModel):
    start: int
    size: int
    status_filter: str


class FilterQuery(BaseModel):
    status_filter: str


class ReviewQuery(BaseModel):
    id: str
    reviewer: str
    review_status: str
    rejected_reason: str


def is_valid_json(json_str: str):
    try:
        data = json.loads(json_str)
        return (True, data)
    except:
        return (False, "json schema is invalid")


def initialize_word_metadata(data: dict, serial_number: int, current_user: str):
    data["serial_number"] = serial_number
    data["author"] = current_user
    data["create_timestamp"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data["reviewer"] = None
    data["rejected_reason"] = None
    # 默认审核状态：未审核（系统内部值使用 waiting_review）
    if not data.get("review_status"):
        data["review_status"] = constants.REVIEW_STATUS_WAITING_REVIEW
    return data


def initialize_template_metadata(data: dict, db: Session, current_user: str):
    data["author"] = current_user
    data["create_timestamp"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data["reviewer"] = None
    data["rejected_reason"] = None
    data["citation_count"] = 0
    if (
        data["template_type"] == "application"
        and data["template_source"] == "unstandard"
    ):
        data["source_standard_number"] = generateAPPT(
            data["source_standard_number_custom_field"], current_user, db
        )
        data["source_standard_name"] = data["source_standard_name_custom"]
    return data


def get_MGID_create_time():
    return datetime.datetime.now().strftime("%Y%m%d")


def get_MGID_organization(db: Session, user: str):
    user_info = user_crud.get_userinfo_by_name(db=db, name=user)
    MGID_area = country_crud.get_country_by_name(db=db, name=user_info.country)
    MGID_organization = organization_crud.get_organization_by_name(
        db=db, name=user_info.organization
    )
    return MGID_area.id + MGID_organization.id


def get_MGID_user(db: Session, user: str):
    user_info = user_crud.get_userinfo_by_name(db=db, name=user)
    # User模型中没有user_number字段，使用user_name作为替代
    # 或者可以根据需要生成一个唯一标识符
    return user_info.user_name if user_info else "UNKNOWN_USER"

def steady_time_ns() -> int:
    """跨平台高精度单调时钟（纳秒）"""
    # 优先用 clock_gettime_ns + MONOTONIC_RAW / MONOTONIC
    clock_id = getattr(pytime, "CLOCK_MONOTONIC_RAW", None)
    if clock_id is None:
        clock_id = getattr(pytime, "CLOCK_MONOTONIC", None)

    if hasattr(pytime, "clock_gettime_ns") and clock_id is not None:
        return pytime.clock_gettime_ns(clock_id)

    # 退化方案：Python 3.7+ 都有
    if hasattr(pytime, "monotonic_ns"):
        return pytime.monotonic_ns()

    # 最后兜底（极少数环境）
    return int(pytime.monotonic() * 1e9)

def get_MGID_random():
    pytime.sleep(0.001)
    # t = pytime.clock_gettime_ns(pytime.CLOCK_MONOTONIC_RAW)
    t = steady_time_ns()
    t_seed = struct.pack(">Q", t)
    t_sha256 = hashlib.sha256(t_seed).digest()[:6]  # 6 bytes
    t_base58 = base58.b58encode(t_sha256)
    return bytes.decode(t_base58)


def generateMGID(data: dict, cutorm_field: str, current_user: str, db: Session):
    # e.g. MGID.CN10248.1012.S.20210628/0008.aU7iF4p8
    # rule MGID.[orgnization].[user_number].[source_number].[date]/[custom].[random]
    MGID = ["MGID"]
    # [orgnization]
    MGID.append(get_MGID_organization(db, current_user))
    # [user_number]
    MGID.append(get_MGID_user(db, current_user))
    # [source_number]
    if "source_type" in data:
        source_type = data["source_type"]
    else:
        source_type = template_source_type(
            data["data_generate_method"], data["template_type"]
        )
    if source_type != "":
        MGID.append(source_type)
    # [date]
    MGID.append(get_MGID_create_time())
    # [custom]
    MGID[-1] += "/" + str(cutorm_field)
    # [random]
    MGID.append(get_MGID_random())
    return ".".join(MGID)


def generateAPPT(cutorm_field: str, current_user: str, db: Session):
    # e.g. APPT.CN10248.1012.20210628/0008.aU7iF4p8
    # rule APPT.[orgnization].[user_number].[date]/[custom].[random]
    APPT = ["APPT"]
    # [orgnization]
    APPT.append(get_MGID_organization(db, current_user))
    # [user_number]
    APPT.append(get_MGID_user(db, current_user))
    # [date]
    APPT.append(get_MGID_create_time())
    # [custom]
    APPT[-1] += "/" + str(cutorm_field)
    # [random]
    APPT.append(get_MGID_random())
    return ".".join(APPT)


def initialize_data_metadata(
    data: dict, cutorm_field: str, current_user: str, db: Session
):
    data["author"] = current_user
    data["create_timestamp"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data["reviewer"] = None
    data["rejected_reason"] = None
    # 默认审核状态：未审核（系统内部值使用 waiting_review）
    if not data.get("review_status"):
        data["review_status"] = constants.REVIEW_STATUS_WAITING_REVIEW
    data["MGID"] = generateMGID(data, cutorm_field, current_user, db)
    return data


def update_data_metadata(data: dict, old_data: dict, current_user: str):
    data["author"] = current_user
    data["create_timestamp"] = old_data["create_timestamp"]
    data["reviewer"] = None
    data["rejected_reason"] = None
    # 默认审核状态：未审核（系统内部值使用 waiting_review）
    if not data.get("review_status"):
        data["review_status"] = constants.REVIEW_STATUS_WAITING_REVIEW
    data["MGID"] = old_data["MGID"]
    return data


def initialize_MGID_apply_metadata(data: dict, current_user: str, db: Session):
    data["MGID_submitter"] = current_user
    data["create_timestamp"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data["user_comment"] = None
    data["MGID"] = generateMGID(data, data["custom_field"], current_user, db)
    return data


def template_create_default_template_publish_platform():
    return config.PLATFORM_NAME


def generate_name_type_id_string(name: str, data_type: str, id: str):
    return name + ":" + data_type + ":" + id


def split_name_type_id_string(form_data: str):
    form_data_list = form_data.split(":")
    name = ":".join(form_data_list[:-2])
    data_type = form_data_list[-2]
    id = form_data_list[-1]
    return {"name": name, "type": data_type, "id": id}


def validate_name_type_id_string(form_data: str, db: Session):
    if ":" not in form_data:
        return False
    db_word = word_crud.get_object(db, form_data.split(":")[-1])
    return not db_word is None


def validate_review_status(review_status: str):
    valid_review_status = [
        constants.REVIEW_STATUS_DRAFT,
        constants.REVIEW_STATUS_WAITING_REVIEW,
        constants.REVIEW_STATUS_PASSED_REVIEW,
        constants.REVIEW_STATUS_PASSED_REVIEW_PREVIEW,
        constants.REVIEW_STATUS_REJECTED,
    ]
    return review_status in valid_review_status


def generate_json_data(word: schemas.WordCreate, db: Session, id: str):
    """根据 WordCreate 输入生成标准化词条数据。

    兼容两种格式:
    1. {"json_data": "{...}"} 旧格式 (json_data 为字符串)
    2. {"json_data": {...}} 新格式 (直接传对象)
    """
    form_data = word.json_data

    if isinstance(form_data, dict):
        post_data = form_data
    else:
        is_valid, post_data = is_valid_json(form_data)
        if not is_valid:
            warnings.warn("Warning: " + post_data)
            return (None, {"status": status.API_ERR_INVALID_INPUT, "message": post_data})

    # 基础必填：中文名称
    if not isinstance(post_data, dict) or not post_data.get("chinese_name"):
        return (
            None,
            {
                "status": status.API_ERR_INVALID_INPUT,
                "message": "缺少必填字段: chinese_name",
            },
        )

    # 按数据类型做额外校验
    dt = post_data.get("data_type")
    if dt == "number_range":
        nr = (post_data.get("number_range") or "").strip()
        if not nr or not _validate_number_range(nr):
            return (
                None,
                {
                    "status": status.API_ERR_INVALID_INPUT,
                    "message": "number_range 格式不正确，应为 起始值,结束值;... 且起始值<=结束值",
                },
            )

    # 递归校验对象/列表成员完整性
    try:
        _validate_members_recursively(post_data)
    except ValueError as e:
        return (
            None,
            {"status": status.API_ERR_INVALID_INPUT, "message": str(e)},
        )

    db_object = models.Object(
        template_id=constants.WORD_TEMPLATE_ID, json_data=post_data
    )

    is_exist = word_crud.is_word_exist(db=db, db_object=db_object, word_id=id)
    if is_exist:
        warnings.warn("Warning: word object already exist.")
        return (
            None,
            {
                "status": status.API_ERR_CREATE_DUPLICATE_OBJECT,
                "message": "Word object already exist.",
            },
        )

    return (post_data, None)


def _validate_members_recursively(root: dict, path: str = "root"):
    dt = root.get("data_type")
    # 对象：校验 object_fields
    if dt == "object":
        fields = root.get("object_fields") or []
        if not isinstance(fields, list):
            raise ValueError(f"{path}.object_fields 应为数组")
        for idx, m in enumerate(fields):
            _validate_member(m, f"{path}.object_fields[{idx}]")
    # 数组/列表：若元素是对象，校验 element_fields
    if dt in ("array", "list") and root.get("element_type") == "object":
        fields = root.get("element_fields") or []
        if not isinstance(fields, list):
            raise ValueError(f"{path}.element_fields 应为数组")
        for idx, m in enumerate(fields):
            _validate_member(m, f"{path}.element_fields[{idx}]")


def _validate_member(m: dict, path: str):
    if not isinstance(m, dict):
        raise ValueError(f"{path} 成员应为对象")
    name = (m.get("chinese_name") or "").strip()
    if not name:
        raise ValueError(f"{path}.chinese_name 不能为空")
    dt = m.get("data_type")
    if dt not in ("string", "number", "number_range", "enum_text", "file", "image", "date", "MGID", "object", "array", "list"):
        raise ValueError(f"{path}.data_type 非法")
    if dt == "number":
        if not (m.get("unit") or "").strip():
            raise ValueError(f"{path}.unit 不能为空（数值类型需要单位）")
    if dt == "number_range":
        if not (m.get("unit") or "").strip():
            raise ValueError(f"{path}.unit 不能为空（数值范围需要单位）")
        nr = (m.get("number_range") or "").strip()
        if not nr or not _validate_number_range(nr):
            raise ValueError(f"{path}.number_range 格式不正确")
    if dt == "object":
        for i, child in enumerate(m.get("children") or []):
            _validate_member(child, f"{path}.children[{i}]")
    if dt in ("array", "list") and m.get("element_type") == "object":
        for i, child in enumerate(m.get("element_fields") or []):
            _validate_member(child, f"{path}.element_fields[{i}]")


def _validate_number_range(nr: str) -> bool:
    try:
        # 兼容全角标点：，；
        s = nr.replace("，", ",").replace("；", ";")
        parts = [p.strip() for p in s.split(";") if p.strip()]
        if not parts:
            return False
        for seg in parts:
            if "," not in seg:
                return False
            # 单段时仅允许一个逗号
            if len(parts) == 1 and seg.count(",") != 1:
                return False
            a_str, b_str = [s.strip() for s in seg.split(",", 1)]
            start = float(a_str)
            end = float(b_str)
            if start > end:
                return False
        return True
    except Exception:
        return False


def generate_json_schema(template: schemas.TemplateCreate, db: Session, id: str):
    basic_information_data = template.basic_information
    schema_create_data = template.schema_create

    # json validation
    basic_information_is_valid, basic_information_post_data = is_valid_json(
        basic_information_data
    )
    if not basic_information_is_valid:
        warnings.warn("Warning: " + basic_information_post_data)
        return (
            None,
            {
                "status": status.API_ERR_INVALID_INPUT,
                "message": basic_information_post_data,
            },
        )

    schema_create_is_valid, schema_create_post_data = is_valid_json(schema_create_data)
    if not basic_information_is_valid:
        warnings.warn("Warning: " + schema_create_post_data)
        return (
            None,
            {
                "status": status.API_ERR_INVALID_INPUT,
                "message": schema_create_post_data,
            },
        )

    # exist validation
    db_template = models.Template(
        name=template.name, json_schema=basic_information_post_data
    )
    is_exist = template_crud.is_template_exist(db=db, db_template=db_template, id=id)
    if is_exist:
        warnings.warn("Warning: template already exist.")
        return (
            None,
            {
                "status": status.API_ERR_CREATE_DUPLICATE_TEMPLATE,
                "message": "Template already exist.",
            },
        )

    # generate schema for data create
    data_create_schema_dict = data_create_schema.generate_data_create_schema(
        schema_create_post_data, basic_information_post_data["template_type"], db
    )
    if len(data_create_schema_dict["invalid_word"]) > 0:
        warnings.warn("Warning: Contain invalid word.")
        return (
            None,
            {
                "status": status.API_INVALID_WORD,
                "message": data_create_schema_dict["invalid_word"],
            },
        )

    # store template into database
    template_json_schema = basic_information_post_data.copy()
    template_json_schema["schema"] = data_create_schema_dict["schema"]
    template_json_schema["origin_basic_information"] = basic_information_post_data
    template_json_schema["origin_schema_create"] = schema_create_post_data
    template_json_schema["word_order"] = data_create_schema_dict["word_order"]
    # TODO: if data_type_map is not needed in data create, remove word_name_data_type_map
    template_json_schema["data_type_map"] = data_create_schema_dict["data_type_map"]

    return (template_json_schema, None)


def template_source_type(data_generate_method: str, template_type: str):
    if template_type == "sample":
        if data_generate_method == "calculation":
            return "M"
        else:
            return "S"
    if template_type == "source":
        if data_generate_method == "calculation":
            return "C"
        else:
            return "T"
    if template_type == "derived":
        return "D"
    return ""


def generate_development_json_data(data: schemas.DataCreate, db: Session):
    # form_data = data.json_data
    # is_valid, post_data = is_valid_json(form_data)
    # if not is_valid:
    #     warnings.warn("Warning: " + post_data)
    #     return (
    #         None,
    #         {"status": status.API_ERR_INVALID_INPUT, "message": post_data},
    #         None,
    #     )

    # json_data, cutorm_field, upload_error = web_submit.get_development_data(
    #     db, data.template_id, post_data
    # )
    # if upload_error:
    #     return (None, upload_error, None)

    # # TODO: check whether review_status in ["draft", "waiting_review]"
    # json_data["review_status"] = data.review_status

    # return (json_data, None, cutorm_field)
    template = template_crud.get_template(db, data.template_id)
    if not template:
        return None, {"status": 404, "message": "Template not found"}, {}

    schema = template.json_schema or {}
    word_order = schema.get("word_order", [])

    def _word_order_size(items: list) -> int:
        size = len(items)
        for item in items:
            order = item.get("order", [])
            if isinstance(order, list) and order:
                size += _word_order_size(order)
        return size

    # 如果模板存储的 word_order 缺字段（历史数据缺失），尝试基于原始表单定义重建
    origin_schema_create = schema.get("origin_schema_create")
    template_type = schema.get("template_type")
    if origin_schema_create and template_type:
        rebuilt = data_create_schema.generate_data_create_schema(
            origin_schema_create, template_type, db
        ).get("word_order", [])
        if _word_order_size(rebuilt) > _word_order_size(word_order):
            word_order = rebuilt

    word_order = web_submit._merge_word_order_with_template(
        word_order, schema.get("word_order") or []
    )
    word_order = web_submit._merge_word_order_with_payload(word_order, data.json_data)
    data_content = []
    
    normalized, errors = web_submit.get_development_data_rec(data.json_data, word_order, data_content)
    if errors:
        return None, {"status": 422, "message": "invalid payload", "errors": errors}, {}

    json_data = {
        "template_name": template.name,
        "data_generate_method": schema.get("data_generate_method"),
        "institution": schema.get("institution"),
        "template_type": schema.get("template_type"),
        "data_content": data_content,
        "origin_post_data": normalized,  # 写规范化后的（含文件引用），非原始
        "title": normalized.get("title") or template.name,
        "word_order": word_order,
        "citation_template": "{}，{}[{}].".format(
            schema.get("source_standard_number", ""),
            template.name,
            template_source_type(schema.get("data_generate_method"), schema.get("template_type")),
        ),
    }
    return json_data, None, {}


def concurrency_write(file_name: str, file_data: bytes):
    """(Deprecated) 兼容旧调用：原计划写入对象存储，现在暂不执行实际写入，直接返回占位符。"""
    return "noop"


def concurrency_read(blob_sha256_with_ext: str):
    """(Deprecated) 返回空字节或占位，保持接口不报错。"""
    return b""


def isPresetTemplate(func):
    @wraps(func)
    def _isPresetTemplate(*args, **kwargs):
        if str(kwargs["template_id"]) in constants.EXCLUDETEMPLATES:
            return {"status": status.API_PERMISSION_DENIED}
        res = func(*args, **kwargs)
        return res

    return _isPresetTemplate
