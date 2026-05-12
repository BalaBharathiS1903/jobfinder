import re
import io

LANGUAGES = [
    "python", "javascript", "typescript", "java", "c", "c++", "c#", "go", "rust",
    "ruby", "php", "swift", "kotlin", "scala", "r", "dart", "lua", "perl",
    "haskell", "erlang", "elixir", "clojure", "f#", "ocaml", "julia", "zig",
    "ada", "fortran", "matlab", "sas", "objective-c", "assembly", "groovy",
    "crystal", "nim", "cobol", "vba",
    "html", "css", "sql", "graphql", "xml", "yaml", "markdown", "sass", "less",
    "bash", "shell", "powershell", "zsh",
]
FRAMEWORKS = [
    "react", "vue", "angular", "next.js", "nuxt", "svelte", "gatsby", "astro", "remix",
    "tailwind", "bootstrap", "material ui", "chakra ui", "ant design",
    "redux", "zustand", "mobx",
    "node.js", "express", "fastify", "nestjs",
    "django", "flask", "fastapi", "celery", "sqlalchemy",
    "spring", "spring boot", "hibernate",
    "laravel", "symfony", "rails", "sinatra",
    "asp.net", "entity framework",
    "gin", "echo", "fiber",
    "flutter", "react native", "ionic", "swiftui", "jetpack compose",
    "numpy", "pandas", "matplotlib", "seaborn", "plotly",
    "scikit-learn", "tensorflow", "pytorch", "keras", "xgboost", "lightgbm",
    "spark", "hadoop", "airflow", "dbt",
    "opencv", "nltk", "spacy", "hugging face", "langchain",
    "rest api", "grpc", "websockets", "oauth2", "jwt", "graphql",
]
TOOLS_CLOUD = [
    "aws", "azure", "gcp", "heroku", "vercel", "netlify", "railway", "digitalocean", "cloudflare",
    "docker", "kubernetes", "helm", "terraform", "ansible", "pulumi",
    "jenkins", "github actions", "gitlab ci", "circleci", "argocd",
    "nginx", "apache", "caddy",
    "prometheus", "grafana", "datadog", "sentry",
    "kafka", "rabbitmq", "redis",
    "mysql", "postgresql", "sqlite", "mongodb", "cassandra",
    "dynamodb", "elasticsearch", "neo4j", "influxdb", "firebase", "supabase",
    "oracle", "ms sql server", "mariadb",
    "git", "github", "gitlab", "bitbucket",
    "linux", "ubuntu",
    "figma", "adobe xd", "sketch",
    "jira", "confluence", "notion", "trello",
    "postman", "swagger",
    "webpack", "vite", "babel",
    "jest", "pytest", "cypress", "selenium", "playwright",
    "power bi", "tableau", "looker", "excel",
]
SOFT_SKILLS = [
    "communication", "leadership", "teamwork", "problem solving",
    "critical thinking", "time management", "adaptability", "creativity",
    "collaboration", "presentation", "mentoring", "agile", "scrum",
]
EDUCATION_KEYWORDS = [
    ("phd", "PhD / Doctorate"),
    ("doctorate", "PhD / Doctorate"),
    ("m.tech", "M.Tech"),
    ("m.e", "M.E"),
    ("m.sc", "M.Sc"),
    ("masters", "Master's Degree"),
    ("master of", "Master's Degree"),
    ("mba", "MBA"),
    ("m.b.a", "MBA"),
    ("b.tech", "B.Tech"),
    ("b.e", "B.E"),
    ("b.sc", "B.Sc"),
    ("b.com", "B.Com"),
    ("b.ca", "BCA"),
    ("bca", "BCA"),
    ("bachelor", "Bachelor's Degree"),
    ("bachelor of", "Bachelor's Degree"),
    ("diploma", "Diploma"),
    ("12th", "12th / HSC"),
    ("hsc", "12th / HSC"),
    ("10th", "10th / SSC"),
    ("ssc", "10th / SSC"),
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
    "intern", "trainee", "associate engineer", "senior engineer",
    "lead engineer", "tech lead", "engineering manager",
]
STOPWORDS = {
    "with", "that", "this", "have", "from", "they", "will", "your", "been",
    "more", "also", "into", "than", "then", "when", "where", "which", "their",
    "about", "after", "before", "other", "some", "such", "like", "over",
    "just", "each", "most", "very", "well", "work", "used", "using",
    "skills", "experience", "education", "projects", "resume", "profile",
    "summary", "objective", "references", "contact", "email", "phone",
}


