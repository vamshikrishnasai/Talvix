from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from .. import models, schemas, database
from . import auth
from .resume import extract_skills_from_text, preprocess_text
from ..services.ai_service import ai_service

router = APIRouter()

def calculate_match_score(resume_text: str, jd_text: str):
    # Process text
    resume_processed = preprocess_text(resume_text)
    jd_processed = preprocess_text(jd_text)
    
    # Vectorize
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([resume_processed, jd_processed])
    
    # Similarity
    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
    return float(similarity[0][0]) * 100

def perform_skill_gap_analysis(resume_skills: list, jd_skills: list):
    resume_skills = set(resume_skills)
    jd_skills = set(jd_skills)
    
    strong = list(resume_skills.intersection(jd_skills))
    missing = list(jd_skills - resume_skills)
    
    return {
        "strong": strong,
        "missing": missing,
        "weak": [] # Placeholder for future logic
    }

@router.post("/analyze", response_model=dict)
async def analyze_synergy(
    request: dict, # {resume_id: int, jd_text: str, company: str}
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    resume_id = request.get("resume_id")
    jd_text = request.get("jd_text")
    company = request.get("company", "Generic Enterprise")
    
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id, models.Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume dossier not found")
    
    # Perform AI synergy analysis
    analysis = await ai_service.analyze_jd_synergy(resume.raw_text, jd_text)
    
    # Extract jd_skills (Basic extraction for storage)
    jd_skills = extract_skills_from_text(preprocess_text(jd_text))
    
    # Store JD with analysis
    new_jd = models.JobDescription(
        title=current_user.target_role or "Target Role",
        company=company,
        requirements_text=jd_text,
        required_skills=jd_skills,
        match_analysis=analysis # Store full JSON
    )
    db.add(new_jd)
    db.commit()
    db.refresh(new_jd)
    
    return {
        "jd_id": new_jd.id,
        "analysis": analysis
    }

@router.get("/history")
def get_synergy_history(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # This is a bit complex since JobDescription doesn't have user_id. 
    # Usually we'd want a link table. For now, let's just return all for simplicity or add user_id later.
    # Actually, let's keep it simple for now as requested.
    return db.query(models.JobDescription).order_by(models.JobDescription.created_at.desc()).all()
@router.get("/company-insights/{company_name}")
async def get_company_insights(
    company_name: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    from ..services.ai_service import ai_service
    
    # Check cache
    if current_user.target_company == company_name and current_user.target_company_info:
        return current_user.target_company_info
    
    insights = await ai_service.get_company_insights(
        company_name, 
        current_user.target_role or "Software Developer"
    )
    
    # Update cache if this is the target company
    if current_user.target_company == company_name:
        current_user.target_company_info = insights
        db.commit()
        
    return insights
