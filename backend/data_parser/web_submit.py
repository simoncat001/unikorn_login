from urllib.request import urlopen
from urllib.parse import unquote
import asyncio
import re, json
from copy import deepcopy
from typing import Dict, List
from database import template_crud
from common import object_store_service, utils, constants, error, status
from sqlalchemy.orm import Session

# Introduction
# @post_data: "铜"
# @single_word_obj: {"title": "元素成分", "type": "string"}
# @return: {"title": "元素成分", "type": "string", "content": "铜"}
def get_single_word(post_data, single_word_obj: dict):
    single_word_title = single_word_obj["title"]
    single_word_type = single_word_obj["type"]
    single_word = {"title": single_word_title, "type": single_word_type}
    if (
        single_word_type == "string"
        or single_word_type == "date"
        or single_word_type == "enum_text"
        or single_word_type == "MGID"
    ):
        single_word["content"] = post_data
    elif single_word_type == "number":
        single_word["content"] = post_data
        single_word["unit"] = single_word_obj["unit"]
    elif single_word_type == "number_range":
        single_word["content"] = {"start": post_data["start"], "end": post_data["end"]}
        single_word["unit"] = single_word_obj["unit"]
    else:
        file_name = ""
        file_sha256 = ""
        data_url = post_data
        if post_data[:4] == "file":
            file_info = post_data.split(":")
            file_name = file_info[1]
            file_sha256 = file_info[2]
        elif data_url == "":
            file_name = ""
            file_sha256 = ""
        # else:
        #     with urlopen(data_url) as response:
        #         file_name = unquote(response.info()["Content-type"].split("name=")[-1])
        #         file_data = response.read()
        #         file_sha256 = utils.concurrency_write(file_name, file_data)
        single_word["content"] = {"name": data_url, "sha256": file_sha256}
    return single_word


# Introduction
# @post_data: ["铜", "铁", "铝"]
# @array_obj: {"title": "元素成分列表", "type": "array", "order": [{"title": "元素成分", "type": "string"}]}
# @return: {"title": "元素成分列表", "type": "array", "element_type": {"title": "元素成分", "type": "string"}, "content": ["铜", "铁", "铝"]}
def get_array(post_data, array_obj: dict):
    array_title = array_obj["title"]
    array_type = array_obj["type"]
    array_order = array_obj.get("order") or []
    array_element_type = array_order[0] if array_order else array_obj.get("element_type")
    if array_element_type is None:
        inferred = _infer_word_order_from_payload({array_title: post_data})
        if inferred:
            array_element_type = inferred[0].get("element_type")
    if array_element_type is None:
        array_element_type = {"title": array_title, "type": "string"}
    array_content = []
    for i, item in enumerate(post_data):
        if array_element_type["type"] == "array":
            array = get_array(item, array_element_type)
            array_content.append(array["content"])
        elif array_element_type["type"] == "object":
            object_ = get_object(item, array_element_type)
            array_content.append(object_["content"])
        else:
            single_word = get_single_word(item, array_element_type)
            if array_element_type == "file" or array_element_type == "image":
                file_name = single_word["content"]["name"]
                file_sha256 = single_word["content"]["sha256"]
                post_data[i] = ":".join(["file", file_name, file_sha256])
            array_content.append(single_word["content"])
    array = {
        "title": array_title,
        "type": array_type,
        "element_type": array_element_type,
        "content": array_content,
    }
    return array


# Introduction
# @post_data: {"元素成分": "铜", "测试日期": "7/26/2021"}
# @object_obj: {"title": "元素成分测试", "type": "object", "order": [{"title": "元素成分", "type": "string"},{"title": "测试日期", "type": "date"}]}
# @return: {"title": 元素成分列表, "type": "object", "content": [{"title": "元素成分", "type": "string", "content": "铜"}, {"title": "测试日期", "type": "date", "content": "7/26/2021"}]}
def get_object(post_data, object_obj: dict):
    object_title = object_obj["title"]
    object_type = object_obj["type"]
    object_content = []
    get_development_data_rec(post_data, object_obj["order"], object_content)
    object_ = {"title": object_title, "type": object_type, "content": object_content}
    return object_

