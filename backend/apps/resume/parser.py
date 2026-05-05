import re
import io

LANGUAGES = [
    # General purpose
    "python", "javascript", "typescript", "java", "c", "c++", "c#", "go", "rust",
    "ruby", "php", "swift", "kotlin", "scala", "r", "dart", "lua", "perl",
    "haskell", "erlang", "elixir", "clojure", "f#", "ocaml", "julia", "zig",
    "ada", "fortran", "matlab", "sas", "objective-c", "assembly", "groovy",
    "crystal", "nim", "cobol", "vba",
    # Web / Markup
    "html", "css", "sql", "graphql", "xml", "yaml", "markdown", "sass", "less",
    # Shell / Scripting
    "bash", "shell", "powershell", "zsh",
]
FRAMEWORKS = [
    # Frontend
    "react", "vue", "angular", "next.js", "nuxt", "svelte", "gatsby", "astro", "remix",
    "tailwind", "bootstrap", "material ui", "chakra ui", "ant design",
    "redux", "zustand", "mobx",
    # Backend
    "node.js", "express", "fastify", "nestjs",
    "django", "flask", "fastapi", "celery", "sqlalchemy",
    "spring", "spring boot", "hibernate",
    "laravel", "symfony", "rails", "sinatra",
    "asp.net", "entity framework",
    "gin", "echo", "fiber",
    # Mobile
    "flutter", "react native", "ionic", "swiftui", "jetpack compose",
    # Data / ML
    "numpy", "pandas", "matplotlib", "seaborn", "plotly",
    "scikit-learn", "tensorflow", "pytorch", "keras", "xgboost", "lightgbm",
    "spark", "hadoop", "airflow", "dbt",
    "opencv", "nltk", "spacy", "hugging face", "langchain",
    # APIs
    "rest api", "grpc", "websockets", "oauth2", "jwt", "graphql",
]
TOOLS_CLOUD = [
    # Cloud
    "aws", "azure", "gcp", "heroku", "vercel", "netlify", "railway", "digitalocean", "cloudflare",
    # DevOps
    "docker", "kubernetes", "helm", "terraform", "ansible", "pulumi",
    "jenkins", "github actions", "gitlab ci", "circleci", "argocd",
    "nginx", "apache", "caddy",
    "prometheus", "grafana", "datadog", "sentry",
    "kafka", "rabbitmq", "redis",
    # Databases
    "mysql", "postgresql", "sqlite", "mongodb", "cassandra",
    "dynamodb", "elasticsearch", "neo4j", "influxdb", "firebase", "supabase",
    "oracle", "ms sql server", "mariadb",
    # Tools
    "git", "github", "gitlab", "bitbucket",
    "linux", "ubuntu",
    "figma", "adobe xd", "sketch",
    "jira", "confluence", "notion", "trello",
    "postman", "swagger",
    "webpack", "vite", "babel",
    "jest", "pytest", "cypress", "selenium", "playwright",
    # BI / Data
    "power bi", "tableau", "looker", "excel",
]
SOFT_SKILLS = [
    "communication", "leadership", "teamwork", "problem solving",
    "critical thinking", "time management", "adaptability", "creativity",
    "collaboration", "presentation", "mentoring", "agile", "scrum",
]
EDUCATION_LEVELS = [
    "phd", "doctorate", "masters", "master", "mba", "bachelor",
    "b.tech", "b.e", "b.sc", "diploma", "10th", "12th",
]
JOB_TITLES = [
    "software engineer", "backend engineer", "frontend engineer",
    "full stack engineer", "full stack developer", "data scientist",
    "data engineer", "ml engineer", "devops engineer", "cloud engineer",
    "product manager", "project manager", "ux designer", "ui designer",
    "software developer", "web developer", "mobile developer",
    "ios developer", "android developer", "site reliability engineer",
    "security engineer", "qa engineer", "web development",
    "machine learning engineer", "ai engineer", "data analyst",
    "business analyst", "system administrator", "network engineer",
]

STOPWORDS = {
    "with", "that", "this", "have", "from", "they", "will", "your", "been",
    "more", "also", "into", "than", "then", "when", "where", "which", "their",
    "about", "after", "before", "other", "some", "such", "like", "over",
    "just", "each", "most", "very", "well", "work", "used", "using",
}


def extract_text_from_pdf(file_bytes):
    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception:
        return ""


