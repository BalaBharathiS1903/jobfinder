# VDart Academy — Career Platform

A full-stack career platform built with Django + React. Upload your resume, match jobs by skill, build ATS-friendly resumes, prep for interviews with IQ tests and mock interviews, and earn course certificates.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 5.2 + Django REST Framework + SimpleJWT |
| Frontend | React 18 + TanStack Query + React Router v6 + Vite |
| Job APIs | Adzuna (primary) · JSearch/RapidAPI (fallback) |
| Resume Parsing | PyPDF2 · python-docx · regex NLP |
| Database | SQLite (dev) · PostgreSQL (prod) |
| Auth | JWT (access + refresh tokens) |

---

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
cp .env.example .env           # fill in API keys
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173` · API at `http://localhost:8000`

---

## Environment Variables

Copy `backend/.env.example` → `backend/.env`:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

ADZUNA_APP_ID=your-adzuna-app-id
ADZUNA_APP_KEY=your-adzuna-app-key

JSEARCH_API_KEY=your-jsearch-rapidapi-key   # optional fallback
```

Get free API keys:
- **Adzuna**: https://developer.adzuna.com/signup
- **JSearch** (optional): https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch

---

## Features

### Resume
- Upload PDF, DOCX or TXT — skills, education, projects, keywords auto-extracted
- **Version control** — every re-parse or file replace saves a snapshot (v1, v2, v3…)
- **Replace** existing resume file without losing history
- Max 5 resumes per user
- Re-parse anytime to refresh extracted data
- Candidate profile card auto-generated from resume data

### Resume Analyzer
- Upload and analyze resume for ATS compatibility
- Score breakdown: Contact Info, Skills, Keywords, Job Titles, Content Depth
- Strengths and improvement suggestions
- **Skill Gap Analysis** — shows missing skills based on available courses
- **Course Recommendations** — direct links to specific courses to learn missing skills
- **Link to Prep Hub** — navigate to view all courses

### Job Search
- Real jobs from Adzuna API ranked 0–100% by skill match
- Ghost job detection — AI trust scoring flags Fake / Suspicious / Verified
- Auto Match — finds jobs directly from resume skills
- Filters: date posted, trust level, source, min match score
- **Build Keywords** button — sends missing skills to Resume Builder
- Save jobs for later

### My Profile
- Manual career profile: personal info, skills (with level), experience, education, certifications, projects, languages, achievements
- **Professional Headline** with auto-suggestions from skills + experience
- Social link buttons (LinkedIn, GitHub, Website)
- **Profile photo** upload
- **Job Matches tab** — find jobs matched against profile skills (no resume needed)

### Resume Builder
- 4 ATS-friendly templates (Modern, Classic, Minimal, Creative)
- Import from profile or uploaded resume
- **Profile photo** in resume
- **Skill dropdown** — search from 70+ predefined skills or add custom
- **Save Entry** per section — collapse/expand Work Experience, Education, Certifications, Projects
- **Custom Sections** — add any section with a title and free-text content
- **Save as Resume** — save built resume to Resumes page, replaces old resume
- Download / Print as PDF

### Interview Prep Hub (`/prep`)

**All Courses** — Browse all 15 available courses categorized by Programming Languages, Web & Frameworks, Data & Databases, and DevOps & Tools

#### IQ Level Game
- 25 questions randomly shuffled from a pool of 30 each session
- Global countdown timer (~17 min)
- **Pause / Resume** — timer stops when you leave, resumes where you left off
- IQ band result: Genius / Superior / Above Average / Average / Below Average
- Full question review with correct answers

#### Skill Test
- 5 topics: JavaScript, Python, Django, React, SQL
- 10 questions randomly shuffled from a pool of 12 per topic each session
- 30 seconds per question with per-question timer
- **Pause / Resume** support
- Pass/Fail (≥60%) + letter grade A+ to F
- Full answer review

#### Mock Interview
- 5 roles: Frontend, Backend, Full Stack, Data Analyst, DevOps
- **4 MCQ options** per question — pick the best answer
- Correct answer highlighted after selection + full explanation shown
- Questions shuffled from a pool of 8 per role, 6 selected per session
- **End validation** — full review showing your answer, correct answer, and explanation for every question
- Score as correct/total + percentage

### Learning Paths (`/prep/course/:id`)
- 15 courses: Python Basics · Web Development · Data Science · Django REST API · JavaScript Advanced · SQL & Databases · Git & DevOps · Java Fundamentals · TypeScript · Go (Golang) · Rust · Kotlin · C/C++ · PHP & Laravel · Ruby & Rails · Swift & iOS
- 5 modules per course, 4 lessons each (20 lessons total)
- Lesson types: 📖 Reading · 💻 Coding · ⚙️ Setup
- Click lesson to expand — shows **GeeksforGeeks**, **W3Schools**, and **Official Docs** links
- **YouTube Tutorial Videos** — embedded playlist player for each course with best quality tutorials
- Watch tutorials directly in the site without leaving
- Progress saved to **backend database** (not localStorage)
- Collapsible modules with per-module progress bar
- **Certificate** auto-issued when all 20 lessons completed
- Certificate locked until 100% completion — permanent cert ID stored in DB

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register |
| POST | `/api/auth/login/` | Login (returns JWT) |
| POST | `/api/auth/refresh/` | Refresh access token |

### Resume
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/resume/` | List resumes |
| POST | `/api/resume/upload/` | Upload new resume |
| POST | `/api/resume/save-from-builder/` | Save resume from Resume Builder |
| GET/DELETE | `/api/resume/<id>/` | Get or delete resume |
| POST | `/api/resume/<id>/reparse/` | Re-parse existing file |
| POST | `/api/resume/<id>/replace/` | Replace file + re-parse (saves version) |

