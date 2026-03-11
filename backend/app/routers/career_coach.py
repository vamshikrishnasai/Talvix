from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database
from . import auth
from ..services.ai_service import ai_service

router = APIRouter()

@router.get("/interview-prep")
async def get_interview_prep(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # For students who haven't picked targets, provide general tech prep
    company = current_user.target_company or "Top Tier Tech Companies"
    role = current_user.target_role or "Entry Level Software Engineer"
    
    return await ai_service.generate_interview_prep(
        company,
        role,
        current_user.user_type or "STUDENT"
    )

@router.get("/resume-coach")
async def get_resume_coach(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.uploaded_at.desc()).first()
    if not resume:
        raise HTTPException(status_code=404, detail="No resume found. Please upload one first.")
    
    return await ai_service.generate_resume_audit(resume.raw_text)

@router.post("/chat")
async def chat_with_coach(
    request: dict, # {query: str}
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = request.get("query")
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    
    # Contextual awareness: include role, skills, and experience safely
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.uploaded_at.desc()).first()
    
    def format_list(data):
        if not data: return "Not identified yet"
        if isinstance(data, list): return ", ".join(map(str, data))
        return str(data)

    skills = format_list(resume.extracted_skills) if resume else "No resume uploaded"
    gaps = format_list(resume.missing_skills) if resume else "No analysis available"
    
    context = (
        f"User: {current_user.full_name or 'Candidate'}. "
        f"Goal: {current_user.target_role or 'Career Growth'} at {current_user.target_company or 'Top Tech'}. "
        f"Skills found in resume: {skills}. "
        f"Skills missing for target: {gaps}. "
        f"Knowledge proficiency: {current_user.knowledge_score}%."
    )
    
    response = await ai_service.chat_with_mentor(query, context)
    return {"response": response}

@router.get("/strategic-insights")
async def get_strategic_insights(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.uploaded_at.desc()).first()
    
    skills = ", ".join(resume.extracted_skills) if (resume and resume.extracted_skills) else "Not analyzed"
    gaps = ", ".join(resume.missing_skills) if (resume and resume.missing_skills) else "Unknown"
    
    return await ai_service.get_coach_strategic_insights(
        current_user.target_role or "Software Developer",
        current_user.target_company or "Modern Enterprise",
        skills,
        gaps
    )
