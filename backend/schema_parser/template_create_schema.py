from common import constants


"""
if "type_levelN" is "single", user should input word name in "single_levelN"
and choose whether this word is required:
{
    "required": [
        "single_level0"
    ],
    "properties": {
        "type_level0": {
            "enum": [
                "single"
            ]
        },
        "single_level0_required": {
            "type": "boolean",
            "title": "必选",
            "default": true
        },
        "single_level0": {
            "type": "string",
            "title": "词汇名称",
            "default": ""
        }
    }
},
"""


def template_schema_single(level: int, last_level_type: str):
    single_level = "single_level" + str(level)
    template_create_single = {"required": [single_level], "properties": {}}
    template_create_single["properties"]["type_level" + str(level)] = {
        "enum": ["single"]
    }
    if last_level_type not in ("array", "list"):
        template_create_single["properties"][single_level + "_required"] = {
            "type": "boolean",
            "title": "必选",
            "default": True,
        }
    template_create_single["properties"][single_level] = {
        "type": "string",
        "title": "词汇名称",
        "default": "",
    }
    return template_create_single


"""
if "type_levelN" is "array", user should input array name in "array_levelN"
and choose whether this array is required
and the type of this array's element will be recursively generated in "array_items_levelN":
{
    "required": [
        "array_level0",
        "array_items_level0"
    ],
    "properties": {
        "type_level0": {
            "enum": [
                "array"
            ]
        },
        "array_level0_required": {
            "type": "boolean",
            "title": "必选",
            "default": true
        },
        "array_level0": {
            "type": "string",
            "title": "数组名称",
            "default": ""
        },
        "array_items_level0": {
            call template_schema_recurrent to generate the schema of array's element type
        }
    }
}
"""


def template_schema_array(level: int, last_level_type: str):
    array_level = "array_level" + str(level)
    array_level_items = "array_items_level" + str(level)
    array_count_level = "array_count_level" + str(level)
    template_create_array = {
        "required": [array_level, array_level_items],
        "properties": {},
    }
    template_create_array["properties"]["type_level" + str(level)] = {"enum": ["array"]}
    if last_level_type != "array":
        template_create_array["properties"][array_level + "_required"] = {
            "type": "boolean",
            "title": "必选",
            "default": True,
        }
    template_create_array["properties"][array_level] = {
        "type": "string",
        "title": "数组名称",
        "default": "",
    }
    # 元素个数（可选，默认1）
    template_create_array["properties"][array_count_level] = {
        "type": "integer",
        "title": "元素个数",
        "default": 1,
        "minimum": 1,
    }
    template_create_array["properties"][array_level_items] = template_schema_recurrent(
        level + 1, "array"
    )
    return template_create_array


def template_schema_list(level: int, last_level_type: str):
    list_level = "list_level" + str(level)
    list_level_items = "list_items_level" + str(level)
    template_create_list = {
        "required": [list_level, list_level_items],
        "properties": {},
    }
    template_create_list["properties"]["type_level" + str(level)] = {"enum": ["list"]}
    # 与数组一致：仅当父级不是 array 时展示“必选”
    if last_level_type != "array":
        template_create_list["properties"][list_level + "_required"] = {
            "type": "boolean",
            "title": "必选",
            "default": True,
        }
    template_create_list["properties"][list_level] = {
        "type": "string",
        "title": "列表名称",
        "default": "",
    }
    template_create_list["properties"][list_level_items] = template_schema_recurrent(
        level + 1, "list"
    )
    return template_create_list


"""
if "type_levelN" is "object", user should input object name in "object_levelN"
(notice that it is meaningless whether object is required)
and the elements of this object will be recursively generated in "object_items_levelN":
{
    "required": [
        "object_level0",
        "object_items_level0"
    ],
    "properties": {
        "type_level0": {
            "enum": [
                "object"
            ]
        },
        "object_level0": {
            "type": "string",
            "title": "对象名称",
            "default": ""
        },
        "object_items_level0": {
            "type": "array",
            "title": "",
            "default": "",
            "items": {
                call template_schema_recurrent to generate the schema of object's elements
            }
        }
    }
}
"""