def extract_text_from_pdf(file_bytes):
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(file_bytes))
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
    lines = [l.strip() for l in text.split("\n") if l.strip()]

    # Strategy 1 — explicit label
    for line in lines[:20]:
        m = re.match(r"(?:name|full\s*name)\s*[:\-]\s*(.+)", line, re.IGNORECASE)
        if m:
            candidate = m.group(1).strip()
            if 2 <= len(candidate.split()) <= 5:
                return candidate.title()

    # Strategy 2 — first line that is 2-4 words, only letters and spaces
    # handles Title Case, ALL CAPS, and mixed
    for line in lines[:6]:
        clean = re.sub(r"[^a-zA-Z\s]", "", line).strip()
        words = clean.split()
        if 2 <= len(words) <= 4 and all(len(w) >= 2 for w in words):
            # reject lines that look like section headers or job titles
            lower = clean.lower()
            if not any(kw in lower for kw in ["resume", "curriculum", "vitae", "profile", "engineer", "developer", "manager"]):
                return clean.title()

    # Strategy 3 — regex scan first 15 lines
    for line in lines[:15]:
        m = re.search(r"\b([A-Z][a-z]+(?: [A-Z][a-z]+){1,3})\b", line)
        if m and len(m.group(1).split()) >= 2:
            return m.group(1)

    return ""


def extract_email(text):
    m = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    return m.group(0) if m else ""


def extract_phone(text):
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


def extract_education(text):
    """Return the highest education level found."""
    lower = text.lower()
    for keyword, label in EDUCATION_KEYWORDS:
        if keyword in lower:
            return label
    return ""


