from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Onboarding fields
    user_type = Column(String, nullable=True)  # STUDENT, FRESHER, EXPERIENCED
    onboarding_completed = Column(Integer, default=0) # SQLite friendly boolean
    target_company = Column(String, nullable=True)
    target_role = Column(String, nullable=True)
    prep_duration = Column(Integer, default=4) # weeks
    interview_date = Column(DateTime(timezone=True), nullable=True)
    weekly_commitment = Column(Integer, default=5)
    knowledge_score = Column(Float, default=0.0)
    streak_count = Column(Integer, default=0)
    last_activity_date = Column(DateTime(timezone=True), nullable=True)
    target_company_info = Column(JSON, nullable=True) # Cached company data
    interests = Column(JSON, nullable=True) # List of interests
    preferred_domains = Column(JSON, nullable=True) # e.g. ["Web", "ML"]
    photo_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    leetcode_url = Column(String, nullable=True)
    hackerrank_url = Column(String, nullable=True)
    codechef_url = Column(String, nullable=True)
    medium_url = Column(String, nullable=True)
    stackoverflow_url = Column(String, nullable=True)

    resumes = relationship("Resume", back_populates="owner")
    test_results = relationship("TestResult", back_populates="user")
    study_activities = relationship("StudyActivity", back_populates="user")
    predictions = relationship("Prediction", back_populates="user")
    roadmap_items = relationship("RoadmapModule", back_populates="user")
    portfolios = relationship("Portfolio", back_populates="user")
    simulations = relationship("InterviewSimulation", back_populates="user")
    interview_rounds = relationship("InterviewRound", back_populates="user")

class Portfolio(Base):
    __tablename__ = "portfolios"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    bio = Column(Text)
    projects = Column(JSON, nullable=True) # List of project objects
    skills = Column(JSON, nullable=True)
    contact_info = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="portfolios")

class RoadmapModule(Base):
    __tablename__ = "roadmap_modules"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    description = Column(Text)
    resources = Column(Text, nullable=True) # Textual overview
    resource_links = Column(JSON, nullable=True) # List of {title, url, type}
    order = Column(Integer)
    status = Column(String, default="pending") 
    is_ai_test_passed = Column(Integer, default=0)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="roadmap_items")

class InterviewSimulation(Base):
    __tablename__ = "interview_simulations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    company_name = Column(String)
    role = Column(String)
    questions = Column(JSON) # List of questions and user answers
    feedback = Column(JSON, nullable=True) # AI feedback per question
    overall_score = Column(Float, default=0.0)
    readiness_report = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="simulations")

class Resume(Base):
    __tablename__ = "resumes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    raw_text = Column(Text, nullable=True)
    extracted_skills = Column(JSON, nullable=True)  # Store list of skills
    missing_skills = Column(JSON, nullable=True)    # Skills recommended based on role/JD
    experience = Column(JSON, nullable=True)        # List of experience objects
    education = Column(JSON, nullable=True)         # List of education objects
    projects = Column(JSON, nullable=True)          # List of project objects
    ai_recommendations = Column(Text, nullable=True) # Detailed AI feedback
    file_path = Column(String, nullable=True)
    ats_score = Column(Float, default=0.0)
    assessment_attempted = Column(Integer, default=0) # 0 = not attempted, 1 = attempted
    assessment_score = Column(Float, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="resumes")

class JobDescription(Base):
    __tablename__ = "job_descriptions"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    company = Column(String, nullable=True)
    requirements_text = Column(Text)
    required_skills = Column(JSON, nullable=True)
    match_analysis = Column(JSON, nullable=True) # Store comparison results
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    category = Column(String)  # technical, soft, aptitude, etc.

class Test(Base):
    __tablename__ = "tests"
    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True)
    skill_name = Column(String, nullable=True) # Direct mapping for simplicity
    question_data = Column(JSON)  # List of questions with answers
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TestResult(Base):
    __tablename__ = "test_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=True)
    skill_name = Column(String)
    score = Column(Float)
    attempted_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="test_results")

class StudyActivity(Base):
    __tablename__ = "study_activities"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    activity_type = Column(String)  # aptitude, verbal, technical, coding
    duration = Column(Integer)  # minutes
    date = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="study_activities")

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    match_score = Column(Float)
    readiness_level = Column(String)  # Low, Medium, High
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="predictions")

class InterviewRound(Base):
    __tablename__ = "interview_rounds"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    round_name = Column(String) # e.g. Technical Round 1, HR Round
    status = Column(String, default="pending") # pending, completed, selected, rejected
    round_intel = Column(JSON, nullable=True) # AI generated resources/questions for this round
    order = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="interview_rounds")
