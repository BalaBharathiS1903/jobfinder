import re
import io

LANGUAGES = ["python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "ruby", "php", "swift", "kotlin", "scala", "r"]
FRAMEWORKS = ["react", "vue", "angular", "next.js", "node.js", "express", "django", "flask", "fastapi", "spring", "laravel", "rails", "flutter", "tailwind", "bootstrap"]
TOOLS_CLOUD = ["git", "github", "gitlab", "docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ansible", "linux", "mysql", "postgresql", "mongodb", "redis", "sqlite", "figma", "jira"]
SOFT_SKILLS = ["communication", "leadership", "teamwork", "problem solving", "critical thinking", "time management", "adaptability", "creativity", "collaboration", "presentation"]
EDUCATION_LEVELS = ["phd", "doctorate", "masters", "master", "mba", "bachelor", "b.tech", "b.e", "b.sc", "diploma", "10th", "12th"]

JOB_TITLES = [
    "software engineer", "backend engineer", "frontend engineer", "full stack engineer",
    "data scientist", "data engineer", "ml engineer", "devops engineer", "cloud engineer",
    "product manager", "project manager", "ux designer", "ui designer",
    "software developer", "web developer", "mobile developer", "ios developer", "android developer",
    "site reliability engineer", "security engineer", "qa engineer", "web development",
]

def extract_text_from_pdf(file_bytes):
    import PyPDF2
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    return "\n".join(page.extract_text() or "" for page in reader.pages)

def extract_text_from_docx(file_bytes):
    import docx
    doc = docx.Document(io.BytesIO(file_bytes))
    return "\n".join(p.text for p in doc.paragraphs)

def extract_text(file_bytes, filename):
    name = filename.lower()
    if name.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    if name.endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    return file_bytes.decode("utf-8", errors="ignore")

def extract_projects(text):
    projects = []
    lines = text.split("\n")
    in_project = False
    current = []
    for line in lines:
        l = line.strip()
        if re.search(r"project", l, re.IGNORECASE) and len(l) < 60:
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
    match = re.search(r"(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)", text, re.IGNORECASE)
    if match:
        return int(match.group(1))
    return 0

def parse_resume(file_bytes, filename):
    text = extract_text(file_bytes, filename)
    lower = text.lower()

    email_match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    phone_match = re.search(r"(\+?[\d][\d\s\-().]{6,18}[\d])", text)
    name_match = re.search(r"^([A-Z][a-z]+(?: [A-Z][a-z]+)+)", text, re.MULTILINE)

    languages = [s for s in LANGUAGES if re.search(r'\b' + re.escape(s) + r'\b', lower)]
    frameworks = [s for s in FRAMEWORKS if re.search(r'\b' + re.escape(s) + r'\b', lower)]
    tools = [s for s in TOOLS_CLOUD if re.search(r'\b' + re.escape(s) + r'\b', lower)]
    soft = [s for s in SOFT_SKILLS if s in lower]
    titles = [t for t in JOB_TITLES if t in lower]

    education = ""
    for level in EDUCATION_LEVELS:
        if level in lower:
            education = level.capitalize()
            break

    skills = list(set(languages + frameworks + tools))
    projects = extract_projects(text)
    years_exp = extract_experience_years(text)

    stopwords = {"with", "that", "this", "have", "from", "they", "will", "your", "been", "more",
                 "also", "into", "than", "then", "when", "where", "which", "their", "about"}
    words = re.findall(r"\b[a-z]{4,}\b", lower)
    freq = {}
    for w in words:
        if w not in stopwords:
            freq[w] = freq.get(w, 0) + 1
    keywords = [w for w, _ in sorted(freq.items(), key=lambda x: -x[1])[:30]]

    return {
        "raw_text": text,
        "name": name_match.group(1) if name_match else "",
        "email": email_match.group(0) if email_match else "",
        "phone": phone_match.group(1).strip() if phone_match else "",
        "skills": skills,
        "job_titles": titles,
        "keywords": keywords,
        "languages": languages,
        "frameworks": frameworks,
        "tools": tools,
        "soft_skills": soft,
        "education": education,
        "projects": projects,
        "years_exp": years_exp,
    }
