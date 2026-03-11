from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database
from . import auth
from ..services.ai_service import ai_service

router = APIRouter()

@router.get("/", response_model=list[schemas.Portfolio])
def get_user_portfolios(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Portfolio).filter(models.Portfolio.user_id == current_user.id).all()

@router.post("/generate", response_model=schemas.Portfolio)
async def generate_portfolio(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Get user's latest resume and skills
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.uploaded_at.desc()).first()
    skills = resume.extracted_skills if resume and resume.extracted_skills else []
    
    content = await ai_service.generate_portfolio_content(skills, current_user.target_role or "Software Engineer")
    
    new_portfolio = models.Portfolio(
        user_id = current_user.id,
        title = f"{current_user.full_name or 'My'} Professional Portfolio",
        bio = content.get("bio", ""),
        projects = content.get("projects", []),
        skills = skills,
        contact_info = {"email": current_user.email}
    )
    
    db.add(new_portfolio)
    db.commit()
    db.refresh(new_portfolio)
    return new_portfolio

@router.delete("/{portfolio_id}")
def delete_portfolio(
    portfolio_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    p = db.query(models.Portfolio).filter(models.Portfolio.id == portfolio_id, models.Portfolio.user_id == current_user.id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    db.delete(p)
    db.commit()
    return {"message": "Deleted"}
