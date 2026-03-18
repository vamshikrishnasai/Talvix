import sys
import os
sys.path.append(os.getcwd())
from app.database import engine, Base

print("Checking DB connection...")
try:
    with engine.connect() as conn:
        print("Successfully connected to DB.")
    
    print("Trying metadata sync...")
    Base.metadata.create_all(bind=engine)
    print("Metadata sync complete.")
except Exception as e:
    print(f"DB Error: {e}")
    import traceback
    traceback.print_exc()