### Jobs
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/jobs/search/` | Search jobs |
| POST | `/api/jobs/auto-search/` | Auto match from resume |
| POST | `/api/jobs/profile-search/` | Match from profile skills |
| GET | `/api/jobs/saved/` | List saved jobs |
| POST | `/api/jobs/saved/` | Save a job |
| DELETE | `/api/jobs/saved/<id>/` | Remove saved job |

### Profile
| Method | Endpoint | Description |
|---|---|---|
| GET/PUT | `/api/profile/` | Get or update career profile |

### Courses
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/courses/progress/` | All courses progress + cert status |
| GET/POST | `/api/courses/progress/<course_id>/` | Get or save lesson progress |
| GET | `/api/courses/certificate/<course_id>/` | Get earned certificate |

---

## Project Structure

```
resume_project/
├── backend/
│   ├── apps/
│   │   ├── accounts/       # User auth (JWT)
│   │   ├── resume/         # Resume upload, parse, version control
│   │   ├── jobs/           # Job search, matching, saved jobs
│   │   ├── profile/        # Career profile
│   │   └── courses/        # Learning paths, progress, certificates
│   ├── config/             # Django settings, URLs
│   └── requirements.txt
└── frontend/
    └── src/
        ├── pages/
        │   ├── Home.jsx
        │   ├── Resumes.jsx         # Upload, replace, version history
        │   ├── Search.jsx          # Job search + build keywords
        │   ├── SavedJobs.jsx
        │   ├── Profile.jsx         # Resume-based candidate profile
        │   ├── ManualProfile.jsx   # Career profile editor
        │   ├── ResumeAnalyzer.jsx
        │   ├── ResumeBuilder.jsx   # ATS resume builder
        │   ├── PrepHub.jsx         # Prep hub landing
        │   ├── IQGame.jsx          # IQ test with shuffle + pause
        │   ├── MockInterview.jsx   # MCQ mock interview + validation
        │   ├── TestPage.jsx        # Skill test with shuffle + pause
        │   ├── LearningPath.jsx    # Course lessons + progress
        │   └── Certificate.jsx     # Certificate generation
        └── components/
            ├── Navbar.jsx
            ├── JobMatchCard.jsx
            └── LocationInput.jsx
```

---

## Version History

| Version | Description |
|---|---|
| v1.0 | Initial release — resume upload, job search, skill matching |
| v1.1 | Ghost job detection, location autocomplete, candidate profile |
| v1.2 | Resume Analyzer, Resume Builder (ATS templates), saved jobs |
| v1.3 | Manual Profile, headline suggestions, social link buttons, profile job matching |
| v1.4 | Interview Prep Hub — IQ Game, Mock Interview, Skill Test |
| v1.5 | Learning Paths with 4 courses, lesson progress, certificate generation |
| v1.6 | Resume version control (replace + history), 5-resume limit, improved parser |
| v1.7 | Resume Builder overhaul — save/edit entries, custom sections, profile photo, skill dropdown |
| v1.8 | IQ/Skill Test shuffle + pause/resume · Mock Interview MCQ + end validation · Profile photo in profile page |
| v1.9 | Resume Builder save to Resumes · Resume Analyzer skill gap analysis · All Courses page with 15 courses |

---

## Django Admin

Access at `/admin/` after creating a superuser:
```bash
python manage.py createsuperuser
```
