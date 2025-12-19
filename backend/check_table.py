import sys
import os
from sqlalchemy import text, inspect

# Add current directory to sys.path
sys.path.append(os.getcwd())

from database.base import engine

def check_table():
    insp = inspect(engine)
    if "standards_v2" in insp.get_table_names():
        print("Table standards_v2 exists.")
    else:
        print("Table standards_v2 does NOT exist.")
        # Try to create it manually if not exists
        from database.models import Base
        Base.metadata.create_all(bind=engine)
        print("Created tables.")

if __name__ == "__main__":
    check_table()
