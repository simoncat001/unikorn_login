from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, JSON, cast, String, func, text
from . import models
from common import constants
import uuid, json
from typing import List, Dict, Any, Optional
import sqlalchemy


def get_object(db: Session, object_id: str):
    try:
        return db.query(models.Object).filter(models.Object.id == object_id).first()
    except sqlalchemy.exc.DataError as e:
        return None
    except Exception as e:
        raise e


def get_objects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Object).offset(skip).limit(limit).all()


def create_object(db: Session, db_object: models.Object):
    db.add(db_object)
    db.commit()
    db.refresh(db_object)
    return db_object


def update_object(db: Session, json_data: JSON, object_id: str):
    db.query(models.Object).filter(models.Object.id == object_id).update(
        {models.Object.json_data: json_data}
    )
    db.commit()


def get_my_words_list(
    db: Session, user: str, word_template_id: str, start: int, size: int
):
    if not user:
        return []
    words_list = (
        db.query(models.Object)
        .filter(models.Object.template_id == constants.WORD_TEMPLATE_ID)
        .filter(models.Object.json_data["author"].astext == user)
        .order_by(models.Object.json_data["create_timestamp"].astext.desc())
        .offset(start)
        .limit(size)
        .all()
    )
    return words_list


def get_words_count(db: Session, user: str, word_template_id: str):

    if not user:
        return 0
    words_count = (
        db.query(func.count(models.Object.id))
        .filter(models.Object.template_id == constants.WORD_TEMPLATE_ID)
        .filter(models.Object.json_data["author"].astext == user)
        .scalar()
    )
    return words_count


def filter_words_list(
    db: Session,
    user: str,
    word_template_id: str,
    status_filter: str,
    start: int,
    size: int,
):
    if not user:
        return []
    words_filter_list = (
        db.query(models.Object)
        .filter(models.Object.template_id == constants.WORD_TEMPLATE_ID)
        .filter(models.Object.json_data["author"].astext == user)
        .filter(models.Object.json_data["review_status"].astext.like(f"{status_filter}%"))
        .order_by(models.Object.json_data["create_timestamp"].astext.desc())
        .offset(start)
        .limit(size)
        .all()
    )
    return words_filter_list


def filter_words_count(
    db: Session, user: str, word_template_id: str, status_filter: str
):
    if not user:
        return 0
    words_filter_count = (
        db.query(func.count(models.Object.id))
        .filter(models.Object.template_id == constants.WORD_TEMPLATE_ID)
        .filter(models.Object.json_data["author"].astext == user)
        .filter(models.Object.json_data["review_status"].astext.like(f"{status_filter}%"))
        .scalar()
    )
    return words_filter_count


def is_word_exist(db: Session, db_object: models.Object, word_id: str = ""):
    # 安全获取名称字段，缺失则不判定为重复
    chinese_name = db_object.json_data.get("chinese_name")
    english_name = db_object.json_data.get("english_name")
    generic_name = db_object.json_data.get("name")  # 统一 'name' 字段支持
    if chinese_name is None and english_name is None and generic_name is None:
        return False

    filters = [models.Object.template_id == constants.WORD_TEMPLATE_ID]
    name_or_conditions = []
    if chinese_name is not None:
        name_or_conditions.append(models.Object.json_data["chinese_name"].astext == chinese_name)
    if english_name is not None:
        name_or_conditions.append(models.Object.json_data["english_name"].astext == english_name)
    if generic_name is not None:
        name_or_conditions.append(models.Object.json_data["name"].astext == generic_name)
    if name_or_conditions:
        filters.append(or_(*name_or_conditions))

    word_with_same_name = db.query(models.Object).filter(and_(*filters)).first()
    if word_with_same_name == None:
        return False
    if word_id == "":
        # create
        return word_with_same_name != None
    else:
        # update
        return str(word_with_same_name.id) != word_id


def get_word_list_with_begin(db: Session, begin_word: str):
    db_word_list = (
        db.query(
            models.Object.json_data["chinese_name"].astext,
            models.Object.json_data["data_type"].astext,
            models.Object.id,
        )
        .filter(models.Object.template_id == constants.WORD_TEMPLATE_ID)
        .filter(models.Object.json_data["review_status"].astext.like(f"{constants.REVIEW_STATUS_PASSED_REVIEW}%"))
        .filter(models.Object.json_data["chinese_name"].astext.ilike(f"%{begin_word}%"))
        .all()
    )
    word_list = []
    for i in range(len(db_word_list)):
        db_word = {}
        db_word["name"] = db_word_list[i][0]
        db_word["data_type"] = db_word_list[i][1]
        db_word["id"] = db_word_list[i][2]
        word_list.append(db_word)
    return word_list


def get_word_unit(db: Session, word_id: str):
    word_unit = (
        db.query(models.Object.json_data["unit"].astext)
        .filter(models.Object.template_id == constants.WORD_TEMPLATE_ID)
        .filter(models.Object.id == word_id)
        .first()
    )
    return word_unit[0] if word_unit else None


def get_word_options(db: Session, word_id: str):
    word_options = (
        db.query(models.Object.json_data["options"])
        .filter(models.Object.template_id == constants.WORD_TEMPLATE_ID)
        .filter(models.Object.id == word_id)
        .first()
    )
    if not word_options:
        return json.dumps([])
    return json.dumps(word_options[0])


def delete_word(db: Session, id: uuid.UUID):
    db.query(models.Object).filter(models.Object.id == id).delete()
    db.commit()


def change_review_state(db: Session, id: uuid.UUID, review_status: str):
    # TODO: new review function
    sql_cmd = """update objects set json_data = jsonb_set(json_data, '{{review_status}}', '{}') where id = '{}';
                    """.format(
        '"' + review_status + '"', id
    )
    db.execute(sql_cmd)
    db.commit()


