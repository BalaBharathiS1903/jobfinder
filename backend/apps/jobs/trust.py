"""
Ghost/Fake job detection based on red flag analysis.
Scores each job 0-100 (higher = more trustworthy).
"""

RED_FLAGS = [
    # Too good to be true
    ("easy money", 30), ("work from home no experience", 25), ("earn from home", 25),
    ("no experience needed", 15), ("unlimited earning", 30), ("be your own boss", 20),
    ("financial freedom", 20), ("passive income", 20), ("get rich", 30),

    # Vague descriptions
    ("various duties", 15), ("other duties as assigned", 10), ("flexible hours", 5),
    ("must be motivated", 5), ("self starter", 5),

    # Suspicious payment
    ("pay your own", 30), ("training fee", 40), ("registration fee", 40),
    ("pay to work", 50), ("investment required", 40), ("upfront payment", 40),
    ("wire transfer", 35), ("western union", 40), ("gift card", 40),

    # Urgency / pressure
    ("urgent hiring", 10), ("immediate joining", 5), ("apply now limited", 10),
    ("only today", 15), ("last chance", 15),

    # Suspicious contact
    ("whatsapp only", 20), ("contact on telegram", 20), ("gmail.com hiring", 25),
    ("yahoo.com hiring", 25), ("no interview", 30), ("hired immediately", 20),

    # MLM / pyramid
    ("multi level", 35), ("mlm", 40), ("network marketing", 30),
    ("recruit others", 30), ("downline", 35),
]

TRUST_SIGNALS = [
    ("glassdoor", 10), ("linkedin", 8), ("indeed", 8), ("naukri", 8),
    ("company website", 5), ("official email", 5), ("interview process", 10),
    ("background check", 8), ("onboarding", 5), ("benefits", 5),
    ("health insurance", 8), ("provident fund", 8), ("annual leave", 5),
]

GHOST_COMPANY_SIGNALS = [
    ("no company name", 20), ("confidential company", 10),
    ("undisclosed company", 10), ("anonymous employer", 15),
]


def analyze_job_trust(job):
    """
    Returns trust analysis for a job posting.
    trust_score: 0-100 (100 = fully trusted)
    label: Verified / Suspicious / Fake
    red_flags: list of detected issues
    """
    text = (
        (job.get("title") or "") + " " +
        (job.get("description") or "") + " " +
        (job.get("company") or "")
    ).lower()

    penalty = 0
    detected_flags = []

    for phrase, weight in RED_FLAGS:
        if phrase in text:
            penalty += weight
            detected_flags.append(phrase.title())

    bonus = 0
    for phrase, weight in TRUST_SIGNALS:
        if phrase in text:
            bonus += weight

    # No company name penalty
    company = (job.get("company") or "").strip()
    if not company or company.lower() in ("", "unknown", "confidential", "undisclosed"):
        penalty += 20
        detected_flags.append("No company name")

    # Very short description penalty
    desc = (job.get("description") or "")
    if len(desc) < 100:
        penalty += 15
        detected_flags.append("Very short description")

    # No URL penalty
    if not job.get("url"):
        penalty += 10
        detected_flags.append("No apply link")

    trust_score = max(0, min(100, 100 - penalty + bonus))

    if trust_score >= 70:
        label = "Verified"
        color = "green"
    elif trust_score >= 40:
        label = "Suspicious"
        color = "orange"
    else:
        label = "Fake"
        color = "red"

    return {
        **job,
        "trust_score": trust_score,
        "trust_label": label,
        "trust_color": color,
        "red_flags": detected_flags[:5],
    }


def analyze_jobs_trust(jobs):
    return [analyze_job_trust(j) for j in jobs]
