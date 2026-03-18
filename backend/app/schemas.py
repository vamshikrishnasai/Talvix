from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    target_role: Optional[str] = None
    target_company: Optional[str] = None
    prep_duration: Optional[int] = None
    user_type: Optional[str] = None
    photo_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    leetcode_url: Optional[str] = None
    hackerrank_url: Optional[str] = None
    codechef_url: Optional[str] = None
    medium_url: Optional[str] = None
    stackoverflow_url: Optional[str] = None

class User(UserBase):
    id: int
    created_at: datetime
    user_type: Optional[str] = None
    onboarding_completed: int = 0
    target_company: Optional[str] = None
    target_role: Optional[str] = None
    prep_duration: int = 4
    knowledge_score: float = 0.0
    streak_count: int = 0
    target_company_info: Optional[Dict[str, Any]] = None
    photo_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    leetcode_url: Optional[str] = None
    hackerrank_url: Optional[str] = None
    codechef_url: Optional[str] = None
    medium_url: Optional[str] = None
    stackoverflow_url: Optional[str] = None
    class Config:
        from_attributes = True

class OnboardingSurvey(BaseModel):
    user_type: str
    interests: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    target_company: Optional[str] = None
    target_role: Optional[str] = None
    interview_date: Optional[datetime] = None
    weekly_commitment: int = 5
    prep_duration: int = 4
    knowledge_score: Optional[float] = None

class RoadmapModule(BaseModel):
    id: int
    title: str
    description: str
    resources: Optional[str] = None
    resource_links: Optional[List[Dict[str, Any]]] = None
    order: int
    status: str
    is_ai_test_passed: int
    completed_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class PortfolioBase(BaseModel):
    title: str
    bio: str
    projects: Optional[List[Dict[str, Any]]] = None
    skills: Optional[List[str]] = None
    contact_info: Optional[Dict[str, Any]] = None

class Portfolio(PortfolioBase):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class InterviewSimulationBase(BaseModel):
    company_name: str
    role: str
    questions: List[Dict[str, Any]]

class InterviewSimulation(InterviewSimulationBase):
    id: int
    user_id: int
    feedback: Optional[List[Dict[str, Any]]] = None
    overall_score: float
    readiness_report: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ResumeBase(BaseModel):
    raw_text: Optional[str] = None
    extracted_skills: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None
    experience: Optional[List[Dict[str, Any]]] = None
    education: Optional[List[Dict[str, Any]]] = None
    projects: Optional[List[Dict[str, Any]]] = None
    ai_recommendations: Optional[str] = None
    file_path: Optional[str] = None
    ats_score: float = 0.0
    assessment_attempted: int = 0
    assessment_score: Optional[float] = None

class Resume(ResumeBase):
    id: int
    user_id: int
    uploaded_at: datetime
    class Config:
        from_attributes = True

class JDBase(BaseModel):
    title: str
    company: Optional[str] = None
    requirements_text: str
    required_skills: Optional[List[str]] = None
    match_analysis: Optional[Dict[str, Any]] = None

class JD(JDBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class SkillBase(BaseModel):
    name: str
    category: str

class Skill(SkillBase):
    id: int
    class Config:
        from_attributes = True

class TestBase(BaseModel):
    skill_name: str
    question_data: List[Dict[str, Any]]

class Test(TestBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class TestResultBase(BaseModel):
    skill_name: str
    score: float

class TestResult(TestResultBase):
    id: int
    user_id: int
    attempted_at: datetime
    class Config:
        from_attributes = True

class Prediction(BaseModel):
    match_score: float
    readiness_level: str
    timestamp: datetime
    class Config:
        from_attributes = True
