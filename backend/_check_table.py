from sqlalchemy import text
from database.base import engine

with engine.connect() as c:
    r = c.execute(text("SELECT to_regclass('public.template_drafts')"))
    print("template_drafts:", r.scalar())
