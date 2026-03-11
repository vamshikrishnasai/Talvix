from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from sklearn.linear_model import LogisticRegression
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

from .. import models, schemas, database
from . import auth

router = APIRouter()

# Simple mock data to train the model (would normally be in a separate script/db)
def train_readiness_model():
    # Features: [match_score, avg_test_score, study_streak, mock_interview_count]
    # Labels: 0 (Low), 1 (Medium), 2 (High)
    X = np.array([
        [40, 50, 1, 0], [50, 60, 2, 1], [30, 40, 0, 0],  # Low
        [65, 75, 5, 2], [70, 70, 4, 1], [60, 80, 7, 3],  # Medium
        [85, 90, 14, 5], [90, 85, 21, 6], [95, 95, 30, 10] # High
    ])
    y = np.array([0, 0, 0, 1, 1, 1, 2, 2, 2])
    
    model = LogisticRegression(max_iter=1000)
    model.fit(X, y)
    return model

# Global model instance
readiness_model = train_readiness_model()

def get_readiness_prediction(features):
    # Predict Label
    prediction = readiness_model.predict([features])[0]
    mapping = {0: "Low", 1: "Medium", 2: "High"}
    return mapping.get(prediction)

@router.get("/dashboard", response_model=dict)
def get_dashboard_data(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Match scores
    resumes = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).all()
    # Mock data for demonstration match scores (as we don't have JD links stored easily)
    match_scores = [85, 70, 92] 
    
    # Test scores
    test_results = db.query(models.TestResult).filter(models.TestResult.user_id == current_user.id).all()
    avg_test_score = np.mean([r.score for r in test_results]) if test_results else 0
    
    # Study activities
    activities = db.query(models.StudyActivity).filter(models.StudyActivity.user_id == current_user.id).all()
    # Calculate streak (simple logic)
    streak = 0
    if activities:
        # Sort by date
        sorted_activities = sorted(activities, key=lambda x: x.date, reverse=True)
        # Check if latest is today
        current_date = datetime.utcnow().date()
        for activity in sorted_activities:
            if activity.date.date() == current_date:
                streak += 1
                current_date = current_date - timedelta(days=1)
            elif activity.date.date() > current_date:
                continue
            else:
                break
                
    # Mock interview count
    mock_count = 3 # Hardcoded placeholder

    # Readiness Prediction
    # Features: [latest_match, avg_test, streak, mock_count]
    latest_match = match_scores[-1] if match_scores else 0
    readiness = get_readiness_prediction([latest_match, avg_test_score, streak, mock_count])
    
    # Return everything for the dashboard
    return {
        "match_scores": match_scores,
        "avg_test_score": avg_test_score,
        "streak": streak,
        "readiness": readiness,
        "activities": [
            {"date": a.date.date().isoformat(), "duration": a.duration, "type": a.activity_type}
            for a in activities
        ],
        "test_results": [
            {"skill": r.skill_name, "score": r.score, "date": r.attempted_at.isoformat()}
            for r in test_results
        ]
    }