def extract_experience_years(text):
    """Extract years of experience — explicit mention only, no date-span inference."""
    patterns = [
        r"(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp|work)",
        r"experience\s*(?:of\s*)?(\d+)\+?\s*years?",
        r"(\d+)\+?\s*yrs?\s*(?:of\s*)?(?:experience|exp)",
        r"(\d+)\+?\s*years?\s*(?:in\s+)?(?:industry|field|domain|it|software|tech)",
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            val = int(m.group(1))
            if 0 < val <= 40:
                return val

    # Infer ONLY from work experience section date ranges
    # Find work/experience section
    work_section = ""
    work_header = re.search(
        r"(?:work\s+experience|professional\s+experience|employment|experience)\s*\n(.+?)(?:\n(?:education|skills?|projects?|certifications?|awards?)\s*\n|$)",
        text, re.IGNORECASE | re.DOTALL
    )
    if work_header:
        work_section = work_header.group(1)
    else:
        work_section = text

    # Find date ranges like "Jan 2019 - Mar 2023" or "2019 - 2023" or "2019 – Present"
    date_ranges = re.findall(
        r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*(?:20\d{2}|19\d{2})\s*[-–]\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*(?:20\d{2}|19\d{2}|present|current|now|till\s+date|to\s+date)",
        work_section, re.IGNORECASE
    )
    if date_ranges:
        import datetime
        current_year = datetime.datetime.now().year
        all_years = re.findall(r"(20\d{2}|19\d{2})", " ".join(date_ranges))
        if all_years:
            years_int = [int(y) for y in all_years]
            earliest = min(years_int)
            latest = current_year if re.search(r"present|current|now|till\s+date|to\s+date", " ".join(date_ranges), re.IGNORECASE) else max(years_int)
            span = latest - earliest
            if 0 < span <= 40:
                return span
    return 0


def extract_projects(text):
    """Extract project names/descriptions from resume text."""
    projects = []
    lines = text.split("\n")

    # Find project section boundaries
    in_section = False
    section_lines = []
    section_headers = re.compile(
        r"^\s*(projects?|personal\s+projects?|academic\s+projects?|key\s+projects?|notable\s+projects?)\s*$",
        re.IGNORECASE
    )
    end_section = re.compile(
        r"^\s*(experience|education|skills?|certifications?|awards?|achievements?|references?|publications?)\s*$",
        re.IGNORECASE
    )

    for line in lines:
        stripped = line.strip()
        if section_headers.match(stripped):
            in_section = True
            continue
        if in_section:
            if end_section.match(stripped):
                break
            if stripped:
                section_lines.append(stripped)

    # Parse project titles from section (lines that look like titles: short, no verb endings)
    for line in section_lines:
        # Project title: 3-80 chars, not starting with bullet/number continuation
        if 5 < len(line) < 100 and not re.match(r"^[\-\•\*\d\.]", line):
            projects.append(line)
        elif re.match(r"^[\-\•\*]\s*(.+)", line):
            m = re.match(r"^[\-\•\*]\s*(.+)", line)
            if m and len(m.group(1)) > 5:
                projects.append(m.group(1).strip())

    # Fallback: scan whole text for "Project:" or bold-like patterns
    if not projects:
        for m in re.finditer(r"(?:project\s*[:\-]\s*)(.{5,80})", text, re.IGNORECASE):
            projects.append(m.group(1).strip())

    # Deduplicate and limit
    seen = set()
    unique = []
    for p in projects:
        key = p.lower()[:40]
        if key not in seen:
            seen.add(key)
            unique.append(p)

    return unique[:6]


def extract_summary(text):
    """Extract objective/summary section."""
    lines = text.split("\n")
    in_section = False
    summary_lines = []
    headers = re.compile(
        r"^\s*(summary|objective|profile|about\s*me|career\s*objective|professional\s*summary)\s*$",
        re.IGNORECASE
    )
    end_section = re.compile(
        r"^\s*(experience|education|skills?|projects?|certifications?)\s*$",
        re.IGNORECASE
    )
    for line in lines:
        stripped = line.strip()
        if headers.match(stripped):
            in_section = True
            continue
        if in_section:
            if end_section.match(stripped):
                break
            if stripped:
                summary_lines.append(stripped)
            if len(summary_lines) >= 4:
                break
    return " ".join(summary_lines).strip()


def parse_resume(file_bytes, filename):
    text = extract_text(file_bytes, filename)
    lower = text.lower()

    name      = extract_name(text)
    email     = extract_email(text)
    phone     = extract_phone(text)
    education = extract_education(text)
    years_exp = extract_experience_years(text)
    projects  = extract_projects(text)
    summary   = extract_summary(text)

    languages  = [s for s in LANGUAGES  if re.search(r'\b' + re.escape(s) + r'\b', lower)]
    frameworks = [s for s in FRAMEWORKS if re.search(r'\b' + re.escape(s) + r'\b', lower)]
    tools      = [s for s in TOOLS_CLOUD if re.search(r'\b' + re.escape(s) + r'\b', lower)]
    soft       = [s for s in SOFT_SKILLS if s in lower]
    titles     = [t for t in JOB_TITLES  if t in lower]

    skills = list(dict.fromkeys(languages + frameworks + tools))

    words = re.findall(r"\b[a-z]{4,}\b", lower)
    freq = {}
    for w in words:
        if w not in STOPWORDS:
            freq[w] = freq.get(w, 0) + 1
    keywords = [w for w, _ in sorted(freq.items(), key=lambda x: -x[1])[:30]]

    return {
        "raw_text":   text,
        "name":       name,
        "email":      email,
        "phone":      phone,
        "summary":    summary,
        "skills":     skills,
        "job_titles": titles,
        "keywords":   keywords,
        "languages":  languages,
        "frameworks": frameworks,
        "tools":      tools,
        "soft_skills": soft,
        "education":  education,
        "projects":   projects,
        "years_exp":  years_exp,
    }