def safe_json_loads(s):
    # 已经是结构化对象，直接返回
    if isinstance(s, (dict, list)):
        return s
    # 字节转字符串
    if isinstance(s, (bytes, bytearray)):
        s = s.decode('utf-8', errors='ignore')
    # None -> 返回 None 或 {}，按你需要
    if s is None:
        return None
    if not isinstance(s, str):
        # 可选：抛更友好的错误
        raise TypeError(f"safe_json_loads expected str/bytes/dict/list/None, got {type(s)}")

    # 清理控制字符
    s = re.sub(r"[\x00-\x1F]", "", s)
    # 修复 Windows 路径反斜杠
    s = s.replace("\\", "\\\\")
    return json.loads(s)

# 建议放在一个 validators.py，然后在 web_submit.py 里 from .validators import VALIDATORS, call_validator
def get_single_word_without_io(v):
    # 基础清洗：转字符串、去首尾空白、去换行制表
    if v is None:
        return ""
    s = str(v).strip().replace("\r", " ").replace("\n", " ").replace("\t", " ")
    return s

def get_array_without_io(v):
    # 要求是数组；不是就包成单元素数组；None -> 空数组
    if v is None:
        return []
    if isinstance(v, list):
        return v
    return [v]

def get_object_without_io(v):
    # 要求是对象；不是就给空对象
    return v if isinstance(v, dict) else {}

# 如模板里有数字校验，可加一个
def get_number_without_io(v):
    try:
        return float(v)
    except Exception:
        return None  # 或者 raise 校验错误视你们约定

# 用一个“安全字典”代替直接 globals()/eval
VALIDATORS = {
    "get_single_word_without_io": get_single_word_without_io,
    "get_array_without_io": get_array_without_io,
    "get_object_without_io": get_object_without_io,
    "get_number_without_io": get_number_without_io,
}

def call_validator(name, value):
    func = VALIDATORS.get(name)
    if not func:
        # 返回给前端可读的错误而不是 NameError
        raise ValueError(f"unknown validator: {name}")
    return func(value)


def _infer_word_order_from_payload(payload) -> List[dict]:
    """
    当模板缺少子级的 word_order 定义时，根据提交的 payload 猜测层级结构，
    以保证至少能把数据完整地填充到 data_content。
    """

    def _infer_type(v):
        if isinstance(v, dict):
            return "object"
        if isinstance(v, list):
            return "array"
        if isinstance(v, (int, float)) and not isinstance(v, bool):
            return "number"
        # 简化处理：布尔、其他都按字符串
        return "string"

    inferred = []
    if not isinstance(payload, dict):
        return inferred

    for title, value in payload.items():
        data_type = _infer_type(value)
        node = {"title": title, "type": data_type}
        if data_type == "object":
            order = _infer_word_order_from_payload(value)
            if order:
                node["order"] = order
        elif data_type == "array":
            element_type = {"title": title, "type": "string"}
            if isinstance(value, list) and value:
                element_data_type = _infer_type(value[0])
                element_type["type"] = element_data_type
                if element_data_type == "object":
                    order = _infer_word_order_from_payload(value[0])
                    if order:
                        element_type["order"] = order
            node["element_type"] = element_type
        inferred.append(node)

    return inferred


def _merge_word_order_with_payload(word_order: list, payload: dict) -> list:
    """填补缺失的 word_order 节点，尽可能让展示字段覆盖整个 payload。

    - 维持原有顺序和定义；
    - 缺失的 title 会追加；
    - 对 object/array 递归合并子级/元素定义。
    """

    if not isinstance(word_order, list):
        word_order = []

    merged = deepcopy(word_order)
    inferred = _infer_word_order_from_payload(payload)
    by_title = {item.get("title"): item for item in merged if item.get("title")}

    for node in inferred:
        title = node.get("title")
        if not title:
            continue

        existing = by_title.get(title)
        if existing is None:
            merged.append(node)
            by_title[title] = node
            existing = node

        node_type = node.get("type")
        if node_type == "object":
            existing_order = existing.get("order")
            payload_child = payload.get(title, {}) if isinstance(payload, dict) else {}
            if not existing_order:
                existing["order"] = node.get("order") or []
            else:
                existing["order"] = _merge_word_order_with_payload(
                    existing_order, payload_child
                )
        elif node_type == "array":
            payload_child = payload.get(title) if isinstance(payload, dict) else None
            existing_element = existing.get("element_type")
            node_element = node.get("element_type")
            if not existing_element:
                existing["element_type"] = node_element
            elif existing_element.get("type") == "object" and node_element:
                if isinstance(payload_child, list) and payload_child:
                    existing_element["order"] = _merge_word_order_with_payload(
                        existing_element.get("order") or [], payload_child[0]
                    )

    return merged


