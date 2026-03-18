from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from .. import models, schemas, database
from . import auth
from ..services.ai_service import ai_service

router = APIRouter()

@router.get("/current", response_model=list[schemas.RoadmapModule])
async def get_current_roadmap(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    modules = db.query(models.RoadmapModule).filter(
        models.RoadmapModule.user_id == current_user.id
    ).order_by(models.RoadmapModule.order).all()
    
    # If no roadmap exists, maybe they haven't finished onboarding or we should generate a default one
    if not modules and current_user.onboarding_completed:
         # This shouldn't happen if onboarding is done, but as a safety:
         pass
         
    return modules

@router.post("/generate")
async def generate_new_roadmap(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Fetch latest resume for skills and gaps
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.uploaded_at.desc()).first()
    
    skills = []
    gaps = []
    if resume:
        skills = resume.extracted_skills or []
        gaps = resume.missing_skills or []

    # Fetch Market Insights for context
    from ..services.market_service import market_service
    market_data = market_service.get_market_insights(role=current_user.target_role or "All")
    market_context = ""
    if "error" not in market_data:
        top_skills = [s['skill'] for s in market_data.get('top_skills', [])[:3]]
        market_context = f"Top demanded skills in the market for this role are: {', '.join(top_skills)}."

    # Dynamic generation based on current user state
    roadmap_items = await ai_service.generate_roadmap_dynamic(
        role=current_user.target_role or "Software Developer",
        company=current_user.target_company or "Modern Enterprise",
        user_score=current_user.knowledge_score,
        prep_duration_weeks=current_user.prep_duration or 4,
        skills=skills,
        gaps=gaps,
        market_context=market_context
    )
    
    # Clear old items to ensure the roadmap reflects the NEW role/company
    db.query(models.RoadmapModule).filter(models.RoadmapModule.user_id == current_user.id).delete()
    
    if isinstance(roadmap_items, list):
        for i, item in enumerate(roadmap_items):
            db_item = models.RoadmapModule(
                user_id=current_user.id,
                title=item.get("title", f"Module {i+1}"),
                description=item.get("description", ""),
                resources=item.get("description", ""),
                resource_links=item.get("resource_links", []),
                order=i+1,
                status="pending"
            )
            db.add(db_item)
    
    db.commit()
    return {"message": f"Roadmap for {current_user.target_role} at {current_user.target_company} synthesized successfully."}

@router.post("/complete-module/{module_id}")
async def complete_module(
    module_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    module = db.query(models.RoadmapModule).filter(
        models.RoadmapModule.id == module_id,
        models.RoadmapModule.user_id == current_user.id
    ).first()
    
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Generate an AI quiz for this module
    quiz = await ai_service.generate_quiz(module.title, module.description)
    
    return {
        "message": "Module content completed. Please take the validation test.",
        "quiz": quiz
    }

@router.post("/verify-test/{module_id}")
async def verify_test(
    module_id: int,
    score: float, # Percentage 0-100
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    module = db.query(models.RoadmapModule).filter(
        models.RoadmapModule.id == module_id,
        models.RoadmapModule.user_id == current_user.id
    ).first()
    
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    if score >= 70:
        module.status = "completed"
        module.is_ai_test_passed = 1
        module.completed_at = datetime.utcnow()
        
        # Update user streak
        now = datetime.utcnow()
        if not current_user.last_activity_date or (now - current_user.last_activity_date).days == 1:
            current_user.streak_count += 1
        elif (now - current_user.last_activity_date).days > 1:
            current_user.streak_count = 1
            
        current_user.last_activity_date = now
        db.commit()
        return {"success": True, "message": "Test passed! Roadmap updated."}
    else:
        return {"success": False, "message": "Score below 70%. Please review and try again."}

@router.get("/resources")
async def get_learning_resources(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    role = current_user.target_role or "General Hiring Hub"
    resources = await ai_service.generate_learning_resources(
        role,
        current_user.knowledge_score
    )
    return resources

@router.get("/company-pyqs")
async def get_company_pyqs(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not current_user.target_company:
        # Fallback to general hiring PYQs (common for mass recruiters)
        return await ai_service.generate_company_pyqs("Top MNC", "Software Engineer")
    
    return await ai_service.generate_company_pyqs(
        current_user.target_company,
        current_user.target_role or "Software Engineer"
    )
