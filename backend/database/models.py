from sqlalchemy import Column, String, JSON, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid

from .base import Base


class Template(Base):
    __tablename__ = "templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String)
    json_schema = Column(JSONB)


class Object(Base):
    __tablename__ = "objects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    template_id = Column(UUID(as_uuid=True))
    json_data = Column(JSONB)


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
