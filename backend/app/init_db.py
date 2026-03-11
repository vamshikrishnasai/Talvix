from .database import engine, Base, DATABASE_URL
from . import models

def create_tables():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    create_tables()
