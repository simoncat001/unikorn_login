import os
from settings import settings

# 数据库连接：优先从环境变量/ini 解析，避免写死到 127.0.0.1
SQLALCHEMY_DATABASE_URL = settings.get_database_url()

PLATFORM_NAME = "MGSDB"
PLATFORM_WEBSITE = "MGSDB.sjtu.edu.cn"

# 对象存储：可通过环境变量 OBJECT_STORE_URLS 覆盖，逗号分隔；默认本机 7701。
_raw = os.getenv("OBJECT_STORE_URLS")
if _raw:
    OBJECT_STORE_URL_LIST = [u.strip() for u in _raw.split(",") if u.strip()]
else:
    OBJECT_STORE_URL_LIST = ["http://127.0.0.1:7701"]
