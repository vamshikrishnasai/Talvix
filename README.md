# Talvix: AI-Powered Career Intelligence & Interview Prep Platform

<p align="center">
  <img src="frontend/public/talvix_logo_.png" alt="Talvix Logo" width="200"/>
</p>

Talvix is a cutting-edge, full-stack application designed to accelerate career growth using artificial intelligence. It bridges the gap between a candidate's current skills and their dream roles through deep analysis, personalized roadmaps, and realistic interview simulations.

![Talvix Banner](https://via.placeholder.com/1200x400?text=Talvix+AI+Career+Platform)

## 🚀 Key Features

### 1. Conversational AI Mock Interviews
- **Real-time Dialogue**: Engage in back-and-forth technical and behavioral interviews with a Mistral-powered AI.
- **Voice Capabilities**: Integrated **Speech-to-Text** (STT) for natural answering and **Text-to-Speech** (TTS) for an immersive interviewer experience.
- **Deep Evaluation**: Receive a readiness score and "Compare with Better Answer" insights for every turn.

### 2. Intelligent Resume & JD Analysis
- **NLP Resume Parser**: Extracts skills, experience, and education using spaCy and NLTK.
- **Skill Gap Discovery**: Automatically identifies missing skills required for your target role and company.
- **Match Scoring**: Real-time compatibility analysis using TF-IDF and Cosine Similarity.

### 3. Dynamic Learning Roadmaps
- **Week-by-Week Strategy**: Generates a personalized study plan based on your unique skill gaps.
- **Curated Resources**: Direct links to YouTube, documentation, and practice problems (LeetCode/HackerRank).

### 4. Market Intelligence & Performance Tracking
- **Live Job Market Insights**: Data-driven analysis of role demand, recession risks, and salary trends.
- **Performance Dashboard**: Beautifully rendered Recharts visualizations of your knowledge progression and assessment scores.

### 5. AI Career Coach
- **24/7 Mentorship**: A dedicated AI mentor to answer career-related queries, provide strategic insights, and guide your preparation.

## 🛠️ Tech Stack

- **Frontend**: 
    - [Next.js 15+](https://nextjs.org/) (App Router, Turbopack)
    - [TypeScript](https://www.typescriptlang.org/)
    - [Tailwind CSS](https://tailwindcss.com/)
    - [Framer Motion](https://www.framer.com/motion/) (Premium Animations)
    - [Recharts](https://recharts.org/) (Data Visualization)
    - [Lucide React](https://lucide.dev/) (Iconography)

- **Backend**:
    - [FastAPI](https://fastapi.tiangolo.com/) (High-performance Python framework)
    - [PostgreSQL](https://www.postgresql.org/) with [SQLAlchemy](https://www.sqlalchemy.org/) ORM
    - [Mistral AI](https://mistral.ai/) (Primary LLM) & [Google Gemini](https://deepmind.google/technologies/gemini/) (Fallback LLM)
    - [spaCy](https://spacy.io/) & [NLTK](https://www.nltk.org/) (Natural Language Processing)
    - [Scikit-learn](https://scikit-learn.org/) (Predictive Analysis & ML)

## 📦 Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 20+
- PostgreSQL instance

---

### Phase 1: Backend Setup
1. **Navigate to backend**: 
   ```bash
   cd backend
   ```
2. **Setup Virtual Environment**:
   ```bash
   python -m venv venv
   source venv/scripts/activate  # On Windows: venv\Scripts\activate
   ```
3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```
4. **Environment Variables**:
   Create a `.env` file in `/backend`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost/talvix
   SECRET_KEY=your_super_secret_key
   MISTRAL_API_KEY=your_mistral_key
   GOOGLE_API_KEY=your_gemini_key
   ```
5. **Start Dev Server**:
   ```bash
   uvicorn app.main:app --reload
   ```

---

### Phase 2: Frontend Setup
1. **Navigate to frontend**:
   ```bash
   cd frontend
   ```
2. **Install Packages**:
   ```bash
   npm install
   ```
3. **Launch Application**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 📈 Database Migrations
The project uses SQLAlchemy for DB management. To initialize the schema:
```bash
python -m app.init_db
```

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

## 🤝 Project Links
- **Repo**: [https://github.com/vamshikrishnasai/Talvix.git](https://github.com/vamshikrishnasai/Talvix.git)
- **Developer**: [Vamshi Krishna Sai](https://github.com/vamshikrishnasai)
