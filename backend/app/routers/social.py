from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database
from . import auth
from ..services.ai_service import ai_service
from ..utils_scraping import scrape_url_text
import re

router = APIRouter()

@router.post("/analyze-profile")
async def analyze_social_profile(
    request: dict, # { "linkedin_url": str, "github_url": str }
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    linkedin_url = request.get("linkedin_url", "")
    github_url = request.get("github_url", "")
    
    if not linkedin_url and not github_url:
        raise HTTPException(status_code=400, detail="At least one URL (LinkedIn or GitHub) is required")
        
    linkedin_data = ""
    github_data = ""
    
    if linkedin_url:
        text = scrape_url_text(linkedin_url)
        linkedin_data = text[:5000] if text else "Could not fully scrape, perform heuristic URL analysis."
        
    if github_url:
        text = scrape_url_text(github_url)
        github_data = text[:5000] if text else "Could not fully scrape, perform heuristic URL analysis."
        
    analysis = await ai_service.analyze_social_profiles(linkedin_url, linkedin_data, github_url, github_data, current_user.target_role or "Software Engineer")
    
    if linkedin_url:
        current_user.linkedin_url = linkedin_url
    if github_url:
        current_user.github_url = github_url
        
    db.commit()
    
    return analysis
