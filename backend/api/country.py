from fastapi import Depends, HTTPException, APIRouter, UploadFile, File
from sqlalchemy.orm import Session

from database import country_crud, schemas, models
from database.base import SessionLocal, engine
import uvicorn
from common import db, status, utils, error
import csv
import codecs


router = APIRouter()


@router.post("/api/create_country/")
async def insert_country_from_excel(
    file: UploadFile = File(...), db: Session = Depends(db.get_db)
):
    try:
        contents = csv.reader(codecs.iterdecode(file.file, encoding="utf-8"))
    except:
        return status.API_INVALID_CSV_ENCODE
    country_list = list()
    for row in contents:
        # windows forces csv start with a BOM character '\ufeff', other OS doesnt require BOM
        if "\ufeff" in row[0]:
            row[0] = row[0][1:]
        country_list.append(row)
    # Removed file persistence to object store
    return country_crud.create_country(db=db, country_list=country_list)
