# Smart Career Assistance & Interview Preparation Platform

An AI-powered full-stack platform designed to help users bridge the gap between their current skills and their dream roles.

## Features
- **Premium Dashboard**: Visualizes your progress, skill scores, and interview readiness.
- **AI Resume Analysis**: NLP-powered extraction of text and skills from PDF resumes (with Tesseract OCR fallback).
- **JD Matching**: Real-time compatibility score between your profile and job descriptions using TF-IDF and Cosine Similarity.
- **Skill Gap Discovery**: Precisely identifies strong, weak, and missing skills.
- **Personalized Roadmap**: Generates a week-by-week study plan based on identified gaps.
- **Skill Assessments**: Interactive tests to validate your knowledge and earn XP.
- **AI Mock Interviews**: Behavioral and technical practice sessions.
- **Predictive Analytics**: Logistic Regression model to predict your interview readiness level.

## Tech Stack
- **Frontend**: Next.js, TypeScript, Tailwind CSS, Recharts, Framer Motion
- **Backend**: FastAPI (Python), PostgreSQL, SQLAlchemy
- **AI/ML**: spaCy, NLTK, Scikit-learn, Pandas, NumPy
- **Extraction**: pdfplumber, Tesseract OCR

## Getting Started

### Backend Setup
1. Navigate to the `backend` folder.
2. Create a virtual environment: `python -m venv venv`.
3. Activate it: `venv\Scripts\activate`.
4. Install dependencies: `pip install -r requirements.txt`.
5. Run spaCy model download: `python -m spacy download en_core_web_sm`.
6. Set up your `.env` file with `DATABASE_URL` and `SECRET_KEY`.
7. Initialize database: `python -m app.init_db`.
8. Start the server: `uvicorn app.main:app --reload`.

### Frontend Setup
1. Navigate to the `frontend` folder.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`.

## Project Structure
```
├── backend/
│   ├── app/
│   │   ├── routers/       # API endpoints (auth, resume, jd, etc.)
│   │   ├── models.py      # SQLAlchemy models
│   │   ├── schemas.py     # Pydantic schemas
│   │   ├── database.py    # DB connection logic
│   │   └── main.py        # Entry point
│   └── requirements.txt
├── frontend/
│   ├── app/               # Next.js pages & routing
│   ├── components/        # Reusable UI components
│   └── public/            # Static assets
└── implementation_plan.md # Detailed project roadmap
```
