from sqlalchemy.orm import Session
from sqlalchemy import String
from . import models


def get_serial_number(db: Session, type: str):
    row = (
        db.query(models.SerialNumber.current_number)
        .with_for_update()
        .filter(models.SerialNumber.type == type)
        .first()
    )
    if not row:
        # 初始化
        db.add(models.SerialNumber(type=type, current_number=0))
        db.commit()
        current = 0
    else:
        current = int(row[0])
    new_value = current + 1
    db.query(models.SerialNumber).filter(models.SerialNumber.type == type).update(
        {models.SerialNumber.current_number: new_value}
    )
    db.commit()
    return new_value
