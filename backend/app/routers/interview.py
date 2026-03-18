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

@router.get("/generate-mock")
async def generate_mock_interview(
    mock_type: str = "Technical",
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    role = current_user.target_role or "Software Developer"
    company = current_user.target_company or "Modern Enterprise"
    
    questions = await ai_service.generate_mock_interview_questions(role, company, mock_type)
    if not questions:
        # Static Fallback
        questions = [
            {"id": 1, "question": f"Explain your experience with {role} fundamentals.", "difficulty": "Medium"},
            {"id": 2, "question": "Walk me through a complex project you've handled.", "difficulty": "Hard"}
        ]
    
    return {
        "company": company,
        "role": role,
        "mock_type": mock_type,
        "questions": questions
    }

@router.post("/chat-mock")
async def chat_mock_interview(
    request: dict, # {mock_type: str, history: list, current_message: str}
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    role = current_user.target_role or "Software Developer"
    company = current_user.target_company or "Modern Enterprise"
    mock_type = request.get("mock_type", "Technical")
    history = request.get("history", []) # List of {role: 'user'|'assistant', content: str}
    current_message = request.get("current_message", "")

    if not current_message and not history:
        # Initial greeting from AI
        prompt = f"Act as an interviewer at {company} for a {role} position. This is a {mock_type} interview. Start the interview by introducing yourself and asking the first question. Be professional and concise."
        response = await ai_service._generate_content_async(prompt)
        return {"response": response}

    # Construct the conversation
    system_prompt = f"You are a professional interviewer at {company} conducting a {mock_type} interview for a {role} candidate. Keep the conversation realistic, professional, and focused. Ask one follow-up or new question at a time. If the candidate asks for feedback, politely remind them that evaluation will be provided at the end."
    
    response = await ai_service.chat_with_mentor(current_message, system_prompt, history)
    return {"response": response}

@router.post("/submit-mock")
async def submit_mock_interview(
    request: dict, # {questions: list, answers: list, mock_type: str}
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    role = current_user.target_role or "Software Developer"
    company = current_user.target_company or "Modern Enterprise"
    
    q_and_a = []
    provided_questions = request.get("questions", [])
    provided_answers = request.get("answers", [])
    
    for i in range(len(provided_questions)):
        q_and_a.append({
            "question": provided_questions[i],
            "answer": provided_answers[i] if i < len(provided_answers) else "No answer provided."
        })
    
    analysis = await ai_service.analyze_interview_feedback(role, company, q_and_a)
    
    # Save simulation
    new_sim = models.InterviewSimulation(
        user_id = current_user.id,
        company_name = company,
        role = role,
        questions = q_and_a,
        feedback = analysis.get("feedback_per_question"),
        overall_score = analysis.get("overall_score", 0.0),
        readiness_report = analysis.get("readiness_report")
    )
    db.add(new_sim)
    db.commit()
    db.refresh(new_sim)
    
    return {
        "simulation_id": new_sim.id,
        "analysis": analysis
    }

@router.get("/simulations")
def get_past_simulations(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.InterviewSimulation).filter(
        models.InterviewSimulation.user_id == current_user.id
    ).order_by(models.InterviewSimulation.created_at.desc()).all()
