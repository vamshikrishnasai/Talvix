from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, resume, jd, assessment, roadmap, analytics, onboarding, career_coach, portfolio, interview, search, market, social
from .database import engine, Base
from . import models

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Talvix: Smart Career Assistance API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Talvix Intelligence Feed"}

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(jd.router, prefix="/api/jd", tags=["jd"])
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["roadmap"])
app.include_router(assessment.router, prefix="/api/assessment", tags=["assessment"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(onboarding.router, prefix="/api/onboarding", tags=["onboarding"])
app.include_router(career_coach.router, prefix="/api/coach", tags=["coach"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["portfolio"])
app.include_router(interview.router, prefix="/api/interview", tags=["interview"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(market.router, prefix="/api/market", tags=["market"])
app.include_router(social.router, prefix="/api/social", tags=["social"])
