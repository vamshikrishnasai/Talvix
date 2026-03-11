from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database
from . import auth
from ..services.ai_service import ai_service
import random

router = APIRouter()

@router.get("/assessment")
async def get_skill_assessment(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.uploaded_at.desc()).first()
    if not resume:
        print(f"DEBUG: No resume found for user {current_user.email}")
        return []
    
    print(f"DEBUG: Generating assessment for {current_user.email} (Skills: {resume.extracted_skills})")
    
    skills_to_test = resume.extracted_skills[:5] if resume.extracted_skills else ["Software Engineering", "Logic", "Coding"]
    quiz = await ai_service.generate_resume_skill_test(skills_to_test)
    
    if not quiz:
        print(f"DEBUG: AI failed to generate quiz for {current_user.email}. Using hardcoded fallback.")
        # Minimal hardcoded fallback to ensure questions.length > 0
        quiz = [
            {"question": "Which of these is fundamental in software development?", "options": ["Data Structures", "Coffee", "Social Media", "Gaming"], "correct_answer_index": 0},
            {"question": "What does JSON stand for?", "options": ["JavaScript Object Notation", "Java Sequential Objects", "Just Some Old Note", "Joined Script Objects"], "correct_answer_index": 0}
        ]
        
    return quiz

@router.post("/test/submit", response_model=schemas.TestResult)
def submit_test_result(
    result: schemas.TestResultBase,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    new_result = models.TestResult(
        user_id=current_user.id,
        skill_name=result.skill_name,
        score=result.score
    )
    db.add(new_result)
    db.commit()
    db.refresh(new_result)
    return new_result

@router.get("/laboratories")
def list_laboratories(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Base labs available for everyone
    base_labs = [
        {"id": "tech", "title": "Technical Laboratory", "domain": "Technical", "icon": "cpu", "desc": "Role-specific deep tech assessment."},
        {"id": "soft", "title": "Soft Skills Lab", "domain": "Soft Skills", "icon": "users", "desc": "Communication & Team empathy metrics."},
        {"id": "lsrw", "title": "LSRW Lab", "domain": "LSRW", "icon": "volume2", "desc": "Listen, Speak, Read, Write proficiency."},
        {"id": "verbal", "title": "Verbal Intelligence", "domain": "Verbal", "icon": "globe", "desc": "Grammar and comprehensive reasoning."},
        {"id": "aptitude", "title": "Aptitude Matrix", "domain": "Aptitude", "icon": "target", "desc": "Quantitative and Logical speed-tests."},
        {"id": "hr", "title": "HR Interaction", "domain": "HR Questions", "icon": "user-check", "desc": "Mastering the final human interview."},
        {"id": "behavioral", "title": "Behavioral Insights", "domain": "Behavioral", "icon": "smile", "desc": "Situational & Star-method analysis."}
    ]
    
    # Add company specific if set
    if current_user.target_company:
        base_labs.append({
            "id": "pyq", 
            "title": f"{current_user.target_company} PYQs", 
            "domain": f"PYQ_{current_user.target_company}", 
            "icon": "history", 
            "desc": f"Historical interview questions from {current_user.target_company}."
        })

    # Access last attempts
    results = db.query(models.TestResult).filter(models.TestResult.user_id == current_user.id).all()
    # map domain -> latest attempt time
    latest_attempts = {}
    for r in results:
        if r.skill_name not in latest_attempts or r.attempted_at > latest_attempts[r.skill_name]:
            latest_attempts[r.skill_name] = r.attempted_at
    
    from datetime import datetime, timedelta, timezone
    now = datetime.now(timezone.utc)

    for lab in base_labs:
        domain = lab["domain"]
        if domain in latest_attempts:
            last_time = latest_attempts[domain]
            # Ensure last_time is offset-aware
            if last_time.tzinfo is None:
                last_time = last_time.replace(tzinfo=timezone.utc)
            
            diff = now - last_time
            if diff < timedelta(days=2):
                lab["status"] = "Completed"
                # Calculate hours until refresh
                remaining = timedelta(days=2) - diff
                hours = int(remaining.total_seconds() // 3600)
                lab["scheduled_date"] = f"Refreshes in {hours}h"
            else:
                lab["status"] = "Pending"
                lab["scheduled_date"] = "New Set Available"
        else:
            lab["status"] = "Pending"
            lab["scheduled_date"] = "Available Now"
        
        lab["questions_count"] = 15

    return base_labs

@router.get("/domain/{domain}")
async def get_test_by_domain(
    domain: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    print(f"DEBUG: Generating {domain} assessment for {current_user.email}")
    
    quiz = await ai_service.generate_quiz(domain, f"This is for a {current_user.user_type} candidate targeting {current_user.target_role or 'Tech'}.")
    
    if not quiz:
        # Domain Fallbacks
        fallbacks = {
            "Aptitude": [{"question": "What is the missing number: 2, 4, 8, 16, ?", "options": ["20", "24", "32", "64"], "correct_answer_index": 2}],
            "Soft Skills": [{"question": "What is the best way to handle a team conflict?", "options": ["Ignore it", "Report to HR immediately", "Open communication and empathy", "Argue loudly"], "correct_answer_index": 2}],
        }
        return fallbacks.get(domain, [
            {"question": f"Which of these is fundamental in {domain}?", "options": ["Option A", "Option B", "Option C", "Option D"], "correct_answer_index": 0}
        ])
        
    return quiz

@router.get("/resume-skill-test")
async def generate_resume_special_test(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # This serves the same purpose as the assessment route above
    return await get_skill_assessment(db, current_user)

@router.get("/performance-summary")
async def get_performance_summary(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Gather stats
    test_results = db.query(models.TestResult).filter(models.TestResult.user_id == current_user.id).all()
    simulations = db.query(models.InterviewSimulation).filter(models.InterviewSimulation.user_id == current_user.id).all()
    roadmap_items = db.query(models.RoadmapModule).filter(models.RoadmapModule.user_id == current_user.id).all()
    
    stats = {
        "tests_taken": len(test_results),
        "avg_test_score": sum(r.score for r in test_results) / len(test_results) if test_results else 0,
        "simulations_done": len(simulations),
        "avg_sim_score": sum(s.overall_score for s in simulations) / len(simulations) if simulations else 0,
        "roadmap_progress": (len([m for m in roadmap_items if m.status == 'completed']) / len(roadmap_items) * 100) if roadmap_items else 0
    }
    
    # Get AI summary
    summary = await ai_service.analyze_performance_summary(stats)
    
    return {
        "stats": stats,
        "summary": summary
    }
