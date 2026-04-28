# ResumeMatch — Django + React Job Matcher

A full-stack web app that parses your resume, extracts skills, and finds matching jobs via Adzuna API ranked by relevance.

## Tech Stack
- **Backend**: Django 5.2 + Django REST Framework + JWT
- **Frontend**: React + TanStack Query + React Router v6
- **Job API**: Adzuna (primary) + JSearch/RapidAPI (fallback)
- **Resume Parsing**: PyPDF2, python-docx, regex NLP

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # Add your API keys
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

## Environment Variables
Copy `backend/.env.example` to `backend/.env` and fill in:
```
SECRET_KEY=your-secret-key
ADZUNA_APP_ID=your-adzuna-app-id
ADZUNA_APP_KEY=your-adzuna-app-key
JSEARCH_API_KEY=your-jsearch-key   # optional
```

## Features
- Resume upload (PDF, DOCX, TXT) with auto skill extraction
- Auto job search from resume keywords
- Jobs ranked 0–100% by skill match
- Save jobs for later
- JWT authentication
- Django Admin at `/admin/`

## API Keys
- **Adzuna** (free): https://developer.adzuna.com/signup
- **JSearch** (optional): https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
