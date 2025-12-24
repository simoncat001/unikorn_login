import uuid
from database.base import SessionLocal
from database import template_draft_crud

with SessionLocal() as db:
    d = template_draft_crud.create_draft(
        db,
        owner="_smoke_" + uuid.uuid4().hex[:8],
        title="smoke",
        payload={"basicInfo": {"title": "smoke"}, "templateData": {"level0": []}},
    )
    print("created", bool(d), getattr(d, "id", None))
