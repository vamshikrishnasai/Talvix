from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database, utils
from ..services.ai_service import ai_service
from .auth import get_current_user
from datetime import datetime

router = APIRouter()

@router.post("/survey")
async def process_survey(
    survey: schemas.OnboardingSurvey,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Calculate knowledge score based on skills/interests (Fallback)
    skills_count = len(survey.skills or [])
    interests_count = len(survey.interests or [])
    rule_score = min(100, (skills_count * 15) + (interests_count * 5))
    
    # Use the test score from frontend if available, else fallback
    final_score = survey.knowledge_score if survey.knowledge_score is not None else float(rule_score)
    
    # Update user data
    current_user.user_type = survey.user_type
    current_user.target_company = survey.target_company
    current_user.target_role = survey.target_role
    current_user.interview_date = survey.interview_date
    current_user.weekly_commitment = survey.weekly_commitment
    current_user.prep_duration = survey.prep_duration
    current_user.knowledge_score = float(final_score)
    current_user.interests = survey.interests
    current_user.onboarding_completed = 1
    
    # Generate Roadmap via AI
    roadmap_items = await ai_service.generate_roadmap_dynamic(
        survey.target_role or "Software Engineer",
        survey.target_company or "Generic Tech",
        final_score,
        survey.prep_duration,
        user_type=survey.user_type,
        interests=survey.interests
    )
    
    # Clear old roadmap items if any
    db.query(models.RoadmapModule).filter(models.RoadmapModule.user_id == current_user.id).delete()
    
    # Add new roadmap items
    if isinstance(roadmap_items, list):
        for i, item in enumerate(roadmap_items):
            db_item = models.RoadmapModule(
                user_id=current_user.id,
                title=item.get("title", f"Module {i+1}"),
                description=item.get("description", ""),
                resources=item.get("description", ""), # Use description as fallback text
                resource_links=item.get("resource_links", []),
                order=i+1,
                status="pending"
            )
            db.add(db_item)
    
    db.commit()
    db.refresh(current_user)
    
    db.commit()
    db.refresh(current_user)
    
    # Re-trigger roadmap generation to reflect NEW role/company immediately
    try:
        from .roadmap import generate_new_roadmap
        await generate_new_roadmap(db, current_user)
    except Exception as e:
        print(f"ONBOARDING_ROADMAP_GEN_ERROR: {e}")
    
    return {
        "score": final_score,
        "user_type": current_user.user_type,
        "message": f"Mission path for {current_user.target_role} at {current_user.target_company} synthesized."
    }

@router.get("/status")
async def get_onboarding_status(current_user: models.User = Depends(get_current_user)):
    return {
        "onboarding_completed": bool(current_user.onboarding_completed),
        "user_type": current_user.user_type
    }

@router.get("/questions")
async def get_onboarding_questions(
    user_type: str,
    current_user: models.User = Depends(get_current_user)
):
    questions = await ai_service.generate_survey_questions(user_type)
    return questions
