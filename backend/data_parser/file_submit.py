from database import template_crud


def get_single_word(single_word_type: str):
    if single_word_type == "enum_text":
        return [""]
    elif single_word_type == "date":
        return "2000-01-01"
    elif single_word_type == "number":
        return 0
    elif single_word_type == "number_range":
        return {"start": 0, "end": 0}
    else:
        return ""


def get_array(obj: list):
    empty_array = {}
    obj = obj[0]
    title = obj["title"]
    if "order" in obj:
        get_item(empty_array, obj, obj["order"])
    else:
        get_item(empty_array, obj, None)
    return [empty_array[title]]


def get_item(empty_template, obj, word_order: list):
    data_type = obj["type"]
    title = obj["title"]
    if data_type == "array":
        empty_template[title] = get_array(obj["order"])
    elif data_type == "object":
        empty_template[title] = get_template_empty(obj["order"])
    else:
        empty_template[title] = get_single_word(data_type)


def get_template_empty(word_order: list):
    empty_template = {}
    for obj in word_order:
        get_item(empty_template, obj, word_order)
    return empty_template
