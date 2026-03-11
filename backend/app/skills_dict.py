SKILL_DICTIONARY = {
    "Programming Languages": ["python", "javascript", "typescript", "java", "c++", "c#", "ruby", "go", "rust", "php", "swift", "kotlin", "scala", "r", "sql"],
    "Frontend": ["react", "next.js", "vue", "angular", "html", "css", "tailwind", "bootstrap", "sass", "less", "redux", "jquery", "material ui"],
    "Backend": ["node.js", "express", "fastapi", "django", "flask", "springboot", "laravel", "ruby on rails", "asp.net", "graphql", "rest api"],
    "Databases": ["postgresql", "mysql", "mongodb", "redis", "elasticsearch", "supabase", "firebase", "cassandra", "dynamodb", "oracle", "sqlite"],
    "Cloud & DevOps": ["aws", "azure", "google cloud", "docker", "kubernetes", "jenkins", "terraform", "ansible", "ci/cd", "github actions", "linux", "git"],
    "Machine Learning & AI": ["scikit-learn", "tensorflow", "pytorch", "keras", "pandas", "numpy", "opencv", "nltk", "spacy", "matplotlib", "seaborn"],
    "Tools & Others": ["jira", "trello", "confluence", "slack", "figma", "postman", "unity", "unreal engine", "excel", "powerpoint"]
}

SKILL_LIST = [skill for sublist in SKILL_DICTIONARY.values() for skill in sublist]
