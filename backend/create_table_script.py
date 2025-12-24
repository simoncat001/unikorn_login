from database.base import engine
from sqlalchemy import text

def create_table():
    sql = """
    CREATE TABLE IF NOT EXISTS standards (
        id UUID PRIMARY KEY,
        name_zh VARCHAR,
        name_en VARCHAR,
        file_url VARCHAR
    );
    """
    try:
        with engine.connect() as conn:
            conn.execute(text(sql))
            conn.commit()
            print("Table 'standards' created successfully.")
    except Exception as e:
        print(f"Error creating table: {e}")

if __name__ == "__main__":
    create_table()
