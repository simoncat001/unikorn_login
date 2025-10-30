from fastapi import Depends, HTTPException, APIRouter, Header, Body
from sqlalchemy.orm import Session
import warnings, json
from database import word_crud, template_crud, serialnumber_crud, models, schemas
from common import constants, status, utils, auth
from common import db
import uuid

# 注意：不要在模块导入时执行 create_all，避免导入阶段就需要数据库连接。
# 统一在 main.py 启动时执行。

router = APIRouter()
MAX_WORD_DEPTH = 5


# ==== helpers: serialization / hierarchy ====

def _serialize_word(obj: models.Object):
    """统一返回格式: 将对象 json_data 扁平展开, 根级添加 id."""
    if obj is None:
        return None
    data = {"id": str(obj.id)}
    if isinstance(obj.json_data, dict):
        data.update(obj.json_data)
    return data


def _compute_depth(db: Session, super_id: str) -> int:
    """直接使用父节点的 hierarchy_level + 1，若父缺失或没存则回退为2/1"""
    parent_obj = word_crud.get_object(db=db, object_id=super_id)
    if parent_obj is None:
        return 1
    parent_level = parent_obj.json_data.get("hierarchy_level")
    if parent_level is None:
        # 回退：尝试逐级向上（兼容旧数据）
        depth = 1
        current = super_id
        while current:
            p = word_crud.get_object(db=db, object_id=current)
            if p is None:
                break
            depth += 1
            current = p.json_data.get("super_class_id") or p.json_data.get("parent_word_id")
            if depth > MAX_WORD_DEPTH:
                return depth
        return depth
    return int(parent_level) + 1


def _detect_cycle(db: Session, node_id: str, new_super_id: str) -> bool:
    """检测将 node 的父级改为 new_super_id 是否形成循环"""
    current = new_super_id
    while current:
        if current == node_id:
            return True
        obj = word_crud.get_object(db=db, object_id=current)
        if obj is None:
            return False
        current = obj.json_data.get("parent_word_id") or obj.json_data.get("super_class_id")
    return False


# ==== helpers: build getWordCreateSchema (rich, with object/array/list) ====

def _fetch_word_template_schema(db: Session) -> dict:
    db_template = template_crud.get_template(db, template_id=constants.WORD_TEMPLATE_ID)
    if db_template and getattr(db_template, "json_schema", None):
        return db_template.json_schema
    return {}


def _build_data_type_dependencies():
    return {
        "data_type": {
            "oneOf": [
                {"properties": {"data_type": {"enum": ["string", "image", "file", "date", "MGID"]}}},
                {"properties": {"data_type": {"enum": ["number"]}, "unit": {"type": "string", "title": "数值单位", "default": ""}}, "required": ["unit"]},
                {"properties": {"data_type": {"enum": ["number_range"]}, "unit": {"type": "string", "title": "数值单位", "default": ""}, "number_range": {"type": "string", "title": "数值范围", "description": "格式: 起始值,结束值; 多个区间用分号分隔", "default": ""}}, "required": ["unit", "number_range"]},
                {"properties": {"data_type": {"enum": ["enum_text"]}, "options": {"type": "array", "title": "可选项列表", "default": "", "items": {"type": "string"}}}, "required": ["options"]},
                {"properties": {"data_type": {"enum": ["object"]}, "object_fields": {"type": "array", "title": "对象字段", "minItems": 1, "default": [{}], "items": {"$ref": "#/definitions/member"}}}},
                {"properties": {"data_type": {"enum": ["array"]}, "element_type": {"type": "string", "title": "元素类型", "enum": ["string", "number", "number_range", "enum_text", "file", "image", "date", "MGID", "object"]}, "collection_fixed_length": {"type": "integer", "minimum": 1, "title": "元素个数", "default": 1}, "element_fields": {"type": "array", "title": "元素对象字段", "items": {"$ref": "#/definitions/member"}, "default": []}}, "required": ["element_type", "collection_fixed_length"]},
                {"properties": {"data_type": {"enum": ["list"]}, "element_type": {"type": "string", "title": "元素类型", "enum": ["string", "number", "number_range", "enum_text", "file", "image", "date", "MGID", "object"]}, "element_fields": {"type": "array", "title": "元素对象字段", "items": {"$ref": "#/definitions/member"}, "default": []}}, "required": ["element_type"]},
            ]
        }
    }


