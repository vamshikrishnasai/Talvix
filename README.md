<p align="left">
  <img src="frontend/public/talvix_logo.png" alt="Talvix Logo" width="120"/>
</p>

<p align="center up">
  <strong>The Intelligence Layer for Modern Career Engineering</strong>
</p>


## 🚀 Vision
Talvix is an AI-native career intelligence ecosystem designed to bridge the gap between academic learning and industry excellence. By integrating real-time market data with advanced LLM-driven diagnostics, Talvix provides a data-backed roadmap for professional growth.

---

## 📢 Marketing Overview
Talvix transforms the career search from a guessing game into a precise, engineering-driven process. 
- **AI-Powered Diagnostics**: Move beyond generic advice with deep-scan resume audits and skill-gap identification.
- **Dynamic Learning Paths**: Automatically generated 4-week roadmaps that evolve with your progress and market shifts.
- **Immersive Simulations**: Realistic, conversational mock interviews using Mistral AI, delivering zero-latency feedback and voice interaction.
- **Market Sentinel**: Real-time tracking of industry trends, salary benchmarks, and economic indicators.

---

## 🏗️ Technical Architecture
Developed with a focus on scalability, performance, and modern UI/UX principles.

### Core Stack
- **Frontend**: Next.js 15+ (App Router, Turbopack) leveraging **Tailwind CSS** for design and **Framer Motion** for premium interactive feedback.
- **Backend**: High-concurrency **FastAPI** (Python 3.10+) utilizing **SQLAlchemy** for ORM and **PostgreSQL** for persistence.
- **AI Services**: Multi-LLM strategy using **Mistral AI** as the primary engine with **Google Gemini** for fallback resilience.
- **Data Intelligence**: Specialized NLP pipelines using **spaCy** and **NLTK** for automated resume parsing and sentiment analysis.

### System Highlights
- **Conversational State Management**: Robust handling of multi-turn AI dialogues for mock interviews.
- **Real-time Analytics**: Dynamic dashboard visualizations powered by **Recharts**.
- **Edge Performance**: Optimized asset delivery and lightning-fast API response times designed for sub-second user interactions.

---

## 👔 Recruiting Perspective
Talvix is a testament to senior-level engineering practices and modern product design.

- **Clean & Scalable Architecture**: Adheres to SOLID principles with a clear separation of concerns between AI services, business logic, and UI components.
- **Modern Dev-Ex**: Built with **TypeScript** for type safety, **ESLint** for code quality, and structured environments for backend and frontend parity.
- **Premium User Experience**: Focus on "micro-interactions" and polished dark-mode aesthetics, comparable to top-tier SaaS products.
- **Advanced AI Integration**: Demonstrates deep understanding of LLM orchestration, prompt engineering, and natural language processing.

---

## 🛠️ Quick Start

### 1. Repository Setup
```bash
git clone https://github.com/vamshikrishnasai/Talvix.git
cd Talvix
```

### 2. Backend Initialization
1.  **Environment**: 
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate # or venv\Scripts\activate
    ```
2.  **Dependencies**:
    ```bash
    pip install -r requirements.txt
    python -m spacy download en_core_web_sm
    ```
3.  **Run**: Configure `.env` and initialize the database via `python -m app.init_db`, then start with:
    ```bash
    uvicorn app.main:app --reload
    ```

### 3. Frontend Initialization
1.  **Node Setup**:
    ```bash
    cd frontend
    npm install
    ```
2.  **Launch**:
    ```bash
    npm run dev
    ```

---

<p align="center">
  <b>Built for the future of work. Powered by intelligence.</b><br/>
  Developed by <a href="https://github.com/vamshikrishnasai">Vamshi Krishna Sai</a>
</p>