def get_objects_serial_number_with_id(db: Session, object_id: str):
    return (
        db.query(models.Object)
        .filter(models.Object.id == object_id)
        .first()
        .json_data["serial_number"]
    )


def get_objects_author_with_id(db: Session, object_id: str):
    return (
        db.query(models.Object)
        .filter(models.Object.id == object_id)
        .first()
        .json_data["author"]
    )


def get_children(db: Session, parent_id: str):
    """返回直接子节点 objects 列表"""
    # 兼容：super_class_id 新字段，老数据可能还在 parent_word_id
    return (
        db.query(models.Object)
        .filter(models.Object.template_id == constants.WORD_TEMPLATE_ID)
        .filter(
            or_(
                models.Object.json_data["super_class_id"].astext == parent_id,
                models.Object.json_data["parent_word_id"].astext == parent_id,
            )
        )
        .all()
    )


def build_subtree(db: Session, root_id: str, max_depth: int = 5) -> Dict[str, Any]:
    """递归构建 root_id 下的子树 (包含 root) 深度不超过 max_depth"""
    root_obj = get_object(db, root_id)
    if root_obj is None:
        return {}

    def _serialize(obj):
        return {"id": str(obj.id), **obj.json_data}

    def _dfs(node_obj, depth):
        data = _serialize(node_obj)
        if depth >= max_depth:
            data["children"] = []
            return data
        childs = get_children(db, str(node_obj.id))
        data["children"] = [_dfs(c, depth + 1) for c in childs]
        return data

    return _dfs(root_obj, 1)


def build_subtree_flat(db: Session, root_id: str, max_depth: int = 5):
    """返回扁平列表，每个元素包含 id, hierarchy_level, super_class_id (若有)"""
    root_obj = get_object(db, root_id)
    if root_obj is None:
        return []

    result = []

    def _serialize(obj):
        data = {"id": str(obj.id)}
        data.update(obj.json_data)
        return data

    def _dfs(obj, depth):
        if depth > max_depth:
            return
        data = _serialize(obj)
        # 如果没存 hierarchy_level 则补齐（根可能没有）
        if "hierarchy_level" not in data:
            data["hierarchy_level"] = depth
        result.append(data)
        if depth == max_depth:
            return
        for c in get_children(db, str(obj.id)):
            _dfs(c, depth + 1)

    _dfs(root_obj, 1)
    return result


def get_root_objects(db: Session):
    """获取无父级的 object 类型词汇"""
    return (
        db.query(models.Object)
        .filter(models.Object.template_id == constants.WORD_TEMPLATE_ID)
        .filter(models.Object.json_data["data_type"].astext == "object")
        .filter(
            or_(
                models.Object.json_data["super_class_id"].is_(None),
                models.Object.json_data["super_class_id"].astext == "",
                models.Object.json_data["parent_word_id"].is_(None),
            )
        )
        .all()
    )


def get_path_to_root(db: Session, word_id: str, max_depth: int = 5):
    """返回从当前节点到根节点的链（当前在前，根在后）"""
    path = []
    current = get_object(db, word_id)
    depth = 0
    while current and depth < max_depth:
        item = {"id": str(current.id)}
        item.update(current.json_data)
        path.append(item)
        parent_id = current.json_data.get("super_class_id") or current.json_data.get("parent_word_id")
        if not parent_id:
            break
        current = get_object(db, parent_id)
        depth += 1
    return path


# === (B) CTE based subtree flat retrieval ===
def build_subtree_cte_flat(db: Session, root_id: str, max_depth: int = 5):
    """使用递归 CTE 一次性取回子树扁平数据 (id, json_data, depth)."""
    sql = text(
        """
        WITH RECURSIVE tree AS (
            SELECT id, json_data, 1 AS depth
            FROM objects
            WHERE id = :root_id
            UNION ALL
            SELECT o.id, o.json_data, tree.depth + 1
            FROM objects o
            JOIN tree ON (o.json_data ->> 'super_class_id') = tree.id::text
            WHERE tree.depth < :max_depth
        )
        SELECT id, json_data, depth FROM tree;
        """
    )
    rows = db.execute(sql, {"root_id": root_id, "max_depth": max_depth}).fetchall()
    result = []
    for r in rows:
        jd = dict(r.json_data)
        if "hierarchy_level" not in jd:
            jd["hierarchy_level"] = r.depth
        jd["id"] = str(r.id)
        result.append(jd)
    # 按层级排序
    result.sort(key=lambda x: x.get("hierarchy_level", 9999))
    return result


# === (C) generic search ===
def search_words(
    db: Session,
    author: Optional[str],
    review_status_prefix: Optional[str],
    name_contains: Optional[str],
    start: int,
    size: int,
):
    q = db.query(models.Object).filter(models.Object.template_id == constants.WORD_TEMPLATE_ID)
    if author:
        q = q.filter(models.Object.json_data["author"].astext == author)
    if review_status_prefix:
        q = q.filter(models.Object.json_data["review_status"].astext.like(f"{review_status_prefix}%"))
    if name_contains:
        pattern = f"%{name_contains}%"
        q = q.filter(
            or_(
                models.Object.json_data["chinese_name"].astext.ilike(pattern),
                models.Object.json_data.get("english_name", models.Object.json_data["chinese_name"]).astext.ilike(pattern),
            )
        )
    total = q.count()
    items = (
        q.order_by(models.Object.json_data["create_timestamp"].astext.desc())
        .offset(start)
        .limit(size)
        .all()
    )
    return total, items
