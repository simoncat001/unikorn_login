import sys
import os
from sqlalchemy import text

# Add current directory to sys.path
sys.path.append(os.getcwd())

from database.base import engine

def copy_data():
    with engine.connect() as conn:
        try:
            print("Copying data from standards to standards_v2...")
            # Assuming columns match except review_status
            conn.execute(text("""
                INSERT INTO standards_v2 (id, name_zh, name_en, file_url, review_status)
                SELECT id, name_zh, name_en, file_url, 'pending'
                FROM standards
            """))
            conn.commit()
            print("Data copied successfully.")
        except Exception as e:
            print(f"Copy failed: {e}")

if __name__ == "__main__":
    copy_data()
