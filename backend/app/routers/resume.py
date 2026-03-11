from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import pdfplumber
import pytesseract
from PIL import Image
import io
import spacy
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import os
import re

from .. import models, schemas, database
from . import auth
from ..skills_dict import SKILL_LIST
from ..services.ai_service import ai_service

router = APIRouter()

# Download necessary NLTK data
try:
    nltk.download('punkt')
    nltk.download('punkt_tab')
    nltk.download('stopwords')
    nltk.download('wordnet')
except:
    pass

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    # try downloading it if not present
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

def extract_text_from_pdf(file_content: bytes):
    text = ""
    # Try pdfplumber
    try:
        with pdfplumber.open(io.BytesIO(file_content)) as pdf:
            for page in pdf.pages:
                content = page.extract_text()
                if content:
                    text += content + "\n"
    except Exception as e:
        print(f"pdfplumber failed: {e}")
    
    # Fallback to OCR if text is empty or too short (scanned PDF)
    # ... placeholder for now ...
            
    return text

def preprocess_text(text: str):
    # Lowercase
    text = text.lower()
    # Remove special characters
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    # Tokenization
    tokens = word_tokenize(text)
    # Remove stopwords and lemmatize
    stop_words = set(stopwords.words('english'))
    lemmatizer = WordNetLemmatizer()
    processed_tokens = [lemmatizer.lemmatize(token) for token in tokens if token not in stop_words]
    return " ".join(processed_tokens)

def extract_skills_from_text(text: str):
    found_skills = []
    # Simple rule-based match
    text = text.lower()
    for skill in SKILL_LIST:
        # Word boundary search to avoid partial matches
        if re.search(r'\b' + re.escape(skill) + r'\b', text):
            found_skills.append(skill)
    return list(set(found_skills))

@router.post("/upload", response_model=schemas.Resume)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    content = await file.read()
    raw_text = extract_text_from_pdf(content)
    
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")
    
    # Deep AI analysis for genuine scoring
    try:
        analysis = await ai_service.analyze_resume_deep(raw_text, target_role=current_user.target_role or "Software Engineer")
        
        # Safe float conversion for ATS Score
        ats_val = analysis.get("ats_score", 0.0)
        try:
            if isinstance(ats_val, str):
                ats_val = re.sub(r'[^0-9.]', '', ats_val)
                ats_val = float(ats_val) if ats_val else 0.0
            else:
                ats_val = float(ats_val)
        except:
            ats_val = 50.0 # Default if AI fails logic

        new_resume = models.Resume(
            user_id=current_user.id,
            raw_text=raw_text,
            extracted_skills=analysis.get("extracted_skills", []),
            missing_skills=analysis.get("missing_skills", []),
            experience=analysis.get("experience", []),
            education=analysis.get("education", []),
            projects=analysis.get("projects", []),
            ai_recommendations=analysis.get("recommendations", ""),
            file_path=file.filename,
            ats_score=ats_val
        )
        db.add(new_resume)
        db.commit()
        db.refresh(new_resume)
        return new_resume
    except Exception as e:
        print(f"RESUME_ANALYSIS_CRASH: {e}")
        raise HTTPException(status_code=500, detail=f"Strategic Analysis Failure: {str(e)}")

@router.get("/generate-exam/{resume_id}")
async def generate_resume_exam(
    resume_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id, models.Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    if resume.assessment_attempted == 1:
        raise HTTPException(status_code=400, detail="Assessment already attempted for this resume.")
    
    skills = resume.extracted_skills if resume.extracted_skills else ["General Engineering"]
    exam_questions = await ai_service.generate_resume_skill_test(skills)
    
    return exam_questions

@router.post("/submit-exam/{resume_id}")
async def submit_resume_exam(
    resume_id: int,
    score: float,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id, models.Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    resume.assessment_attempted = 1
    resume.assessment_score = score
    db.commit()
    
    return {"message": "Exam submitted successfully", "score": score}

@router.get("/my-resumes", response_model=list[schemas.Resume])
def get_user_resumes(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Resume).filter(models.Resume.user_id == current_user.id).all()
