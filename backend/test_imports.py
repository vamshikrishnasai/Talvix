import sys
import os
sys.path.append(os.getcwd())

print("Testing imports...")
try:
    from app.routers import auth, resume, jd, assessment, roadmap, analytics, onboarding, career_coach, portfolio, interview, search
    print("Imports successful!")
except Exception as e:
    print(f"Import failed: {e}")
    import traceback
    traceback.print_exc()
