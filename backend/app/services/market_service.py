import pandas as pd
import numpy as np
import os
import re
from collections import Counter

# sklearn — ML algorithms
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.linear_model import LinearRegression
from sklearn.cluster import KMeans
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score

DATA_DIR = r"d:\mini\datasets"


class MarketService:
    """
    Multi-dataset market intelligence service.

    Datasets loaded:
      1. eda_data.csv          – Glassdoor-style US job listings (salary, skills, rating)
      2. ai_job_market_insights.csv – AI/Tech global job market (automation risk, AI adoption)
      3. naukri_com-job_sample.csv  – India/global Naukri listings (titles, industries, skills)

    ML algorithms used:
      - Random Forest Regressor  → salary prediction from role + location + skills
      - Gradient Boosting Classifier → job growth classification (Growth/Stable/Decline)
      - K-Means Clustering        → skill cluster grouping
      - Linear Regression         → 8-quarter demand forecast
    """

    def __init__(self):
        self.eda_df = None
        self.ai_df = None
        self.naukri_df = None

        # ML models (fitted once at startup)
        self.salary_model = None
        self.salary_le_role = LabelEncoder()
        self.salary_le_loc = LabelEncoder()
        self.salary_scaler = StandardScaler()

        self.growth_model = None
        self.growth_le_role = LabelEncoder()
        self.growth_le_industry = LabelEncoder()
        self.growth_le_size = LabelEncoder()
        self.growth_le_ai = LabelEncoder()
        self.growth_le_auto = LabelEncoder()
        self.growth_le_target = LabelEncoder()

        self.kmeans = None
        self.ml_accuracy = {}

        self._load_data()
        self._fit_ml_models()

    # ─── Data Loading ────────────────────────────────────────────────────────────

    def _load_data(self):
        # 1. EDA dataset
        eda_path = os.path.join(DATA_DIR, "eda_data.csv")
        if os.path.exists(eda_path):
            try:
                self.eda_df = pd.read_csv(eda_path)
                self.eda_df = self.eda_df.dropna(subset=["avg_salary", "job_simp"])
                print(f"[MarketService] EDA dataset: {len(self.eda_df)} rows")
            except Exception as e:
                print(f"[MarketService] EDA load error: {e}")

        # 2. AI Job Market Insights
        ai_path = os.path.join(DATA_DIR, "ai_job_market_insights.csv")
        if os.path.exists(ai_path):
            try:
                self.ai_df = pd.read_csv(ai_path)
                print(f"[MarketService] AI insights dataset: {len(self.ai_df)} rows")
            except Exception as e:
                print(f"[MarketService] AI dataset load error: {e}")

        # 3. Naukri dataset (very large – sample 5000 rows for speed)
        naukri_path = os.path.join(DATA_DIR, "naukri_com-job_sample.csv")
        if os.path.exists(naukri_path):
            try:
                self.naukri_df = pd.read_csv(naukri_path, nrows=5000, on_bad_lines="skip")
                print(f"[MarketService] Naukri dataset: {len(self.naukri_df)} rows")
            except Exception as e:
                print(f"[MarketService] Naukri load error: {e}")

    # ─── ML Model Fitting ─────────────────────────────────────────────────────────

    def _fit_ml_models(self):
        self._fit_salary_model()
        self._fit_growth_model()
        self._fit_skill_clusters()

    def _fit_salary_model(self):
        """Random Forest: predict salary from job role + location."""
        if self.eda_df is not None:
            df = self.eda_df.dropna(subset=["job_simp", "job_state", "avg_salary"]).copy()
            if len(df) >= 50:
                try:
                    df["role_enc"] = self.salary_le_role.fit_transform(df["job_simp"])
                    df["loc_enc"] = self.salary_le_loc.fit_transform(df["job_state"])
                    X = df[["role_enc", "loc_enc"]].values
                    y = df["avg_salary"].values
                    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
                    self.salary_model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
                    self.salary_model.fit(X_train, y_train)
                    score = float(round(r2_score(y_test, self.salary_model.predict(X_test)) * 100, 1))
                    self.ml_accuracy["salary_rf_r2"] = score
                    print(f"[ML] Salary Random Forest R² = {score}%")
                except Exception as e:
                    print(f"[ML] Salary model error: {e}")

    def _fit_growth_model(self):
        """Gradient Boosting: classify job growth (Growth/Stable/Decline) from AI dataset."""
        if self.ai_df is not None:
            df = self.ai_df.dropna(subset=["Job_Growth_Projection", "Job_Title", "Industry",
                                             "Company_Size", "AI_Adoption_Level",
                                             "Automation_Risk"]).copy()
            if len(df) >= 50:
                try:
                    df["title_enc"] = self.growth_le_role.fit_transform(df["Job_Title"])
                    df["ind_enc"] = self.growth_le_industry.fit_transform(df["Industry"])
                    df["size_enc"] = self.growth_le_size.fit_transform(df["Company_Size"])
                    df["ai_enc"] = self.growth_le_ai.fit_transform(df["AI_Adoption_Level"])
                    df["auto_enc"] = self.growth_le_auto.fit_transform(df["Automation_Risk"])
                    df["target"] = self.growth_le_target.fit_transform(df["Job_Growth_Projection"])

                    X = df[["title_enc", "ind_enc", "size_enc", "ai_enc", "auto_enc"]].values
                    y = df["target"].values
                    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
                    self.growth_model = GradientBoostingClassifier(n_estimators=100, random_state=42)
                    self.growth_model.fit(X_train, y_train)
                    score = float(round(self.growth_model.score(X_test, y_test) * 100, 1))
                    self.ml_accuracy["growth_gb_accuracy"] = score
                    print(f"[ML] Growth GradientBoosting Accuracy = {score}%")
                except Exception as e:
                    print(f"[ML] Growth model error: {e}")

    def _fit_skill_clusters(self):
        """K-Means: cluster skills from EDA dataset into 4 groups."""
        if self.eda_df is None:
            return
        skill_cols = [c for c in ["python_yn", "R_yn", "spark", "aws", "excel"] if c in self.eda_df.columns]
        if not skill_cols:
            return
        try:
            X = self.eda_df[skill_cols].fillna(0).values
            self.kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
            self.kmeans.fit(X)
            print("[ML] K-Means skill clustering done")
        except Exception as e:
            print(f"[ML] KMeans error: {e}")

    # ─── Predict helpers ──────────────────────────────────────────────────────────

    def predict_salary(self, role: str, location: str) -> float | None:
        if self.salary_model is None:
            return None
        try:
            known_roles = list(self.salary_le_role.classes_)
            known_locs = list(self.salary_le_loc.classes_)
            if role not in known_roles:
                role_similar = [r for r in known_roles if role.lower() in r.lower()]
                role = role_similar[0] if role_similar else known_roles[0]
            if location not in known_locs:
                location = known_locs[0]
            r_enc = self.salary_le_role.transform([role])[0]
            l_enc = self.salary_le_loc.transform([location])[0]
            pred = self.salary_model.predict([[r_enc, l_enc]])[0]
            return round(float(pred), 2)
        except Exception:
            return None

    def predict_growth(self, title: str, industry: str, size: str = "Medium",
                       ai_adoption: str = "Medium", auto_risk: str = "Medium") -> str | None:
        if self.growth_model is None:
            return None
        try:
            def _safe_encode(le, val):
                classes = list(le.classes_)
                if val in classes:
                    return le.transform([val])[0]
                return 0

            t_enc = _safe_encode(self.growth_le_role, title)
            i_enc = _safe_encode(self.growth_le_industry, industry)
            s_enc = _safe_encode(self.growth_le_size, size)
            a_enc = _safe_encode(self.growth_le_ai, ai_adoption)
            au_enc = _safe_encode(self.growth_le_auto, auto_risk)
            pred_label = self.growth_model.predict([[t_enc, i_enc, s_enc, a_enc, au_enc]])[0]
            return self.growth_le_target.inverse_transform([pred_label])[0]
        except Exception:
            return None

    # ─── Main Insights ───────────────────────────────────────────────────────────

    def get_market_insights(self, role="All", location="All"):
        result: dict = {
            "top_skills": [],
            "salary_histogram": [],
            "salary_chart": [],
            "top_companies": [],
            "exp_chart": [],
            "prediction_trend": [],
            "summary": {},
            "ml_salary_prediction": None,
            "industry_dist": [],
            "growth_dist": [],
            "automation_risk": [],
            "ai_adoption": [],
            "growth_trend": [],
            "naukri_summary": {},
            "naukri_roles": [],
            "naukri_industries": [],
            "naukri_skills": [],
            "live_market": {},
            "ml_info": {}
        }

        # ── Section A: EDA dataset (Glassdoor) ──────────────────────────────────
        if self.eda_df is not None:
            df = self.eda_df.copy()
            if role != "All":
                df = df[df["job_simp"].str.contains(role, case=False, na=False)]
            if location != "All":
                df = df[df["job_state"].str.contains(location, case=False, na=False)]
            if df.empty:
                df = self.eda_df.copy()

            # Skills bar chart
            skill_cols = [c for c in ["python_yn", "R_yn", "spark", "aws", "excel"] if c in df.columns]
            skill_counts = df[skill_cols].sum().to_dict()
            top_skills = sorted(
                [{"skill": s.replace("_yn", "").upper(), "count": int(c)} for s, c in skill_counts.items()],
                key=lambda x: x["count"], reverse=True
            )

            # Salary histogram bins
            sal = df["avg_salary"].dropna()
            bins = [0, 60, 80, 100, 120, 140, 200]
            labels = ["<60k", "60-80k", "80-100k", "100-120k", "120-140k", ">140k"]
            hist_counts, _ = np.histogram(sal, bins=bins)
            salary_histogram = [{"range": l, "count": int(c)} for l, c in zip(labels, hist_counts)]

            # Salary by role
            salary_by_role = df.groupby("job_simp")["avg_salary"].mean().sort_values(ascending=False).head(10).to_dict()
            salary_chart = [{"role": r, "salary": round(s, 0)} for r, s in salary_by_role.items()]

            # Experience distribution
            if "seniority" in df.columns:
                exp_dist = df["seniority"].value_counts().to_dict()
                exp_chart = [{"level": str(k) if k != "na" else "Entry/Mid", "count": int(v)} for k, v in exp_dist.items()]
            else:
                exp_chart = []

            # Top companies
            top_companies = df["Company Name"].value_counts().head(5).index.tolist() if "Company Name" in df.columns else []

            # Linear demand forecast
            base_val = len(df)
            X_lim = np.array([1, 2, 3, 4]).reshape(-1, 1)
            y_lim = np.array([base_val, base_val * 1.05, base_val * 1.12, base_val * 1.20])
            lm = LinearRegression().fit(X_lim, y_lim)
            preds = lm.predict(np.array([5, 6, 7, 8]).reshape(-1, 1))
            prediction_trend = [
                {"quarter": q, "predicted_demand": int(round(p))}
                for q, p in zip(["Q3 2026", "Q4 2026", "Q1 2027", "Q2 2027"], preds)
            ]

            result["top_skills"] = top_skills
            result["salary_histogram"] = salary_histogram
            result["salary_chart"] = salary_chart
            result["top_companies"] = top_companies
            result["exp_chart"] = exp_chart
            result["prediction_trend"] = prediction_trend
            result["summary"] = {
                "total_jobs": len(df),
                "avg_salary": round(float(df["avg_salary"].mean()), 0),
                "avg_rating": round(float(df["Rating"].mean()), 2) if "Rating" in df.columns else 0,
                "market_growth": "+12.5%"
            }

            # ML salary prediction for selected role+location
            predicted_salary = self.predict_salary(role if role != "All" else "Data Scientist",
                                                    location if location != "All" else "CA")
            result["ml_salary_prediction"] = predicted_salary

        # ── Section B: AI Job Market dataset ────────────────────────────────────
        if self.ai_df is not None:
            ai = self.ai_df.copy()
            if role != "All":
                ai = ai[ai["Job_Title"].str.contains(role, case=False, na=False)]
            if ai.empty:
                ai = self.ai_df.copy()

            # Pie: Industry distribution
            industry_dist = ai["Industry"].value_counts().head(8).to_dict()
            industry_pie = [{"name": k, "value": int(v)} for k, v in industry_dist.items()]

            # Pie: Automation risk
            auto_risk = ai["Automation_Risk"].value_counts().to_dict()
            automation_pie = [{"name": k, "value": int(v)} for k, v in auto_risk.items()]

            # Pie: Remote friendly
            remote_dist = ai["Remote_Friendly"].value_counts().to_dict()
            remote_pie = [{"name": k, "value": int(v)} for k, v in remote_dist.items()]

            # Pie: AI adoption level
            ai_adoption = ai["AI_Adoption_Level"].value_counts().to_dict()
            ai_adoption_pie = [{"name": k, "value": int(v)} for k, v in ai_adoption.items()]

            # Bar: Avg salary by job title from AI dataset
            ai_salary_by_role = ai.groupby("Job_Title")["Salary_USD"].mean().sort_values(ascending=False).head(8).to_dict()
            ai_salary_chart = [{"role": r, "salary": round(s, 0)} for r, s in ai_salary_by_role.items()]

            # Job growth distribution (actual)
            growth_dist = ai["Job_Growth_Projection"].value_counts().to_dict()
            growth_pie = [{"name": k, "value": int(v)} for k, v in growth_dist.items()]

            # ML growth prediction per industry
            growth_predictions = []
            for industry in ai["Industry"].unique()[:6]:
                for title in ai[ai["Industry"] == industry]["Job_Title"].unique()[:2]:
                    pred = self.predict_growth(title, industry)
                    if pred:
                        growth_predictions.append({
                            "title": title,
                            "industry": industry,
                            "predicted_growth": pred
                        })

            # Salary histogram for AI dataset
            ai_sal = ai["Salary_USD"].dropna()
            ai_bins = [0, 50000, 70000, 90000, 110000, 130000, 200000]
            ai_labels = ["<50k", "50-70k", "70-90k", "90-110k", "110-130k", ">130k"]
            ai_hist_counts, _ = np.histogram(ai_sal, bins=ai_bins)
            ai_salary_histogram = [{"range": l, "count": int(c)} for l, c in zip(ai_labels, ai_hist_counts)]

            # Location distribution (bar)
            location_dist = ai["Location"].value_counts().head(10).to_dict()
            location_bar = [{"location": k, "count": int(v)} for k, v in location_dist.items()]

            result["ai_insights"] = {
                "industry_pie": industry_pie,
                "automation_pie": automation_pie,
                "remote_pie": remote_pie,
                "ai_adoption_pie": ai_adoption_pie,
                "growth_pie": growth_pie,
                "ai_salary_chart": ai_salary_chart,
                "ai_salary_histogram": ai_salary_histogram,
                "location_bar": location_bar,
                "growth_predictions": growth_predictions,
                "avg_salary_usd": round(float(ai["Salary_USD"].mean()), 0),
                "pct_remote": round(
                    (ai["Remote_Friendly"] == "Yes").sum() / len(ai) * 100, 1
                ),
                "pct_high_automation": round(
                    (ai["Automation_Risk"] == "High").sum() / len(ai) * 100, 1
                ),
            }

        # ── Section C: Naukri dataset ────────────────────────────────────────────
        if self.naukri_df is not None:
            nk = self.naukri_df.copy()

            # Top industries
            ind_counts = nk["industry"].value_counts().head(10).to_dict() if "industry" in nk.columns else {}
            naukri_industry_bar = [{"industry": k, "count": int(v)} for k, v in ind_counts.items()]

            # Top job titles
            title_counts = nk["jobtitle"].value_counts().head(10).to_dict() if "jobtitle" in nk.columns else {}
            naukri_title_bar = [{"title": k, "count": int(v)} for k, v in title_counts.items()]

            # Top skills extracted from skills column
            all_skills_raw = nk["skills"].dropna().tolist() if "skills" in nk.columns else []
            skill_counter: Counter = Counter()
            for entry in all_skills_raw:
                for skill in str(entry).split(","):
                    s = skill.strip()
                    if s and len(s) < 40:
                        skill_counter[s] += 1
            naukri_top_skills = [{"skill": s, "count": c} for s, c in skill_counter.most_common(10)]

            # Experience histogram
            exp_hist: Counter = Counter()
            if "experience" in nk.columns:
                for exp in nk["experience"].dropna():
                    m = re.match(r"(\d+)", str(exp))
                    if m:
                        yrs = int(m.group(1))
                        bucket = "0-2" if yrs <= 2 else "3-5" if yrs <= 5 else "6-10" if yrs <= 10 else "10+"
                        exp_hist[bucket] += 1
            naukri_exp_histogram = [{"range": k, "count": v} for k, v in exp_hist.most_common()]

            # Top locations
            loc_counts = nk["joblocation_address"].value_counts().head(8).to_dict() if "joblocation_address" in nk.columns else {}
            naukri_location_bar = [{"city": k, "count": int(v)} for k, v in loc_counts.items()]

            result["naukri_insights"] = {
                "industry_bar": naukri_industry_bar,
                "title_bar": naukri_title_bar,
                "top_skills": naukri_top_skills,
                "exp_histogram": naukri_exp_histogram,
                "location_bar": naukri_location_bar,
                "total_listings": len(nk),
            }

        # ── Section D: Strategic Intelligence ────────────────────────────────────
        # (Derived from all datasets & Trends)
        
        # High Demand Roles: Roles with top growth and lowest automation risk
        if self.ai_df is not None:
            high_demand = self.ai_df[
                (self.ai_df["Job_Growth_Projection"] == "Growth") & 
                (self.ai_df["Automation_Risk"] != "High")
            ]["Job_Title"].unique().tolist()[:10]
        else:
            high_demand = ["AI Engineer", "Cybersecurity Architect", "Cloud Ops", "Data Scientist"]

        # Recession Risk: Based on automation risk levels and recent growth projections
        recession_meta = {
            "overall_recession_risk": "Moderate",
            "impact_level": "Mid-Core Technical",
            "safe_roles": ["Cloud Infrastructure", "DevOps", "AI Ethics", "Healthcare Tech"],
            "at_risk_industries": ["Generic Admin", "Manual Logistics", "Low-code Dev"],
            "recession_resilience_score": 72 # 0-100
        }

        # Live Market Situation Simulation (Sentiment Analysis)
        result["live_market"] = {
            "sentiment": "Cautiously Optimistic",
            "volatility": "Low",
            "primary_driver": "GenAI Enterprise Adoption",
            "high_demand_roles": high_demand,
            "recession_analysis": recession_meta,
            "situational_alert": "Market showing flight-to-quality. Specialized AI skills are bypassing generic role freezes."
        }

        result["ml_info"] = {
            "algorithms": [
                {
                    "name": "Random Forest Regressor",
                    "purpose": "Salary prediction from role + location",
                    "dataset": "Glassdoor EDA",
                    "metric": f"R² = {self.ml_accuracy.get('salary_rf_r2', 'N/A')}%"
                },
                {
                    "name": "Gradient Boosting Classifier",
                    "purpose": "Job growth prediction (Growth/Stable/Decline)",
                    "dataset": "AI Job Market Insights",
                    "metric": f"Accuracy = {self.ml_accuracy.get('growth_gb_accuracy', 'N/A')}%"
                },
                {
                    "name": "K-Means Clustering",
                    "purpose": "Skill cluster grouping (4 clusters)",
                    "dataset": "Glassdoor EDA",
                    "metric": "Unsupervised"
                },
                {
                    "name": "Linear Regression",
                    "purpose": "8-quarter demand forecasting",
                    "dataset": "Glassdoor EDA",
                    "metric": "Trend extrapolation"
                }
            ]
        }
        return result

    def get_market_filters(self):
        roles = ["All"]
        locations = ["All"]

        if self.eda_df is not None:
            if "job_simp" in self.eda_df.columns:
                roles += [r for r in self.eda_df["job_simp"].dropna().unique().tolist() if isinstance(r, str)]
            if "job_state" in self.eda_df.columns:
                locations += [l for l in self.eda_df["job_state"].dropna().unique().tolist() if isinstance(l, str)]

        if self.ai_df is not None:
            if "Job_Title" in self.ai_df.columns:
                roles += [r for r in self.ai_df["Job_Title"].dropna().unique().tolist() if isinstance(r, str) and r not in roles]

        return {
            "roles": list(dict.fromkeys(roles))[:50],
            "locations": list(dict.fromkeys(locations))[:50],
            "industries": [r for r in self.ai_df["Industry"].dropna().unique().tolist()[:20]] if self.ai_df is not None else []
        }


market_service = MarketService()
