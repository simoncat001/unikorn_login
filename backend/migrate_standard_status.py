import sys
import os
from sqlalchemy import text

# Add current directory to sys.path
sys.path.append(os.getcwd())

from database.base import engine

def migrate_standards():
    with engine.connect() as conn:
        try:
            # Check if column exists
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='standards' AND column_name='review_status'"))
            if result.fetchone():
                print("Column 'review_status' already exists.")
            else:
                print("Adding 'review_status' column to 'standards' table...")
                conn.execute(text("ALTER TABLE standards ADD COLUMN review_status VARCHAR DEFAULT 'pending'"))
                conn.commit()
                print("Column added successfully.")
        except Exception as e:
            print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate_standards()
