import sys
import os
import uuid

# Add current directory to sys.path
sys.path.append(os.getcwd())

from database.base import SessionLocal
from database import models

def debug_standards():
    db = SessionLocal()
    try:
        print("--- All Standards ---")
        standards = db.query(models.Standard).all()
        for s in standards:
            print(f"ID: {s.id} (Type: {type(s.id)}), Name: {s.name_zh}, File: {s.file_url}")
        
        target_id_str = "d39fa678-bf8c-45c0-af36-11f757f32815"
        print(f"\n--- Querying for {target_id_str} ---")
        
        # Try as string
        try:
            res = db.query(models.Standard).filter(models.Standard.id == target_id_str).first()
            print(f"Query by string: {'Found' if res else 'Not Found'}")
        except Exception as e:
            print(f"Query by string failed: {e}")

        # Try as UUID
        try:
            target_uuid = uuid.UUID(target_id_str)
            res = db.query(models.Standard).filter(models.Standard.id == target_uuid).first()
            print(f"Query by UUID: {'Found' if res else 'Not Found'}")
        except Exception as e:
            print(f"Query by UUID failed: {e}")
            
    finally:
        db.close()

if __name__ == "__main__":
    debug_standards()
