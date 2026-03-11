import os
from google import genai
from dotenv import load_dotenv
import json
import re
import asyncio

import hashlib

load_dotenv(override=True)

CACHE_FILE = "ai_response_cache.json"

class AIService:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        self.cache = self._load_cache()
        if api_key:
            self.client = genai.Client(api_key=api_key)
            self.model_id = 'gemini-2.5-flash'
            self.is_active = True
            print(f"INFO: AIService initialized with GOOGLE_API_KEY using {self.model_id}")
        else:
            self.is_active = False
            self.client = None
            print("WARNING: AIService initialized without GOOGLE_API_KEY. AI features will be disabled.")

    def _load_cache(self):
        try:
            if os.path.exists(CACHE_FILE):
                with open(CACHE_FILE, 'r') as f:
                    return json.load(f)
        except Exception as e:
            print(f"CACHE_LOAD_ERROR: {e}")
        return {}

    def _save_cache(self):
        try:
            with open(CACHE_FILE, 'w') as f:
                json.dump(self.cache, f)
        except Exception as e:
            print(f"CACHE_SAVE_ERROR: {e}")

    def _get_cache_key(self, prompt: str):
        return hashlib.md5(prompt.encode()).hexdigest()

    def _parse_json(self, text: str):
        try:
            if not text: return None
            cleaned = text.strip()
            # Handle markdown code blocks
            if "```json" in cleaned:
                cleaned = cleaned.split("```json")[-1].split("```")[0]
            elif "```" in cleaned:
                cleaned = cleaned.split("```")[-1].split("```")[0]
            cleaned = cleaned.strip()

            # Find the actual JSON structure
            start_arr = cleaned.find('[')
            start_obj = cleaned.find('{')
            
            if start_arr == -1 and start_obj == -1:
                return None

            if start_arr != -1 and (start_obj == -1 or start_arr < start_obj):
                end_arr = cleaned.rfind(']') + 1
                return json.loads(cleaned[start_arr:end_arr])
            else:
                end_obj = cleaned.rfind('}') + 1
                return json.loads(cleaned[start_obj:end_obj])
        except Exception as e:
            print(f"CRITICAL: AI JSON Parse Failure. Error: {e}")
            print(f"Raw text that failed: {text[:200]}...")
            return None

    async def _generate_content_async(self, prompt: str):
        if not self.is_active: return None
        
        cache_key = self._get_cache_key(prompt)
        if cache_key in self.cache:
            # print(f"DEBUG: Cache hit for prompt hash {cache_key}")
            return self.cache[cache_key]

        max_retries = 3
        base_delay = 5 # seconds

        for attempt in range(max_retries):
            try:
                response = await self.client.aio.models.generate_content(
                    model=self.model_id,
                    contents=prompt
                )
                
                # Save to cache
                self.cache[cache_key] = response.text
                self._save_cache()
                return response.text
                
            except Exception as e:
                err_str = str(e)
                if "429" in err_str:
                    print(f"WARNING: Quota exceeded (Attempt {attempt+1}/{max_retries}). Retrying in {base_delay}s...")
                    await asyncio.sleep(base_delay)
                    base_delay *= 2 # Exponential backoff
                else:
                    print(f"AI_GENERATE_ERROR: {e}")
                    return None
        
        print("CRITICAL: AI failure after multiple retries.")
        return None

    async def generate_portfolio_content(self, skills, role):
        if not self.is_active: return {"bio": "Exploring tech.", "projects": []}
        prompt = f"Create a professional bio and 3 project ideas for a {role} skilled in {', '.join(skills)}. Use simple English. Return JSON: {{'bio': 'string', 'projects': [{{'title': 'string', 'description': 'string', 'tech_stack': ['string']}}]}}"
        text = await self._generate_content_async(prompt)
        data = self._parse_json(text)
        return data if data else {"bio": "Professional in training.", "projects": []}

    async def analyze_jd_synergy(self, resume_text, jd_text):
        if not self.is_active: return {"match_percentage": 60, "missing_skills": ["Cloud"], "recommendations": ["Learn cloud"]}
        prompt = f"""Compare Resume and JD. 
        Resume: {resume_text[:3000]} 
        JD: {jd_text[:3000]}
        
        Use simple English.
        Analyze:
        1. 'match_percentage': float (0-100)
        2. 'present_skills': list of skills found in both
        3. 'missing_skills': list of skills required by JD but missing in Resume
        4. 'suggestions': exact things to add to resume to improve match
        
        Return JSON ONLY: {{
            'match_percentage': float, 
            'present_skills': ['str'],
            'missing_skills': ['str'], 
            'suggestions': ['str']
        }}"""
        text = await self._generate_content_async(prompt)
        data = self._parse_json(text)
        return data if data else {"match_percentage": 50, "missing_skills": [], "present_skills": [], "suggestions": []}

    async def generate_roadmap_dynamic(self, role, company, user_score, prep_duration_weeks, skills=[], gaps=[], user_type=None, interests=[]):
        if not self.is_active: return []
        
        skills_str = ", ".join(skills) if skills else "General Engineering"
        gaps_str = ", ".join(gaps) if gaps else "None specifically identified"
        
        if user_type == "STUDENT" and interests:
            interest_focus = ", ".join(interests)
            prompt = f"""Create a beginner-friendly {prep_duration_weeks}-week roadmap for a Student interested in {interest_focus}.
            Focus on fundamental concepts, beginner projects, and learning resources from W3Schools, GeeksForGeeks, and YouTube.
            Current Knowledge: {user_score}/100.
            Return exactly 5 milestones as a JSON list.
            Each milestone MUST include:
            1. 'title': Catchy technical title for the week/milestone
            2. 'description': Concise overview of what will be mastered (1-2 sentences)
            3. 'resource_links': A list of 2-3 genuine, high-quality learning resources (Real names and clickable URLs).
               Format: {{'title': 'Exact Resource Name', 'url': 'https://...', 'type': 'Video|Article|Docs'}}.
            Use simple, motivating English.
            Return JSON list of objects ONLY."""
        else:
            is_general = role == "General Hiring Hub"
            target_entity = "General Recruitment Preparation" if is_general else f"aspirant for {company}"
            prompt = f"""Create a highly professional {prep_duration_weeks}-week technical roadmap for a {role} ({target_entity}).
            
            {'Focus on Core Engineering fundamentals: DSA, System Design basics, and Web/App Development foundations.' if is_general else 'Focus on bridging identified skill gaps and specific professional toolsets for the role.'}
            
            Candidate's Strengths: {skills_str}
            Identified Skill Gaps: {gaps_str}
            Current Score: {user_score}/100.
            
            Return exactly 5 technical milestones as a JSON list.
            Each milestone MUST include:
            1. 'title': Catchy technical title for the week/milestone
            2. 'description': Concise overview of what will be mastered (1-2 sentences)
            3. 'resource_links': A list of 2-3 genuine, high-quality learning resources (Real names and clickable URLs).
               Format: {{'title': 'Exact Resource Name', 'url': 'https://...', 'type': 'Video|Article|Docs|Practice'}}.
            Use simple, motivating English.
            Return JSON list of objects ONLY."""
        
        text = await self._generate_content_async(prompt)
        data = self._parse_json(text)
        return data if isinstance(data, list) else []

    async def chat_with_mentor(self, query, context):
        if not self.is_active: return "Mentor is offline."
        prompt = f"Role: Talvix AI Coach. Context: {context}. User Query: {query}. Provide concise, motivating advice using simple English."
        try:
            response = await self.client.aio.models.generate_content(
                model=self.model_id,
                contents=prompt
            )
            return response.text
        except Exception as e:
            print(f"AI_CHAT_ERROR: {e}")
            return "I'm here to help, but I'm having trouble connecting right now. Let's try again in a moment."

    async def generate_simulation_questions(self, company, role, difficulty="Mixed"):
        if not self.is_active: return []
        prompt = f"Generate 5 interview questions for {role} at {company}. Difficulty: {difficulty}. Use simple English. Return JSON list: [{{'id': int, 'question': 'string', 'difficulty': 'string'}}]"
        text = await self._generate_content_async(prompt)
        data = self._parse_json(text)
        return data if isinstance(data, list) else []

    async def evaluate_simulation(self, questions_with_answers):
        if not self.is_active: return {}
        prompt = f"Evaluate these interview answers: {json.dumps(questions_with_answers)}. Use simple English. Return JSON with 'responses' (list of {{id, score, feedback}}), 'overall_score', and 'readiness_report'."
        text = await self._generate_content_async(prompt)
        return self._parse_json(text) if text else {}

    async def get_company_insights(self, company_name: str, target_role: str = "Software Developer"):
        if not self.is_active: return {}
        prompt = f"""Search for and provide deep intelligence about {company_name} for a {target_role} applicant.
        Focus on real-world data and recent news.
        Use simple English only.
        Include:
        1. 'name': official company name
        2. 'established': exact year of establishment
        3. 'type': Product or Service based
        4. 'summary': Exactly four clear, simple sentences describing their market position and culture.
        5. 'projects': List of 4 major projects, products, or services they are famous for.
        6. 'headlines': List of exactly 4 major news headlines from TODAY or the last 24 hours regarding {company_name}.
        7. 'salary': Realistic average yearly salary for {target_role} at {company_name}.
        Return JSON ONLY: {{
            'name': 'str',
            'established': 'str',
            'type': 'str',
            'summary': ['str'],
            'projects': ['str'],
            'headlines': ['str'],
            'salary': 'str'
        }}"""
        text = await self._generate_content_async(prompt)
        data = self._parse_json(text)
        return data if data else {}

    async def analyze_resume_deep(self, resume_text, target_role="Software Developer"):
        if not self.is_active: return {}
        print(f"DEBUG: Deep Analysis started for role: {target_role}")
        prompt = f"""Review this resume for a {target_role} role. 
        Perform deep ATS Analysis. Use simple English.
        Return JSON ONLY: {{
            'ats_score': float, 
            'ready_level': 'Low|Medium|High',
            'extracted_skills': ['str'], 
            'missing_skills': ['str'], 
            'experience': [{{'role': 'str', 'company': 'str', 'years': 'str', 'desc': 'str'}}],
            'education': [{{'degree': 'str', 'school': 'str', 'year': 'str'}}],
            'projects': [{{'title': 'str', 'desc': 'str'}}],
            'recommendations': 'string'
        }}
        Resume: {resume_text[:4000]}"""
        text = await self._generate_content_async(prompt)
        if not text:
            return {
                "ats_score": 50,
                "ready_level": "Medium",
                "extracted_skills": ["Reviewing..."],
                "missing_skills": ["Quota hit - analyze later"],
                "experience": [{"role": "Candidate", "company": "Global Market", "years": "2024", "desc": "Skills are being verified by Gemini AI."}],
                "projects": [{"title": "Mission Portfolio", "desc": "Project intelligence is being synthesized."}],
                "recommendations": "Gemini Quota Limited. Try again soon."
            }
        data = self._parse_json(text)
        if data and 'recommendations' not in data and 'suggestions' in data:
            data['recommendations'] = ". ".join(data['suggestions']) if isinstance(data['suggestions'], list) else str(data['suggestions'])
        return data if data else {}

    async def generate_resume_skill_test(self, skills_list):
        if not self.is_active: return []
        prompt = f"""Generate exactly 20 advanced, scenario-based technical multiple choice questions for a candidate with these skills: {', '.join(skills_list)}.
        Format: JSON list of 20 objects. {{'question': 'str', 'options': ['str', 'str', 'str', 'str'], 'correct_answer_index': int}}"""
        text = await self._generate_content_async(prompt)
        data = self._parse_json(text)
        return data if isinstance(data, list) else []

    async def generate_quiz(self, topic, context=""):
        if not self.is_active: return []
        prompt = f"""Generate exactly 15 high-quality scenario-based multiple choice questions for topic: {topic}. 
        Context: {context}.
        Return JSON: [{{'question': 'str', 'options': ['str', 'str', 'str', 'str'], 'correct_answer_index': int}}]"""
        text = await self._generate_content_async(prompt)
        data = self._parse_json(text)
        return data if isinstance(data, list) else []

    async def generate_survey_questions(self, user_type):
        if not self.is_active: return []
        prompt = f"Generate 5 simple survey questions for a {user_type} to assess their career goals. Return JSON list: [{{'id': int, 'question': 'str', 'choices': []}}]"
        text = await self._generate_content_async(prompt)
        data = self._parse_json(text)
        return data if isinstance(data, list) else [
            {"id": 1, "question": f"What is your primary goal as a {user_type.lower()}?", "choices": ["Secure a Top-tier Job", "Skill Mastery", "Research"]},
            {"id": 2, "question": "What domain interests you most?", "choices": ["Web/App Dev", "AI/ML", "Data Science"]}
        ]

    async def analyze_performance_summary(self, user_stats):
        if not self.is_active: return {}
        prompt = f"Review stats: {json.dumps(user_stats)}. Return JSON: {{'readiness_score': int, 'strengths': [], 'weaknesses': [], 'tip': 'str'}}"
        text = await self._generate_content_async(prompt)
        return self._parse_json(text) if text else {}

    async def generate_learning_resources(self, role, knowledge_score):
        if not self.is_active: return []
        prompt = f"Provide 6 professional resources for {role} (Score: {knowledge_score}/100). Return JSON list: [{{'title': 'str', 'type': 'str', 'url': 'str', 'description': 'str'}}]"
        text = await self._generate_content_async(prompt)
        data = self._parse_json(text)
        return data if isinstance(data, list) else []

    async def generate_company_pyqs(self, company, role):
        if not self.is_active: return []
        prompt = f"Generate 10 PYQs for {role} at {company}. Return JSON list: [{{'question': 'str', 'topic': 'str', 'difficulty': 'str'}}]"
        text = await self._generate_content_async(prompt)
        data = self._parse_json(text)
        return data if isinstance(data, list) else []

    async def get_coach_strategic_insights(self, role, company, skills, gaps):
        if not self.is_active: return {}
        prompt = f"AI Coach insights for {role} at {company}. Skills: {skills}. Gaps: {gaps}. Return JSON: {{'skill_recommendations': [], 'suggestions': [], 'interview_tips': [], 'today_focus': 'str', 'hr_questions': []}}"
        text = await self._generate_content_async(prompt)
        return self._parse_json(text) if text else {}

    async def predict_interview_rounds(self, company, role):
        if not self.is_active: return []
        prompt = f"Predict interview rounds for {role} at {company}. Return JSON list of strings."
        text = await self._generate_content_async(prompt)
        data = self._parse_json(text)
        return data if isinstance(data, list) else []

    async def generate_round_intel(self, role, company, round_name):
        if not self.is_active: return {}
        prompt = f"Prep material for '{round_name}' round at {company} for {role}. Return JSON: {{'focus_topics': [], 'expected_questions': [], 'resources': []}}"
        text = await self._generate_content_async(prompt)
        return self._parse_json(text) if text else {}

ai_service = AIService()