def extract_text_from_docx(file_bytes):
    try:
        import docx
        doc = docx.Document(io.BytesIO(file_bytes))
        return "\n".join(p.text for p in doc.paragraphs)
    except Exception:
        return ""


def extract_text(file_bytes, filename):
    name = filename.lower()
    if name.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    if name.endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    return file_bytes.decode("utf-8", errors="ignore")


def extract_name(text):
    """
    Try multiple strategies to find the candidate name.
    1. First non-empty line that looks like a proper name (2-4 words, title case)
    2. Line after 'Name:' label
    3. Regex on first 10 lines
    """
    lines = [l.strip() for l in text.split("\n") if l.strip()]

    # Strategy 1 — labelled field
    for line in lines[:20]:
        m = re.match(r"(?:name|full name)\s*[:\-]\s*(.+)", line, re.IGNORECASE)
        if m:
            candidate = m.group(1).strip()
            if 2 <= len(candidate.split()) <= 5:
                return candidate.title()

    # Strategy 2 — first line that is 2-4 title-case words, no digits/special chars
    for line in lines[:8]:
        if re.match(r"^[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+){1,3}$", line):
            return line.strip()

    # Strategy 3 — regex anywhere in first 15 lines
    for line in lines[:15]:
        m = re.search(r"\b([A-Z][a-z]+(?: [A-Z][a-z]+){1,3})\b", line)
        if m and len(m.group(1).split()) >= 2:
            return m.group(1)

    return ""


def extract_email(text):
    m = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    return m.group(0) if m else ""


def extract_phone(text):
    # Match Indian and international formats
    patterns = [
        r"\+91[\s\-]?[6-9]\d{9}",
        r"\b[6-9]\d{9}\b",
        r"\+?[\d][\d\s\-().]{8,17}[\d]",
    ]
    for pat in patterns:
        m = re.search(pat, text)
        if m:
            phone = re.sub(r"[\s\-()]", "", m.group(0))
            if 10 <= len(re.sub(r"\D", "", phone)) <= 15:
                return m.group(0).strip()
    return ""


def extract_projects(text):
    projects = []
    lines = text.split("\n")
    in_project = False
    current = []
    for line in lines:
        l = line.strip()
        if re.search(r"\bproject\b", l, re.IGNORECASE) and len(l) < 60:
            in_project = True
            current = []
        elif in_project:
            if l and len(l) > 20:
                current.append(l)
            elif not l and current:
                projects.append(" ".join(current[:2]))
                current = []
                in_project = False
    if current:
        projects.append(" ".join(current[:2]))
    return projects[:5]


def extract_experience_years(text):
    m = re.search(r"(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)", text, re.IGNORECASE)
    if m:
        return int(m.group(1))
    return 0


def parse_resume(file_bytes, filename):
    text = extract_text(file_bytes, filename)
    lower = text.lower()

    name  = extract_name(text)
    email = extract_email(text)
    phone = extract_phone(text)

    languages  = [s for s in LANGUAGES  if re.search(r'\b' + re.escape(s) + r'\b', lower)]
    frameworks = [s for s in FRAMEWORKS if re.search(r'\b' + re.escape(s) + r'\b', lower)]
    tools      = [s for s in TOOLS_CLOUD if re.search(r'\b' + re.escape(s) + r'\b', lower)]
    soft       = [s for s in SOFT_SKILLS if s in lower]
    titles     = [t for t in JOB_TITLES  if t in lower]

    education = ""
    for level in EDUCATION_LEVELS:
        if level in lower:
            education = level.capitalize()
            break

    skills   = list(dict.fromkeys(languages + frameworks + tools))  # preserve order, dedupe
    projects = extract_projects(text)
    years_exp = extract_experience_years(text)

    words = re.findall(r"\b[a-z]{4,}\b", lower)
    freq = {}
    for w in words:
        if w not in STOPWORDS:
            freq[w] = freq.get(w, 0) + 1
    keywords = [w for w, _ in sorted(freq.items(), key=lambda x: -x[1])[:30]]

    return {
        "raw_text":  text,
        "name":      name,
        "email":     email,
        "phone":     phone,
        "skills":    skills,
        "job_titles": titles,
        "keywords":  keywords,
        "languages": languages,
        "frameworks": frameworks,
        "tools":     tools,
        "soft_skills": soft,
        "education": education,
        "projects":  projects,
        "years_exp": years_exp,
    }
