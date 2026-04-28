import re
import io

SKILLS_LIST = [
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "ruby", "php",
    "react", "vue", "angular", "next.js", "node.js", "express", "django", "flask", "fastapi",
    "spring", "laravel", "rails",
    "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "sqlite",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible", "ci/cd",
    "git", "linux", "rest api", "graphql", "microservices", "machine learning", "deep learning",
    "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn", "data analysis",
    "html", "css", "sass", "tailwind", "figma", "agile", "scrum",
]

JOB_TITLES = [
    "software engineer", "backend engineer", "frontend engineer", "full stack engineer",
    "data scientist", "data engineer", "ml engineer", "devops engineer", "cloud engineer",
    "product manager", "project manager", "ux designer", "ui designer",
    "software developer", "web developer", "mobile developer", "ios developer", "android developer",
    "site reliability engineer", "security engineer", "qa engineer",
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

def parse_resume(file_bytes, filename):
    text = extract_text(file_bytes, filename)
    lower = text.lower()

    email_match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    phone_match = re.search(r"(\+?[\d][\d\s\-().]{6,18}[\d])", text)
    name_match = re.search(r"^([A-Z][a-z]+(?: [A-Z][a-z]+)+)", text, re.MULTILINE)

    skills = [s for s in SKILLS_LIST if s in lower]
    titles = [t for t in JOB_TITLES if t in lower]

    # Extract meaningful keywords (words 4+ chars, not common stopwords)
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
    }
