from urllib.request import urlopen
from urllib.parse import unquote
import asyncio
import re,json
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
    array_element_type = array_obj["order"][0]
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


def get_development_data_rec(post_data: dict, word_order: list, data_content_out: list):
    # for obj in word_order:
    #     data_type = obj["type"]
    #     title = obj["title"]
    #     if title == constants.MGID_CUSTOM_FIELD_TITLE:
    #         continue
    #     if title in post_data:
    #         if data_type == "array":
    #             array = get_array(post_data[title], obj)
    #             data_content_out.append(array)
    #         elif data_type == "object":
    #             object_ = get_object(post_data[title], obj)
    #             data_content_out.append(object_)
    #         else:
    #             single_word = get_single_word(post_data[title], obj)
    #             if obj["type"] == "file" or obj["type"] == "image":
    #                 file_name = single_word["content"]["name"]
    #                 file_sha256 = single_word["content"]["sha256"]
    #                 post_data[title] = ":".join(["file", file_name, file_sha256])
    #             data_content_out.append(single_word)
    errors: List[Dict[str, str]] = []
    # post_data = json.loads(post_data)  # 不修改原始 post_data
    # print(post_data)
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
        title = obj["title"]
        if title == constants.MGID_CUSTOM_FIELD_TITLE:
            continue
        if title in post_data:
            if data_type == "array":
                array = get_array(post_data[title], obj)
                data_content_out.append(array)
            elif data_type == "object":
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
    word_oder = template_json_schema["word_order"]
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