def _member_definition():
    return {
        "type": "object",
        "properties": {
            "chinese_name": {"type": "string", "title": "中文名称"},
            "english_name": {"type": "string", "title": "英文名称", "default": ""},
            "abbr": {"type": "string", "title": "缩写", "default": ""},
            "definition": {"type": "string", "title": "定义", "default": ""},
            "source_standard_id": {"type": "string", "title": "来源标准编号", "default": ""},
            "source_standard_name": {"type": "string", "title": "来源标准名称", "default": ""},
            "data_type": {"type": "string", "title": "数据类型", "enum": ["string", "number", "number_range", "enum_text", "file", "image", "date", "MGID", "object", "array", "list"]},
            "required": {"type": "boolean", "title": "必填", "default": False},
            "unit": {"type": "string", "title": "数值单位", "default": ""},
            "number_range": {"type": "string", "title": "数值范围", "default": ""},
        },
        "required": ["chinese_name", "data_type"],
        "dependencies": {
            "data_type": {
                "oneOf": [
                    {"properties": {"data_type": {"enum": ["object"]}, "object_fields": {"type": "array", "title": "对象字段", "minItems": 1, "default": [{}], "items": {"$ref": "#/definitions/member"}}}},
                    {"properties": {"data_type": {"enum": ["string"]}}},
                    {"properties": {"data_type": {"enum": ["file"]}}},
                    {"properties": {"data_type": {"enum": ["image"]}}},
                    {"properties": {"data_type": {"enum": ["date"]}}},
                    {"properties": {"data_type": {"enum": ["MGID"]}}},
                    {"properties": {"data_type": {"enum": ["enum_text"]}}},
                    {"properties": {"data_type": {"enum": ["number"]}, "unit": {"type": "string"}}, "required": ["unit"]},
                    {"properties": {"data_type": {"enum": ["number_range"]}, "unit": {"type": "string"}, "number_range": {"type": "string"}}, "required": ["unit", "number_range"]},
                    {"properties": {"data_type": {"enum": ["array"]}}},
                    {"properties": {"data_type": {"enum": ["list"]}}},
                ]
            }
        }
    }


def _base_schema():
    return {
        "title": "",
        "type": "object",
        "dependencies": _build_data_type_dependencies(),
        "definitions": {"member": _member_definition()},
        "properties": {},
        "required": [],
    }


def _inject_template_fields(schema: dict, tpl_schema: dict):
    for key in tpl_schema or {}:
        field_cfg = tpl_schema[key]
        if not field_cfg.get(constants.INPUT_FLAG, False):
            continue
        if field_cfg.get(constants.REQUIRED_FLAG):
            schema["required"].append(key)
        if "options" not in field_cfg:
            schema["properties"][key] = {
                "type": field_cfg.get("type", "string"),
                "title": field_cfg.get("title", key),
                "default": "",
            }
        else:
            schema["properties"][key] = {
                "type": "string",
                "title": field_cfg.get("title", key),
                "default": (field_cfg.get("enum") or [""])[0],
                "enum": field_cfg.get("enum", []),
            }


def _add_base_editable_fields(schema: dict):
    def add(name: str, prop: dict, required: bool = False):
        if name not in schema["properties"]:
            schema["properties"][name] = prop
        if required and name not in schema["required"]:
            schema["required"].append(name)

    add("chinese_name", {"type": "string", "title": "中文名称", "default": ""}, required=True)
    add("english_name", {"type": "string", "title": "英文名称", "default": ""})
    add("abbr", {"type": "string", "title": "缩写", "default": ""})
    add("definition", {"type": "string", "title": "定义", "default": ""})
    add("source_standard_id", {"type": "string", "title": "来源标准编号", "default": ""})
    add("source_standard_name", {"type": "string", "title": "来源标准名称", "default": ""})


