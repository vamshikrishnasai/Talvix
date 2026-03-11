from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database
from . import auth
from ..services.ai_service import ai_service

router = APIRouter()

@router.post("/start", response_model=schemas.InterviewSimulation)
async def start_simulation(
    company: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    questions = await ai_service.generate_simulation_questions(company, current_user.target_role or "Software Engineer")
    
    new_sim = models.InterviewSimulation(
        user_id = current_user.id,
        company_name = company,
        role = current_user.target_role or "Software Engineer",
        questions = [{"id": q["id"], "question": q["question"], "answer": ""} for q in questions],
        overall_score = 0.0
    )
    
    db.add(new_sim)
    db.commit()
    db.refresh(new_sim)
    return new_sim

@router.post("/submit/{sim_id}")
async def submit_simulation(
    sim_id: int,
    answers: list, # List of {id, answer}
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    sim = db.query(models.InterviewSimulation).filter(models.InterviewSimulation.id == sim_id, models.InterviewSimulation.user_id == current_user.id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
        
    # Update answers
    updated_questions = []
    for q in sim.questions:
        for a in answers:
            if q["id"] == a["id"]:
                q["answer"] = a["answer"]
        updated_questions.append(q)
    
    sim.questions = updated_questions
    
    # Evaluate
    evaluation = await ai_service.evaluate_simulation(sim.questions)
    sim.feedback = evaluation.get("responses", [])
    sim.overall_score = evaluation.get("overall_score", 0.0)
    sim.readiness_report = evaluation.get("readiness_report", "")
    
    db.commit()
    return evaluation

@router.get("/history", response_model=list[schemas.InterviewSimulation])
def get_sim_history(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.InterviewSimulation).filter(models.InterviewSimulation.user_id == current_user.id).order_by(models.InterviewSimulation.created_at.desc()).all()
