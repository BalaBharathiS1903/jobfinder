def score_job(job, resume):
    """Score a job 0-100 against a resume using keyword overlap + skill scoring."""
    job_text = (job.get("title", "") + " " + job.get("description", "")).lower()

    resume_skills = set(s.lower() for s in resume.skills)
    resume_keywords = set(k.lower() for k in resume.keywords)
    resume_titles = set(t.lower() for t in resume.job_titles)

    # Skill score (60%)
    job_skills = {s for s in resume_skills if s in job_text}
    skill_score = (len(job_skills) / max(len(resume_skills), 1)) * 60

    # Keyword score (25%)
    job_keywords = {k for k in resume_keywords if k in job_text}
    keyword_score = (len(job_keywords) / max(len(resume_keywords), 1)) * 25

    # Title match score (15%)
    title_score = 15 if any(t in job_text for t in resume_titles) else 0

    total = min(round(skill_score + keyword_score + title_score), 100)

    missing_skills = list(resume_skills - job_skills)

    return {
        **job,
        "match_score": total,
        "matched_skills": sorted(job_skills),
        "missing_skills": sorted(missing_skills),
    }

def rank_jobs(jobs, resume):
    scored = [score_job(j, resume) for j in jobs]
    return sorted(scored, key=lambda x: -x["match_score"])