def get_development_data_rec(post_data: dict, word_order: list, data_content_out: list):
    errors: List[Dict[str, str]] = []
    post_data = safe_json_loads(post_data)
    normalized = post_data
    for obj in word_order:
        t = obj.get("type")
        title = obj.get("title")
        required = bool(obj.get("required", False))
        if not title or not t:
            errors.append({"field": str(title or "<missing>"), "error": "schema item missing title/type"})
            continue
        if title == constants.MGID_CUSTOM_FIELD_TITLE:
            continue

        if title not in post_data:
            if required:
                errors.append({"field": title, "error": "required field missing"})
            continue
        value = post_data[title]

        data_type = obj["type"]
        if data_type == "array":
            # 某些老模板缺少 element_type，尝试从实际 payload 推断
            if not obj.get("element_type") and isinstance(value, list):
                inferred = _infer_word_order_from_payload({title: value})
                if inferred:
                    obj["element_type"] = inferred[0].get("element_type")

            array = get_array(post_data[title], obj)
            data_content_out.append(array)
        elif data_type == "object":
            # 老模板的 object 可能没有子级 order，尝试从 payload 推断
            if not obj.get("order") and isinstance(value, dict):
                obj["order"] = _infer_word_order_from_payload(value)

            object_ = get_object(post_data[title], obj)
            data_content_out.append(object_)
        else:
            single_word = get_single_word(post_data[title], obj)
            if obj["type"] == "file" or obj["type"] == "image":
                file_name = single_word["content"]["name"]
                file_sha256 = single_word["content"]["sha256"]
                post_data[title] = ":".join(["file", file_name, file_sha256])
            data_content_out.append(single_word)

    return normalized, errors

def get_development_data(
    db: Session,
    template_id: str,
    post_data: dict,
):
    json_data = {}
    data_content = []
    upload_error = None
    template = template_crud.get_template(db, template_id)
    template_json_schema = template.json_schema
    word_oder = _merge_word_order_with_payload(
        template_json_schema.get("word_order") or [], post_data
    )
    data_generate_method = template_json_schema["data_generate_method"]
    template_type = template_json_schema["template_type"]
    try:
        get_development_data_rec(post_data, word_oder, data_content)
    except error.FileWriteFailError:
        upload_error = {
            "status": status.API_FILE_UPLOAD_FAIL,
            "message": "fali to write file",
        }
    json_data["template_name"] = template.name
    json_data["data_generate_method"] = template_json_schema["data_generate_method"]
    json_data["institution"] = template_json_schema["institution"]
    json_data["template_type"] = template_json_schema["template_type"]
    json_data["data_content"] = data_content
    json_data["origin_post_data"] = post_data
    json_data["title"] = data_content[0]["content"]
    json_data["citation_template"] = "{}，{}[{}].".format(
        template_json_schema["source_standard_number"],
        template.name,
        utils.template_source_type(data_generate_method, template_type),
    )
    return json_data, post_data[constants.MGID_CUSTOM_FIELD_TITLE], upload_error


def rebuild_data_content_for_display(
    db: Session, template_id: str, json_data: dict
) -> dict:
    """
    补全老数据的 data_content，保证能覆盖 origin_post_data 中的所有字段。

    不修改原表数据，只在响应里返回补全后的结构。
    """

    origin_post = json_data.get("origin_post_data")
    if not isinstance(origin_post, dict):
        return json_data

    template = template_crud.get_template(db, template_id)
    if not template or not template.json_schema:
        return json_data

    word_order = _merge_word_order_with_payload(
        template.json_schema.get("word_order") or [], origin_post
    )

    data_content: List[dict] = []
    try:
        get_development_data_rec(origin_post, word_order, data_content)
    except Exception:
        return json_data

    filled = deepcopy(json_data)
    filled["data_content"] = data_content
    # 如果原始标题缺失，沿用首字段内容作为标题
    if data_content and data_content[0].get("content") and not filled.get("title"):
        filled["title"] = data_content[0].get("content")

    return filled
