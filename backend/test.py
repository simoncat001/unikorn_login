from sqlalchemy import create_engine, text
from urllib.parse import quote_plus

# 数据库配置
SQLALCHEMY_DATABASE_PASSWORD = "123456"
SQLALCHEMY_DATABASE_URL = "postgresql+psycopg://unikorn:{}@127.0.0.1:5432/unikorn".format(
    quote_plus(SQLALCHEMY_DATABASE_PASSWORD)
)

def test_connection():
    try:
        engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=True, future=True)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            print("✅ Database connected successfully!")
            print("PostgreSQL version:", result.scalar())
    except Exception as e:
        print("❌ Database connection failed:", e)

if __name__ == "__main__":
    test_connection()
