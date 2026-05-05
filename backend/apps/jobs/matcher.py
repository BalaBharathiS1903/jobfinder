import re

SKILL_ALIASES = {
    "rest api":    ["rest", "restful", "rest api", "rest apis", "api"],
    "spring boot": ["spring boot", "springboot", "spring-boot", "spring"],
    "node.js":     ["node", "nodejs", "node.js"],
    "react":       ["react", "reactjs", "react.js"],
    "vue":         ["vue", "vuejs", "vue.js"],
    "next.js":     ["next", "nextjs", "next.js"],
    "postgresql":  ["postgres", "postgresql"],
    "mongodb":     ["mongo", "mongodb"],
    "machine learning": ["machine learning", "ml"],
    "deep learning":    ["deep learning", "dl"],
    "natural language processing": ["nlp", "natural language processing"],
    "ci/cd":  ["ci/cd", "cicd", "ci cd", "continuous integration", "continuous delivery"],
    "aws":    ["aws", "amazon web services", "amazon aws"],
    "gcp":    ["gcp", "google cloud"],
    "azure":  ["azure", "microsoft azure"],
    "java":   ["java"],          # explicit — must NOT match javascript
    "sql":    ["sql", "mysql", "postgresql", "sqlite", "database"],
    "python": ["python"],
    "javascript": ["javascript", "js"],
    "typescript": ["typescript", "ts"],
    "html":   ["html", "html5"],
    "css":    ["css", "css3", "stylesheet"],
    "git":    ["git", "github", "gitlab", "version control"],
    "docker": ["docker", "containerization", "container"],
    "kubernetes": ["kubernetes", "k8s"],
    "spring": ["spring", "spring framework", "spring boot"],
    "hibernate": ["hibernate", "orm", "jpa"],
    "jwt":    ["jwt", "json web token", "token authentication"],
    "mysql":  ["mysql", "sql", "database"],
    "excel":  ["excel", "spreadsheet", "ms office"],
    "postman": ["postman", "api testing"],
    "vercel": ["vercel", "deployment", "hosting"],
    "github": ["github", "git", "version control"],
}

# Skills that are core/technical — used in denominator for scoring
# Tools like git, postman, excel are excluded from denominator
CORE_SKILL_KEYWORDS = {
    "java", "python", "javascript", "typescript", "c", "c++", "c#", "go", "rust",
    "ruby", "php", "swift", "kotlin", "scala", "sql", "html", "css",
    "react", "vue", "angular", "next.js", "node.js", "express", "nestjs",
    "django", "flask", "fastapi", "spring", "spring boot", "hibernate",
    "mysql", "postgresql", "mongodb", "redis", "sqlite",
    "aws", "azure", "gcp", "docker", "kubernetes",
    "machine learning", "deep learning", "tensorflow", "pytorch",
    "rest api", "graphql", "jwt", "oauth2",
    "flutter", "react native", "android", "ios",
    "data science", "pandas", "numpy",
}


def _skill_in_text(skill, text):
    """Check if a skill appears in text using aliases and strict word boundaries."""
    skill_lower = skill.lower()
    variants = SKILL_ALIASES.get(skill_lower, [skill_lower])
    for v in variants:
        # Always use word boundary to prevent false matches (java != javascript)
        pattern = r'\b' + re.escape(v) + r'\b'
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False


def score_job(job, resume):
    job_text = (
        (job.get("title") or "") + " " +
        (job.get("description") or "")
    ).lower()

    all_skills = set(s.lower() for s in (resume.skills or []))

    # Only score against core/technical skills — exclude tools like git, postman, excel
    # that almost never appear in job descriptions
    core_skills = all_skills & CORE_SKILL_KEYWORDS
    # If resume has no core skills, fall back to all skills
    scored_skills = core_skills if core_skills else all_skills

    if not scored_skills:
        return {**job, "match_score": 0, "matched_skills": [], "missing_skills": []}

    matched = {s for s in scored_skills if _skill_in_text(s, job_text)}
    missing = sorted(scored_skills - matched)

    # Score = matched / total core skills, boosted by title match
    base_score = (len(matched) / len(scored_skills)) * 85

    # Bonus: job title contains a relevant role keyword
    job_title = (job.get("title") or "").lower()
    title_bonus = 0
    for t in (resume.job_titles or []):
        if t.lower() not in ("intern", "trainee") and t.lower() in job_title:
            title_bonus = 15
            break
    # Generic role bonus even without exact title match
    if title_bonus == 0:
        role_words = {"developer", "engineer", "analyst", "architect", "programmer", "scientist"}
        if any(w in job_title for w in role_words):
            title_bonus = 8

    total = min(round(base_score + title_bonus), 100)

    return {
        **job,
        "match_score": total,
        "matched_skills": sorted(matched),
        "missing_skills": missing[:5],
    }


def rank_jobs(jobs, resume):
    scored = [score_job(j, resume) for j in jobs]
    return sorted(scored, key=lambda x: -x["match_score"])
