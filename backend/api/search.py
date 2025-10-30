from fastapi import Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session
import warnings, json

from database import search_crud, models, schemas
from database.base import SessionLocal, engine
from common import constants, status, utils
from schema_parser import template_create_schema, data_create_schema
import uvicorn
from common import db

router = APIRouter()


@router.post("/api/unauth/search/")
def search(query: schemas.Query, db: Session = Depends(db.get_db)):
    db_object = models.Object(template_id=constants.WORD_TEMPLATE_ID)
    db_search_list = search_crud.get_search_list(
        db=db,
        query=query.query,
        queryType=query.queryType,
        start=query.start,
        size=query.size,
    )
    return db_search_list
