from fastapi import Depends, HTTPException, APIRouter, UploadFile, File
from sqlalchemy.orm import Session

from database import organization_crud, schemas, models
from database.base import SessionLocal, engine
import uvicorn
from common import db, status, utils, error
import csv
import codecs


router = APIRouter()


@router.post("/api/create_organization/")
async def insert_organization_from_excel(
    file: UploadFile = File(...), db: Session = Depends(db.get_db)
):
    try:
        contents = csv.reader(codecs.iterdecode(file.file, encoding="utf-8"))
    except:
        return status.API_INVALID_CSV_ENCODE
    organization_list = list()
    for row in contents:
        # windows forces csv start with a BOM character '\ufeff', other OS doesnt require BOM
        if "\ufeff" in row[0]:
            row[0] = row[0][1:]
        organization_list.append(row)
    # Removed file persistence to object store
    return organization_crud.create_organization(
        db=db, organization_list=organization_list
    )


@router.get("/api/organization_list/{begin_word}")
def get_organization_list_with_begin(begin_word: str, db: Session = Depends(db.get_db)):
    organization_list = organization_crud.get_organization_list_with_begin(
        db, begin_word=begin_word
    )
    organization_name_list = []
    for organization_name in organization_list:
        organization_name_list.append(organization_name)
    return organization_name_list
