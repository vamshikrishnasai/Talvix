from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database
from . import auth
from ..services.ai_service import ai_service

router = APIRouter()

@router.get("/")
async def perform_search(
    q: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Perform a basic keyword search in DB and AI-based extended search
    # This searches through:
    # 1. Any existing companies in JD history or current target
    # 2. AI-generated resources/topics relevant to 'q'
    
    # AI search for resources based on query
    ai_results = await ai_service.generate_learning_resources(q, current_user.knowledge_score)
    
    # Basic company mock/search
    companies = []
    if current_user.target_company and q.lower() in current_user.target_company.lower():
        companies.append({"name": current_user.target_company, "location": "USA"})
        
    return {
        "companies": companies,
        "resources": ai_results
    }
