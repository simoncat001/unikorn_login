from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import standard_crud, schemas, models
from common import db, auth

router = APIRouter()

@router.post("/api/standards", response_model=schemas.Standard)
def create_standard(
    standard: schemas.StandardCreate, 
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    standard.owner = current_user.user_name
    return standard_crud.create_standard(db=db, standard=standard)

@router.get("/api/standards/my", response_model=List[schemas.Standard])
def read_my_standards(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return standard_crud.get_standards_by_owner(db, owner=current_user.user_name, skip=skip, limit=limit)

@router.get("/api/standards/my/count")
def count_my_standards(
    db: Session = Depends(db.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    count = standard_crud.count_standards_by_owner(db, owner=current_user.user_name)
    return {"count": count}

@router.get("/api/standards", response_model=List[schemas.Standard])
def read_standards(skip: int = 0, limit: int = 100, db: Session = Depends(db.get_db)):
    standards = standard_crud.get_standards(db, skip=skip, limit=limit)
    return standards

@router.get("/api/standards/search", response_model=List[schemas.Standard])
def search_standards(q: str, skip: int = 0, limit: int = 100, db: Session = Depends(db.get_db)):
    standards = standard_crud.search_standards(db, query=q, skip=skip, limit=limit)
    return standards

@router.get("/api/standards/{standard_id}", response_model=schemas.Standard)
def read_standard(standard_id: str, db: Session = Depends(db.get_db)):
    db_standard = standard_crud.get_standard(db, standard_id=standard_id)
    if db_standard is None:
        raise HTTPException(status_code=404, detail="Standard not found")
    return db_standard

@router.put("/api/standards/{standard_id}/status", response_model=schemas.Standard)
def update_standard_status(standard_id: str, status_update: schemas.StandardStatusUpdate, db: Session = Depends(db.get_db)):
    db_standard = standard_crud.update_standard_status(db, standard_id, status_update.review_status)
    if db_standard is None:
        raise HTTPException(status_code=404, detail="Standard not found")
    return db_standard

@router.delete("/api/standards/{standard_id}")
def delete_standard(standard_id: str, db: Session = Depends(db.get_db)):
    success = standard_crud.delete_standard(db, standard_id)
    if not success:
        raise HTTPException(status_code=404, detail="Standard not found")
    return {"status": 0, "message": "Deleted successfully"}
