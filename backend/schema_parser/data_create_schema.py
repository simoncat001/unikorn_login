import json
from database import word_crud, template_crud
from common import constants, utils
from sqlalchemy.orm import Session


def generate_data_create_single_word_schema(
    name: str,
    data_type: str,
    id: str,
    db: Session,
    word_order_out: list,
    word_name_data_type_map_out: dict,
):
    single_word_schema = {"title": name}
    word_name_data_type_map_out[name] = {"type": data_type}
    word_order_single_word = {
        "title": name,
        "type": data_type,
    }
    if data_type == "number_range":
        single_word_schema["type"] = "object"
        range_unit = word_crud.get_word_unit(word_id=id, db=db)
        range_start_schema = {"title": " "}
        range_start_schema["type"] = "number"
        range_start_schema["description"] = "~"
        range_end_schema = {"title": " "}
        range_end_schema["type"] = "number"
        range_end_schema["description"] = range_unit
        single_word_schema["required"] = ["start", "end"]
        single_word_schema["properties"] = {
            "start": range_start_schema,
            "end": range_end_schema,
        }
        word_name_data_type_map_out[name]["unit"] = range_unit
        word_order_single_word["unit"] = range_unit
    elif data_type == "string" or data_type == "MGID":
        single_word_schema["type"] = "string"
    elif data_type == "number":
        unit = word_crud.get_word_unit(word_id=id, db=db)
        single_word_schema["type"] = "number"
        single_word_schema["description"] = unit
        word_name_data_type_map_out[name]["unit"] = unit
        word_order_single_word["unit"] = unit
    elif data_type == "file" or data_type == "image":
        single_word_schema["type"] = "string"
    elif data_type == "date":
        single_word_schema["type"] = "string"
        single_word_schema["format"] = "date"
    else:
        db_options = json.loads(word_crud.get_word_options(word_id=id, db=db))
        single_word_schema["type"] = "array"
        single_word_schema["uniqueItems"] = True
        single_word_schema["items"] = {"type": "string", "enum": db_options}
    word_order_out.append(word_order_single_word)
    return single_word_schema


def generate_data_create_array_schema(
    array_data: str,
    level: int,
    db: Session,
    word_order_out: list,
    invalid_word_out: list,
    word_name_data_type_map_out: dict,
):
    array_schema = {"title": array_data["array_level" + str(level)], "type": "array"}
    # 支持固定元素个数（可选）
    try:
        cnt_key = "array_count_level" + str(level)
        cnt = array_data.get(cnt_key, None)
        if isinstance(cnt, int) and cnt >= 1:
            array_schema["minItems"] = cnt
            array_schema["maxItems"] = cnt
    except Exception:
        pass
    next_level_word_order = []
    array_schema["items"], required = generate_data_create_schema_rec(
        array_data["array_items_level" + str(level)],
        level + 1,
        db,
        next_level_word_order,
        invalid_word_out,
        word_name_data_type_map_out,
    )
    word_order_out.append(
        {
            "title": array_data["array_level" + str(level)],
            "type": "array",
            "order": next_level_word_order,
        }
    )
    return array_schema


def generate_data_create_list_schema(
    list_data: str,
    level: int,
    db: Session,
    word_order_out: list,
    invalid_word_out: list,
    word_name_data_type_map_out: dict,
):
    # 列表与数组在数据创建阶段均表现为可变长度集合，这里沿用 array 的生成逻辑
    list_schema = {"title": list_data["list_level" + str(level)], "type": "array"}
    next_level_word_order = []
    list_schema["items"], required = generate_data_create_schema_rec(
        list_data["list_items_level" + str(level)],
        level + 1,
        db,
        next_level_word_order,
        invalid_word_out,
        word_name_data_type_map_out,
    )
    word_order_out.append(
        {
            "title": list_data["list_level" + str(level)],
            "type": "array",  # 对外仍按 array 呈现，兼容旧前端
            "order": next_level_word_order,
        }
    )
    return list_schema


