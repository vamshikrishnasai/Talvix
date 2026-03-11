from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database
from . import auth
from ..services.ai_service import ai_service

router = APIRouter()

@router.get("/rounds")
def get_interview_rounds(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.InterviewRound).filter(
        models.InterviewRound.user_id == current_user.id
    ).order_by(models.InterviewRound.order).all()

@router.post("/add-round")
async def add_interview_round(
    request: dict, # {round_name: str}
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    round_name = request.get("round_name")
    if not round_name:
        raise HTTPException(status_code=400, detail="Round name is required")
    
    # Generate intel for this specific round
    intel = await ai_service.generate_round_intel(
        current_user.target_role or "Software Developer",
        current_user.target_company or "Modern Enterprise",
        round_name
    )
    
    last_round = db.query(models.InterviewRound).filter(
        models.InterviewRound.user_id == current_user.id
    ).order_by(models.InterviewRound.order.desc()).first()
    
    order = (last_round.order + 1) if last_round else 1
    
    new_round = models.InterviewRound(
        user_id=current_user.id,
        round_name=round_name,
        round_intel=intel,
        order=order
    )
    db.add(new_round)
    db.commit()
    return new_round

@router.patch("/update-status/{round_id}")
def update_round_status(
    round_id: int,
    request: dict, # {status: str}
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    round_item = db.query(models.InterviewRound).filter(
        models.InterviewRound.id == round_id,
        models.InterviewRound.user_id == current_user.id
    ).first()
    
    if not round_item:
        raise HTTPException(status_code=404, detail="Round not found")
    
    status = request.get("status") # completed, selected, rejected
    round_item.status = status
    db.commit()
    return round_item

@router.post("/predict-rounds")
async def predict_and_add_rounds(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not current_user.target_company or not current_user.target_role:
        raise HTTPException(status_code=400, detail="Target company and role must be set in your profile.")
    
    # Predict rounds
    predicted_rounds = await ai_service.predict_interview_rounds(
        current_user.target_company,
        current_user.target_role
    )
    
    if not predicted_rounds:
        raise HTTPException(status_code=500, detail="Could not predict rounds at this time.")
    
    # Clear existing rounds to avoid duplicates/confusion if user wants fresh prediction
    db.query(models.InterviewRound).filter(models.InterviewRound.user_id == current_user.id).delete()
    
    added_rounds = []
    for i, name in enumerate(predicted_rounds):
        # Generate intel for each predicted round
        intel = await ai_service.generate_round_intel(
            current_user.target_role,
            current_user.target_company,
            name
        )
        
        db_round = models.InterviewRound(
            user_id=current_user.id,
            round_name=name,
            round_intel=intel,
            order=i + 1
        )
        db.add(db_round)
        added_rounds.append(db_round)
    
    db.commit()
    return added_rounds