def _ensure_data_type(schema: dict):
    base_enum = [
        "string",
        "number",
        "number_range",
        "file",
        "date",
        "enum_text",
        "image",
        "MGID",
        "object",
        "array",
        "list",
    ]
    dt = schema["properties"].get("data_type")
    if dt is None:
        schema["properties"]["data_type"] = {
            "type": "string",
            "title": "数据类型",
            "default": "string",
            "enum": base_enum,
        }
        return
    enums = dt.get("enum")
    if isinstance(enums, list) and enums:
        dt["enum"] = list(dict.fromkeys(enums + ["object", "array", "list"]))
    else:
        dt["enum"] = base_enum
        if "default" not in dt:
            dt["default"] = "string"


# ==== routes ====

@router.post("/api/words/")
def create_word_object(
    word: schemas.WordCreate,
    inherit: bool = False,  # 改为 query 参数，允许前端只发送 {"json_data": ...}
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    """创建词汇；支持 inherit 参数（通过查询参数 ?inherit=true）。

    说明：之前 422 的原因是多个 body 参数导致 FastAPI 期望形如 {"word": {"json_data": "..."}, "inherit": false}。
    现已改为只需发送 {"json_data": "..."} 或 {"json_data": {...}}。
    """
    from typing import Dict, Any, cast
    current_user_name = cast(str, current_user.user_name)
    post_data, ERROR = utils.generate_json_data(word=word, db=db, id="")
    if post_data is None:
        return ERROR

    if "data_type" not in post_data and "type" in post_data:
        post_data["data_type"] = post_data.pop("type")

    # super_class_id 兼容：直接从解析后的 post_data 中读取
    super_id = post_data.get("super_class_id") or post_data.get("parent_word_id")
    parent_payload: Dict[str, Any] | None = None
    if super_id:
        parent_obj = word_crud.get_object(db=db, object_id=super_id)
        if (
            parent_obj is None
            or str(parent_obj.template_id) != constants.WORD_TEMPLATE_ID
        ):
            return {"status": status.API_INVALID_PARAMETER, "message": "parent word not found"}
        if parent_obj.json_data.get("data_type") != "object":
            return {"status": status.API_INVALID_PARAMETER, "message": "parent word must be object type"}
        if post_data.get("data_type") != "object":
            return {"status": status.API_INVALID_PARAMETER, "message": "only object type word can set parent"}
        depth = _compute_depth(db, super_id)
        if depth > MAX_WORD_DEPTH:
            return {"status": status.API_INVALID_PARAMETER, "message": f"max depth {MAX_WORD_DEPTH} exceeded"}
        post_data["super_class_id"] = super_id
        post_data["hierarchy_level"] = depth
        if inherit:
            parent_payload = cast(Dict[str, Any], parent_obj.json_data).copy() if isinstance(parent_obj.json_data, dict) else {}
            # 剔除不继承字段
            for k in [
                "serial_number",
                "author",
                "reviewer",
                "rejected_reason",
                "create_timestamp",
                "review_status",
                "hierarchy_level",
                "super_class_id",
                "parent_word_id",
                "id",
            ]:
                parent_payload.pop(k, None)
    else:
        if post_data.get("data_type") == "object" and "hierarchy_level" not in post_data:
            post_data["hierarchy_level"] = 1

    if inherit and isinstance(parent_payload, dict) and parent_payload:
        # 父级字段 + 子级显式字段覆盖
        merged = parent_payload
        merged.update(post_data)
        post_data = merged

    serial_number = serialnumber_crud.get_serial_number(db=db, type="word")
    if serial_number is None:
        return {"status": status.API_ERR_DB_FAILED, "message": "Unable to get serial number"}

    if not isinstance(post_data, dict):
        return {"status": status.API_ERR_INVALID_INPUT, "message": "json_data must be dict"}
    json_data = utils.initialize_word_metadata(cast(Dict[str, Any], post_data), cast(int, serial_number), current_user_name)
    db_object = models.Object(template_id=constants.WORD_TEMPLATE_ID, json_data=json_data)
    obj = word_crud.create_object(db=db, db_object=db_object)
    if obj is None:
        return {"status": status.API_ERR_DB_FAILED, "message": "Unable to create the word object"}
    return {"status": status.API_OK, "data": _serialize_word(obj)}


@router.post("/api/update_words/{word_id}")
def update_word(
    word_id: str,
    word: schemas.WordCreate,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    existing = word_crud.get_object(db=db, object_id=word_id)
    if not existing:
        return {"status": status.API_INVALID_PARAMETER, "message": "word not found"}
    author = existing.json_data.get("author")
    if author and author != current_user.user_name:
        return {"status": status.API_PERMISSION_DENIED}
    current_user_name = current_user.user_name

    post_data, ERROR = utils.generate_json_data(word=word, db=db, id=word_id)

    if post_data is None:
        return ERROR
    # 兼容: 'type' -> 'data_type'
    if "data_type" not in post_data and "type" in post_data:
        post_data["data_type"] = post_data.pop("type")
    # 父级词汇处理
    super_id = post_data.get("super_class_id") or post_data.get("parent_word_id")
    if super_id is not None:  # 传入才处理（未传表示不变）
        if super_id == "":
            # 清除父级（兼容旧字段）
            post_data.pop("super_class_id", None)
            post_data.pop("parent_word_id", None)
            post_data.pop("hierarchy_level", None)
        else:
            if super_id == word_id:
                return {"status": status.API_INVALID_PARAMETER, "message": "parent cannot be itself"}
            parent_obj = word_crud.get_object(db=db, object_id=super_id)
            if (
                parent_obj is None
                or str(parent_obj.template_id) != constants.WORD_TEMPLATE_ID
            ):
                return {"status": status.API_INVALID_PARAMETER, "message": "parent word not found"}
            parent_data_type = parent_obj.json_data.get("data_type")
            if parent_data_type != "object":
                return {"status": status.API_INVALID_PARAMETER, "message": "parent word must be object type"}
            current_data_type = post_data.get("data_type")
            if current_data_type != "object":
                return {"status": status.API_INVALID_PARAMETER, "message": "only object type word can set parent"}
            # 循环检测
            if _detect_cycle(db, word_id, super_id):
                return {"status": status.API_INVALID_PARAMETER, "message": "cycle detected"}
            depth = _compute_depth(db, super_id)
            if depth > MAX_WORD_DEPTH:
                return {"status": status.API_INVALID_PARAMETER, "message": f"max depth {MAX_WORD_DEPTH} exceeded"}
            post_data["super_class_id"] = super_id
            post_data.pop("parent_word_id", None)
            post_data["hierarchy_level"] = depth
    else:
        # 若清除父级后成为根，设层级=1（仅 object 类型）
        # 兼容旧数据：若只有 parent_word_id 迁移到 super_class_id
        if "super_class_id" not in post_data and post_data.get("parent_word_id"):
            post_data["super_class_id"] = post_data.pop("parent_word_id")
        if post_data.get("data_type") == "object" and "super_class_id" not in post_data:
            post_data["hierarchy_level"] = 1

    serial_number = word_crud.get_objects_serial_number_with_id(
        db=db, object_id=word_id
    )
    json_data = utils.initialize_word_metadata(post_data, serial_number, current_user_name)
    # 直接更新
    word_crud.update_object(db=db, json_data=json_data, object_id=word_id)
    updated = word_crud.get_object(db, object_id=word_id)
    return {"status": status.API_OK, "data": _serialize_word(updated)}


@router.post("/api/my_words_list")
def get_my_words_list(
    query: utils.ListQuery,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    current_user_name = current_user.user_name
    if query.status_filter == "all":
        db_word_list = word_crud.get_my_words_list(
            db=db,
            user=current_user_name,
            word_template_id=constants.WORD_TEMPLATE_ID,
            start=query.start,
            size=query.size,
        )
    else:
        db_word_list = word_crud.filter_words_list(
            db=db,
            user=current_user_name,
            word_template_id=constants.WORD_TEMPLATE_ID,
            status_filter=query.status_filter,
            start=query.start,
            size=query.size,
        )
    return {"status": status.API_OK, "data": db_word_list}


@router.get("/api/word_list/{begin_word}")
def get_word_list_with_begin(begin_word: str, db: Session = Depends(db.get_db)):
    word_list = word_crud.get_word_list_with_begin(db, begin_word=begin_word)
    name_list = []
    name_dict = {}
    for word in word_list:
        name_list.append(word["name"])
        name_dict[word["name"]] = [word["data_type"], word["id"]]
    return {"name_list": name_list, "name_dict": name_dict}


@router.post("/api/words_count")
def get_words_count(
    query: utils.ListQuery,
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    current_user_name = current_user.user_name
    if query.status_filter == "all":
        count = word_crud.get_words_count(
            db=db,
            user=current_user_name,
            word_template_id=constants.WORD_TEMPLATE_ID,
        )
    else:
        count = word_crud.filter_words_count(
            db=db,
            user=current_user_name,
            word_template_id=constants.WORD_TEMPLATE_ID,
            status_filter=query.status_filter,
        )
    return {"status": status.API_OK, "count": count}


@router.post("/api/delete_word")
def delete_word(word: schemas.Word, db: Session = Depends(db.get_db)):
    word_crud.delete_word(db=db, id=word.id)
    return {"status": status.API_OK}


@router.get("/api/words/children_one")
def get_children_one(parent_id: str | None = None, db: Session = Depends(db.get_db)):
    if parent_id:
        objs = word_crud.get_children(db, parent_id=parent_id)
    else:
        objs = word_crud.get_root_objects(db)
    data = []
    for o in objs:
        item = {"id": str(o.id)}
        item.update(o.json_data)
        data.append(item)
    return {"status": status.API_OK, "data": data}


@router.get("/api/words/flatten/{word_id}")
def get_flatten_word(word_id: uuid.UUID, db: Session = Depends(db.get_db)):
    """给定节点ID, 沿父链(包含自身)一路找到根object, 将所有属性扁平合并后返回.

    合并策略:
    1. 从根到叶(当前节点)顺序依次合并.
    2. 下层(子)的同名键覆盖上层(父)的键值.
    3. 保留最终节点 id; 其它中间节点 id 不并入普通字段, 若需要可在 ancestors 中查看.
    4. 仅针对 json_data 中的键做合并; 系统附加的 hierarchy_level, super_class_id 保留叶子最终值.
    返回示例:
    {"status":0, "data": {"id": "<当前节点UUID>", "ancestors": ["root_id", ...], "merged": {<合并后的所有字段>}}}
    """
    path = word_crud.get_path_to_root(db, word_id=str(word_id), max_depth=MAX_WORD_DEPTH)
    if not path:
        return {"status": status.API_INVALID_PARAMETER, "message": "word not found"}
    # path 当前顺序: 叶子 -> 根; 需要反转
    path_rev = list(reversed(path))

    def _deep_merge(dst: dict, src: dict):
        for k, v in src.items():
            if k in dst and isinstance(dst[k], dict) and isinstance(v, dict):
                _deep_merge(dst[k], v)
            else:
                dst[k] = v

    merged: dict = {}
    ancestors: list[str] = []
    for idx, node in enumerate(path_rev):
        node_id = node.get("id")
        if node_id:
            ancestors.append(node_id)
        for k, v in node.items():
            if k == "id":
                continue
            if isinstance(v, dict) and isinstance(merged.get(k), dict):
                _deep_merge(merged[k], v)
            else:
                merged[k] = v
    current_id = str(word_id)
    return {"status": status.API_OK, "data": {"id": current_id, "ancestors": ancestors, "merged": merged}}


@router.get("/api/words/{word_id}")
def read_word(word_id: uuid.UUID, db: Session = Depends(db.get_db)):
    db_word = word_crud.get_object(db, object_id=str(word_id))
    if db_word is None or str(db_word.template_id) != constants.WORD_TEMPLATE_ID:
        return {"status": status.API_INVALID_PARAMETER, "message": "Word not found"}
    return {"status": status.API_OK, "data": _serialize_word(db_word)}


@router.get("/api/words/unit/{word_id}")
def get_word_unit(word_id: uuid.UUID, db: Session = Depends(db.get_db)):
    db_word_unit = word_crud.get_word_unit(db, word_id=str(word_id))
    if db_word_unit is None:
        raise HTTPException(status_code=404, detail="Word not found")
    return db_word_unit


@router.get("/api/getWordCreateSchema")
def getWordCreateSchema(db: Session = Depends(db.get_db)):
    tpl_schema = _fetch_word_template_schema(db)
    schema = _base_schema()
    _inject_template_fields(schema, tpl_schema)
    _add_base_editable_fields(schema)
    _ensure_data_type(schema)
    return schema


@router.post("/api/change_object_review_status")
def changeObjectReviewStatus(
    object_id: uuid.UUID, review_status: str, db: Session = Depends(db.get_db)
):
    if utils.validate_review_status(review_status):
        word_crud.change_review_state(db=db, id=object_id, review_status=review_status)
        return {"status": status.API_OK}
    else:
        return {"status": status.API_INVALID_PARAMETER}


@router.get("/api/words/children/{word_id}")
def get_children(word_id: uuid.UUID, db: Session = Depends(db.get_db)):
    children = word_crud.get_children(db, parent_id=str(word_id))
    data = []
    for c in children:
        item = {"id": str(c.id)}
        item.update(c.json_data)
        data.append(item)
    return {"status": status.API_OK, "data": data}


@router.get("/api/words/subtree/{word_id}")
def get_subtree(word_id: uuid.UUID, db: Session = Depends(db.get_db)):
    # 采用 CTE 版本，提高深层结构查询效率
    flat_list = word_crud.build_subtree_cte_flat(db, root_id=str(word_id), max_depth=MAX_WORD_DEPTH)
    if not flat_list:
        return {"status": status.API_INVALID_PARAMETER, "message": "word not found"}
    return {"status": status.API_OK, "data": flat_list}


@router.get("/api/words/path/{word_id}")
def get_path(word_id: uuid.UUID, db: Session = Depends(db.get_db)):
    path = word_crud.get_path_to_root(db, word_id=str(word_id), max_depth=MAX_WORD_DEPTH)
    if not path:
        return {"status": status.API_INVALID_PARAMETER, "message": "word not found"}
    return {"status": status.API_OK, "data": path}


# ==== Batch flatten endpoint (B) ====
@router.post("/api/words/flatten_batch")
def flatten_batch(word_ids: list[uuid.UUID] = Body(..., embed=True), db: Session = Depends(db.get_db)):
    """批量扁平化多个词汇，减少前端多次请求开销 (B).

    返回: {status:0, data:[ {id, ancestors, merged}, ... ], failed:[<无法找到的id字符串>]}
    """
    results = []
    failed: list[str] = []
    for wid in word_ids:
        path = word_crud.get_path_to_root(db, word_id=str(wid), max_depth=MAX_WORD_DEPTH)
        if not path:
            failed.append(str(wid))
            continue
        path_rev = list(reversed(path))
        def _deep_merge(dst: dict, src: dict):
            for k, v in src.items():
                if k in dst and isinstance(dst[k], dict) and isinstance(v, dict):
                    _deep_merge(dst[k], v)
                else:
                    dst[k] = v
        merged: dict = {}
        ancestors: list[str] = []
        for node in path_rev:
            node_id = node.get("id")
            if node_id:
                ancestors.append(node_id)
            for k, v in node.items():
                if k == "id":
                    continue
                if isinstance(v, dict) and isinstance(merged.get(k), dict):
                    _deep_merge(merged[k], v)
                else:
                    merged[k] = v
        results.append({"id": str(wid), "ancestors": ancestors, "merged": merged})
    return {"status": status.API_OK, "data": results, "failed": failed}


@router.get("/api/words/subtree_cte/{word_id}")
def get_subtree_cte(word_id: uuid.UUID, db: Session = Depends(db.get_db)):
    data = word_crud.build_subtree_cte_flat(db, root_id=str(word_id), max_depth=MAX_WORD_DEPTH)
    if not data:
        return {"status": status.API_INVALID_PARAMETER, "message": "word not found"}
    return {"status": status.API_OK, "data": data}


@router.post("/api/words/search")
def search_words(query: schemas.SearchWordsQuery, db: Session = Depends(db.get_db)):
    total, items = word_crud.search_words(
        db=db,
        author=query.author,
        review_status_prefix=query.review_status_prefix,
        name_contains=query.name_contains,
        start=query.start,
        size=query.size,
    )
    serialized = []
    for o in items:
        d = {"id": str(o.id)}
        if isinstance(o.json_data, dict):
            d.update(o.json_data)
            if (not d.get("english_name")) and d.get("chinese_name"):
                d["english_name"] = d["chinese_name"]
        serialized.append(d)
    return {"status": status.API_OK, "total": total, "data": serialized}