def template_schema_object(level: int, last_level_type: str):
    object_level = "object_level" + str(level)
    object_level_items = "object_items_level" + str(level)
    template_create_object = {
        "required": [object_level, object_level_items],
        "properties": {},
    }
    template_create_object["properties"]["type_level" + str(level)] = {
        "enum": ["object"]
    }
    template_create_object["properties"][object_level] = {
        "type": "string",
        "title": "对象名称",
        "default": "",
    }
    # 为对象的成员提供默认值：新增对象时自动包含一个“单元素”成员，避免空对象
    next_level = level + 1
    default_member = {}
    if next_level == constants.TEMPLATE_RECURSIVE_LAYER:
        # 最末层只有 single 字段，无类型选择器
        single_key = "single_level" + str(next_level)
        default_member[single_key] = ""
        if last_level_type not in ("array", "list"):
            default_member[single_key + "_required"] = True
    else:
        type_key = "type_level" + str(next_level)
        single_key = "single_level" + str(next_level)
        default_member[type_key] = "single"
        default_member[single_key] = ""
        if last_level_type not in ("array", "list"):
            default_member[single_key + "_required"] = True

    template_create_object["properties"][object_level_items] = {
        "type": "array",
        "title": "",
        "default": [default_member],
        "items": template_schema_recurrent(next_level, "object"),
    }
    return template_create_object


def template_schema_recurrent(level: int, last_level_type: str):
    level_current = "level" + str(level)
    template_create_schema = {}
    template_create_schema["title"] = ""
    template_create_schema["type"] = "object"
    template_create_schema["properties"] = {}
    ### set an object "level0" in the top layer which enables user to add single/array/object
    if level == 0:
        template_create_schema["properties"][level_current] = {
            "title": "",
            "type": "array",
            "items": {"title": "", "type": "object"},
        }
        template_create_schema["properties"][level_current]["items"]["properties"] = {}
        type_level = "type_level" + str(level)
        template_create_schema["properties"][level_current]["items"]["properties"][type_level] = {
            "type": "string",
            "title": " ",
            "default": "single",
            "enum": ["single", "array", "object", "list"],
        }
        template_create_schema["properties"][level_current]["items"][
            "dependencies"
        ] = {}
        template_create_schema["properties"][level_current]["items"]["dependencies"][
            type_level
        ] = {
            "oneOf": [
                template_schema_single(level, last_level_type),
                template_schema_array(level, last_level_type),
                template_schema_object(level, last_level_type),
                template_schema_list(level, last_level_type),
            ]
        }
        return template_create_schema
    ###
    ### only "single" type is allowed in the last layer
    if level == constants.TEMPLATE_RECURSIVE_LAYER:
        single_level = "single_level" + str(level)
        if last_level_type not in ("array", "list"):
            template_create_schema["properties"][single_level + "_required"] = {
                "type": "boolean",
                "title": "必选",
                "default": True,
            }
        template_create_schema["properties"][single_level] = {
            "type": "string",
            "title": "词汇名称",
            "default": "",
        }
        return template_create_schema
    ###
    """
    in the rest layers, user can choose single/array/object by "type_levelN"
    how deal with different choices is defined in "oneOf" property:
    "properties": {
        "type_level0": {
            "type": "string",
            "title": " ",
            "default": "single",
            "enum": [
                "single",
                "array",
                "object"
            ]
        }
    },
    "dependencies": {
        "type_level0": {
            "oneOf": [
                call template_schema_single to generate schema of single element,
                call template_schema_array to generate schema of array,
                call template_schema_object to generate schema of object,
            ]
        }
    }
    """
    type_level = "type_level" + str(level)
    template_create_schema["properties"][type_level] = {
        "type": "string",
        "title": " ",
        "default": "single",
        "enum": ["single", "array", "object", "list"],
    }
    template_create_schema["dependencies"] = {}
    template_create_schema["dependencies"][type_level] = {
        "oneOf": [
            template_schema_single(level, last_level_type),
            template_schema_array(level, last_level_type),
            template_schema_object(level, last_level_type),
            template_schema_list(level, last_level_type),
        ]
    }
    return template_create_schema
