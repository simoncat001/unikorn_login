from sqlalchemy import Column, String, JSON, Numeric, Uuid
from sqlalchemy.sql import func
from sqlalchemy import DateTime
import uuid

from .base import Base


class Template(Base):
    __tablename__ = "templates"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String)
    json_schema = Column(JSON)


class Object(Base):
    __tablename__ = "objects"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    template_id = Column(Uuid(as_uuid=True))
    json_data = Column(JSON)


class Country(Base):
    __tablename__ = "country"

    id = Column(String, primary_key=True)
    name = Column(String, unique=True)


class Organization(Base):
    __tablename__ = "organization"

    id = Column(String, primary_key=True)
    name = Column(String, unique=True)


class SerialNumber(Base):
    __tablename__ = "serial_number"

    type = Column(String, primary_key=True)
    current_number = Column(Numeric)


class User(Base):
    __tablename__ = "users"

    user_name = Column(String, primary_key=True, unique=True)
    hashed_password = Column(String)
    country = Column(String)
    user_type = Column(String)
    organization = Column(String)


class MultipartUploadSession(Base):
    __tablename__ = "multipart_upload_sessions"

    session_id = Column(String, primary_key=True)
    bucket = Column(String)
    key = Column(String)
    upload_id = Column(String)
    organization = Column(String)
    user_number = Column(String)
    user_type = Column(String)
    display_name = Column(String)


class Standard(Base):
    __tablename__ = "standards"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name_zh = Column(String)
    name_en = Column(String)
    file_url = Column(String)
    review_status = Column(String, default="pending")
    owner = Column(String)


class TemplateDraft(Base):
    """Template draft saved by a user before submitting for review.

    We keep drafts separate from `templates` so they don't appear in public/admin
    lists until published/submitted.
    """

    __tablename__ = "template_drafts"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    # Frontend draft payload (basicInfo + schema_create definition, etc.)
    json_data = Column(JSON, nullable=False)
    status = Column(String, default="draft", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class Project(Base):
    """Project container.

    Source of truth is the `projects` table.
    We keep it minimal for now and rely on `project_members` for permissions.
    """

    __tablename__ = "projects"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    created_by = Column(String, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class ProjectMember(Base):
    """Project membership + role.

    Role is scoped to a specific project.
    - admin: can manage members + delete dev_data
    - user: can create/update dev_data
    """

    __tablename__ = "project_members"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(String, index=True, nullable=False)
    user_id = Column(String, index=True, nullable=False)
    role = Column(String, nullable=False, default="user")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class DevData(Base):
    """Project-scoped development data stored as structured JSON."""

    __tablename__ = "dev_data"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(String, index=True, nullable=False)
    data = Column(JSON, nullable=False)

    created_by = Column(String, index=True, nullable=False)
    updated_by = Column(String, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
