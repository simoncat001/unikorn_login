from typing import Any, Dict
from common import constants, utils
import logging


def _fallback_basic_information_backend() -> Dict[str, Dict[str, Any]]:
    """Built-in fallback for basic-information backend schema.
    Keeps UI functional when DB preset is missing.
    """
    return {
        "title": {
            "type": "string",
            "title": "模板标题",
            "default": "",
            "required": True,
            "input_flag": True,
        },
        "institution": {
            "type": "string",
            "title": "单位",
            "default": "",
            "required": False,
            "input_flag": True,
        },
        "template_publish_platform": {
            "type": "string",
            "title": "发布平台",
            "default": "",
            "required": False,
            "input_flag": True,
        },
        "template_type": {
            "enum": ["sample", "source", "derived", "application"],
            "type": "string",
            "title": "模板类型",
            "default": "sample",
            "required": True,
            "input_flag": True,
        },
        "data_generate_method": {
            "enum": ["experiment", "calculation", "production", "other"],
            "type": "string",
            "title": "数据产生方式",
            "default": "experiment",
            "required": True,
            "input_flag": True,
        },
        # The following are toggled via dependencies when needed; do not show by default
        "template_source": {
            "enum": ["standard", "unstandard"],
            "type": "string",
            "title": "模板来源",
            "default": "standard",
            "required": True,
            "input_flag": False,
        },
        "source_standard_name": {
            "type": "string",
            "title": "来源标准名称",
            "default": "",
            "required": True,
            "input_flag": False,
        },
        "source_standard_number": {
            "type": "string",
            "title": "来源标准号",
            "default": "",
            "required": True,
            "input_flag": False,
        },
    }


def get_basic_information_schema(
    db_template_basic_information: Any, organization: str
):
    # Robustly obtain backend schema or fallback
    try:
        json_schema = (
            getattr(db_template_basic_information, "json_schema", None)
            if db_template_basic_information is not None
            else None
        )
    except Exception:
        json_schema = None

    if not isinstance(json_schema, dict) or not json_schema:
        logging.getLogger(__name__).warning(
            "Template basic information preset missing; using fallback schema."
        )
        basic_information_schema_backend = _fallback_basic_information_backend()
    else:
        basic_information_schema_backend = json_schema
    basic_information_schema_ui = {
        "title": "",
        "type": "object",
        "dependencies": {
            "template_type": {
                "oneOf": [
                    {
                        "properties": {
                            "template_type": {
                                "enum": ["sample", "source", "derived"],
                            },
                            "source_standard_number": {
                                "type": "string",
                                "title": "来源标准号",
                            },
                            "source_standard_name": {
                                "type": "string",
                                "title": "来源标准名称",
                            },
                        },
                        "required": ["source_standard_number", "source_standard_name"],
                    },
                    {
                        "properties": {
                            "template_type": {
                                "enum": ["application"],
                            },
                            "template_source": {
                                "type": "string",
                                "title": "模板来源",
                                "default": "standard",
                                "enum": ["standard", "unstandard"],
                            },
                        },
                        "required": ["template_source"],
                        "dependencies": {
                            "template_source": {
                                "oneOf": [
                                    {
                                        "properties": {
                                            "template_source": {
                                                "enum": ["standard"],
                                            },
                                            "source_standard_number": {
                                                "type": "string",
                                                "title": "来源标准号",
                                            },
                                            "source_standard_name": {
                                                "type": "string",
                                                "title": "来源标准名称",
                                            },
                                        },
                                        "required": [
                                            "source_standard_number",
                                            "source_standard_name",
                                        ],
                                    },
                                    {
                                        "properties": {
                                            "template_source": {
                                                "enum": ["unstandard"],
                                            },
                                            "source_standard_number_custom_field": {
                                                "type": "string",
                                                "title": "自定义标准号部分",
                                            },
                                            "source_standard_name_custom": {
                                                "type": "string",
                                                "title": "自定义标准名称",
                                            },
                                        },
                                        "required": [
                                            "source_standard_number_custom_field",
                                            "source_standard_name_custom",
                                        ],
                                    },
                                ]
                            }
                        },
                    },
                ],
            }
        },
    }
    basic_information_schema_ui["properties"] = {}
    basic_information_schema_ui["required"] = []
    for key in basic_information_schema_backend:
        if not basic_information_schema_backend[key][constants.INPUT_FLAG]:
            continue
        if basic_information_schema_backend[key][constants.REQUIRED_FLAG]:
            basic_information_schema_ui["required"].append(key)
        if not "enum" in basic_information_schema_backend[key]:
            basic_information_schema_ui["properties"][key] = {
                "type": basic_information_schema_backend[key]["type"],
                "title": basic_information_schema_backend[key]["title"],
                "default": basic_information_schema_backend[key]["default"],
            }
        else:
            basic_information_schema_ui["properties"][key] = {
                "type": "string",
                "title": basic_information_schema_backend[key]["title"],
                "default": basic_information_schema_backend[key]["enum"][0],
                "enum": basic_information_schema_backend[key]["enum"],
            }
    # Ensure defaults for known fields even if missing in backend
    if "institution" in basic_information_schema_ui["properties"]:
        basic_information_schema_ui["properties"]["institution"][
            "default"
        ] = organization
    else:
        basic_information_schema_ui["properties"]["institution"] = {
            "type": "string",
            "title": "单位",
            "default": organization or "",
        }

    tpp_default = utils.template_create_default_template_publish_platform()
    if "template_publish_platform" in basic_information_schema_ui["properties"]:
        basic_information_schema_ui["properties"]["template_publish_platform"][
            "default"
        ] = tpp_default
    else:
        basic_information_schema_ui["properties"]["template_publish_platform"] = {
            "type": "string",
            "title": "发布平台",
            "default": tpp_default,
        }
    return basic_information_schema_ui
