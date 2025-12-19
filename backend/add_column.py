import sys
import os
from sqlalchemy import text

# Add current directory to sys.path
sys.path.append(os.getcwd())

from database.base import engine

def add_column():
    with engine.connect() as conn:
        try:
            print("Attempting to add review_status column to standards table...")
            # PostgreSQL syntax
            conn.execute(text("ALTER TABLE standards ADD COLUMN IF NOT EXISTS review_status VARCHAR DEFAULT 'pending'"))
            conn.commit()
            print("Successfully added review_status column.")
        except Exception as e:
            print(f"Error adding column: {e}")
            # In case it's SQLite (which doesn't support IF NOT EXISTS in ADD COLUMN in older versions, but usually does in newer)
            # or if the error is something else.
            # If it's SQLite, we might need a different approach if it fails, but let's try this first.

if __name__ == "__main__":
    add_column()
