from pydantic import BaseModel
try:
    from pydantic import ConfigDict  # pydantic v2
except Exception:
    ConfigDict = None  # type: ignore
import uuid
from typing import List
from typing import Optional, Any


class TemplateDraftUpsert(BaseModel):
    """Payload to create/update a template draft.

    `payload` is the raw draft data from the frontend (basicInfo + templateData).
    """

    title: str
    payload: dict


class TemplateDraft(BaseModel):
    id: uuid.UUID
    owner: str
    title: str
    json_data: dict
    status: str
    if ConfigDict:
        model_config = ConfigDict(from_attributes=True)
    else:
        class Config:
            orm_mode = True


class TemplateCreate(BaseModel):
    name: str
    basic_information: str
    schema_create: str


class Template(BaseModel):
    id: uuid.UUID
    name: str
    json_schema: str
    if ConfigDict:
        model_config = ConfigDict(from_attributes=True)
    else:
        class Config:
            orm_mode = True


class WordCreate(BaseModel):
    # 兼容：既支持传入字符串形式的 JSON，也支持直接传入对象 (dict)
    json_data: str | dict


class ObjectCreate(BaseModel):
    template_id: uuid.UUID
    json_data: str


class Object(ObjectCreate):
    id: uuid.UUID
    if ConfigDict:
        model_config = ConfigDict(from_attributes=True)
    else:
        class Config:
            orm_mode = True


class Word(BaseModel):
    id: uuid.UUID


class Query(BaseModel):
    query: str
    queryType: List[str]
    start: int
    size: int


class DataCreate(BaseModel):
    template_id: str
    json_data: str
    review_status: str


class DataContentUpdate(BaseModel):
    data_content: list
    title: str | None = None


class SampleDataQuery(BaseModel):
    template_id: str
    template_name: str
    json_data: str
    start: int
    size: int


class CountryCreate(BaseModel):
    id: str
    name: str


class OrganizationCreate(BaseModel):
    id: str
    name: str


class RelatedDataQuery(BaseModel):
    template_id: str
    sample_MGID: str
    start: int
    size: int


class MGIDApplyCreate(BaseModel):
    json_data: str


class SearchWordsQuery(BaseModel):
    author: str | None = None
    review_status_prefix: str | None = None
    name_contains: str | None = None
    start: int = 0
    size: int = 20


class UserAdd(BaseModel):
    user_json_data: str

class User(BaseModel):
    user_name: str
    display_name: str
    country: str
    organization: str
    user_type: str
    if ConfigDict:
        model_config = ConfigDict(from_attributes=True)
    else:
        class Config:
            orm_mode = True


class StandardCreate(BaseModel):
    name_zh: str
    name_en: str
    file_url: str
    review_status: str = "pending"
    owner: str | None = None


class StandardStatusUpdate(BaseModel):
    review_status: str


class Standard(StandardCreate):
    id: uuid.UUID
    owner: str | None = None
    if ConfigDict:
        model_config = ConfigDict(from_attributes=True)
    else:
        class Config:
            orm_mode = True


class ProjectCreate(BaseModel):
    name: str


class Project(BaseModel):
    id: uuid.UUID
    name: str
    created_by: str
    if ConfigDict:
        model_config = ConfigDict(from_attributes=True)
    else:
        class Config:
            orm_mode = True


class ProjectMemberUpsert(BaseModel):
    user_id: str
    role: str  # 'admin' | 'user'


class ProjectMember(BaseModel):
    id: uuid.UUID
    project_id: str
    user_id: str
    role: str
    if ConfigDict:
        model_config = ConfigDict(from_attributes=True)
    else:
        class Config:
            orm_mode = True


class DevDataCreate(BaseModel):
    data: dict


class DevDataUpdate(BaseModel):
    data: dict


class DevData(BaseModel):
    id: uuid.UUID
    project_id: str
    data: dict
    created_by: str
    updated_by: str
    created_at: Optional[Any] = None
    updated_at: Optional[Any] = None
    if ConfigDict:
        model_config = ConfigDict(from_attributes=True)
    else:
        class Config:
            orm_mode = True
