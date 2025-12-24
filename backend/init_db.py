from database.base import Base, engine
from database import models

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully.")