def generate_data_create_object_schema(
    object_data: str,
    level: int,
    db: Session,
    word_order_out: list,
    invalid_word_out: list,
    word_name_data_type_map_out: dict,
):
    object_schema = {
        "title": object_data["object_level" + str(level)],
        "type": "object",
        "required": [],
    }
    next_level_word_order = []
    object_schema["properties"] = {}
    for i, obj in enumerate(object_data["object_items_level" + str(level)]):
        (object_schema_next, required) = generate_data_create_schema_rec(
            obj,
            level + 1,
            db,
            next_level_word_order,
            invalid_word_out,
            word_name_data_type_map_out,
        )
        object_schema["properties"][object_schema_next["title"]] = object_schema_next
        if required:
            object_schema["required"].append(object_schema_next["title"])
    word_order_out.append(
        {
            "title": object_data["object_level" + str(level)],
            "type": "object",
            "order": next_level_word_order,
        }
    )
    return object_schema


def generate_data_create_schema_rec(
    form_data: dict,
    level: int,
    db: Session,
    word_order_out: list,
    invalid_word_out: list,
    word_name_data_type_map_out: dict,
):
    type_level = "type_level" + str(level)
    required = False
    if level == constants.TEMPLATE_RECURSIVE_LAYER or form_data[type_level] == "single":
        single_level = "single_level" + str(level)
        if not utils.validate_name_type_id_string(form_data[single_level], db):
            invalid_word_out.append(form_data[single_level])
            return {"title": form_data[single_level]}, required
        name_data_tpye_dict = utils.split_name_type_id_string(form_data[single_level])

        template_schema = generate_data_create_single_word_schema(
            name_data_tpye_dict["name"],
            name_data_tpye_dict["type"],
            name_data_tpye_dict["id"],
            db,
            word_order_out,
            word_name_data_type_map_out,
        )
        if (
            single_level + "_required" in form_data
            and form_data[single_level + "_required"]
        ):
            required = True
    elif form_data[type_level] == "array":
        array_level = "array_level" + str(level)
        template_schema = generate_data_create_array_schema(
            form_data,
            level,
            db,
            word_order_out,
            invalid_word_out,
            word_name_data_type_map_out,
        )
        if (
            array_level + "_required" in form_data
            and form_data[array_level + "_required"]
        ):
            required = True
    elif form_data[type_level] == "list":
        list_level = "list_level" + str(level)
        template_schema = generate_data_create_list_schema(
            form_data,
            level,
            db,
            word_order_out,
            invalid_word_out,
            word_name_data_type_map_out,
        )
        if (
            list_level + "_required" in form_data
            and form_data[list_level + "_required"]
        ):
            required = True
    else:
        object_level = "object_level" + str(level)
        template_schema = generate_data_create_object_schema(
            form_data,
            level,
            db,
            word_order_out,
            invalid_word_out,
            word_name_data_type_map_out,
        )
    return template_schema, required


def generate_data_create_schema(form_data: dict, template_type: str, db: Session):
    invalid_word = []
    template_schema = {"title": "", "type": "object", "required": [], "properties": {}}
    word_order = []
    # TODO: if word_name_data_type_map is not needed in data create, remove word_name_data_type_map
    word_name_data_type_map = {}
    template_id = constants.TEMPLATE_PRESET[template_type]
    if template_id != "":
        preset_template = template_crud.get_template(db, template_id).json_schema
        preset_template_schema = preset_template["schema"]
        word_order = preset_template["word_order"].copy()
        word_name_data_type_map = preset_template["data_type_map"].copy()
        template_schema["required"] = preset_template_schema["required"].copy()
        for obj in word_order:
            title = obj["title"]
            template_schema["properties"][title] = preset_template_schema["properties"][
                title
            ]
    if "level0" not in form_data:
        return {
            "schema": template_schema,
            "word_order": word_order,
            "invalid_word": invalid_word,
            "data_type_map": word_name_data_type_map,
        }
    for i, obj in enumerate(form_data["level0"]):
        template_schema_next, required_next = generate_data_create_schema_rec(
            obj, 0, db, word_order, invalid_word, word_name_data_type_map
        )
        template_schema["properties"][
            template_schema_next["title"]
        ] = template_schema_next
        if required_next:
            template_schema["required"].append(template_schema_next["title"])
    return {
        "schema": template_schema,
        "word_order": word_order,
        "invalid_word": invalid_word,
        "data_type_map": word_name_data_type_map,
    }
