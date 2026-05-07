from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import JobSearch, SavedJob
from .serializers import JobSearchSerializer, SavedJobSerializer
from .linkedin import fetch_jobs
from .matcher import rank_jobs
from .trust import analyze_jobs_trust
from apps.resume.models import Resume
from apps.profile.models import UserProfile


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def search_jobs(request):
    query = request.data.get("query", "")
    location = request.data.get("location", "")
    resume_id = request.data.get("resume_id")
    country = request.data.get("country", "in")

    if not query:
        return Response({"error": "query is required."}, status=400)

    # Enforce job search limit
    from django.utils import timezone
    from datetime import timedelta
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    daily_count = JobSearch.objects.filter(user=request.user, searched_at__gte=today_start).count()
    if daily_count >= request.user.job_search_limit:
        return Response({"error": f"Daily job search limit of {request.user.job_search_limit} reached. Contact admin to increase your limit."}, status=429)

    jobs = fetch_jobs(query, location, country)
    jobs = analyze_jobs_trust(jobs)

    if resume_id:
        try:
            resume = Resume.objects.get(pk=resume_id, user=request.user)
            jobs = rank_jobs(jobs, resume)
        except Resume.DoesNotExist:
            pass

    JobSearch.objects.create(user=request.user, query=query, location=location, results=[])
    return Response({"results": jobs})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def auto_search(request):
    resume_id = request.data.get("resume_id")
    location  = request.data.get("location", "")
    country   = request.data.get("country", "in")

    if not resume_id:
        return Response({"error": "resume_id is required."}, status=400)

    try:
        resume = Resume.objects.get(pk=resume_id, user=request.user)
    except Resume.DoesNotExist:
        return Response(status=404)

    # Priority-ordered skills — best Adzuna search terms first
    PRIORITY = [
        "java", "python", "javascript", "typescript", "react", "angular", "vue",
        "node.js", "spring boot", "django", "flask", "fastapi",
        "sql", "mysql", "postgresql", "mongodb", "aws", "docker", "kubernetes",
        "machine learning", "data science", "flutter", "kotlin", "swift",
        "c++", "c#", "go", "rust", "php", "ruby", "spring", "hibernate",
    ]

    skills = [s.lower() for s in (resume.skills or [])]
    if not skills:
        return Response({"error": "Resume has no skills. Please re-parse your resume."}, status=400)

    # Order skills: priority list first, then remaining
    ordered = [s for s in PRIORITY if s in skills]
    ordered += [s for s in skills if s not in ordered]

    # Search each top skill individually — collect & deduplicate all results
    seen_ids  = set()
    all_jobs  = []
    used_skills = []

    for skill in ordered[:5]:          # top 5 skills → up to 5 × 20 = 100 jobs
        try:
            jobs = fetch_jobs(skill, location, country)
            new_jobs = [j for j in jobs if j["id"] not in seen_ids]
            for j in new_jobs:
                seen_ids.add(j["id"])
            all_jobs.extend(new_jobs)
            used_skills.append(skill)
        except Exception:
            continue

    if not all_jobs:
        return Response({"error": "No jobs found for your skills. Try again later."}, status=404)

    all_jobs = analyze_jobs_trust(all_jobs)
    ranked   = rank_jobs(all_jobs, resume)
    return Response({
        "results":     ranked,
        "query":       ", ".join(used_skills),
        "skills_used": used_skills,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def resume_search_query(request, pk):
    try:
        resume = Resume.objects.get(pk=pk, user=request.user)
    except Resume.DoesNotExist:
        return Response(status=404)

    skills = [s.lower() for s in (resume.skills or [])]
    titles = [t.lower() for t in (resume.job_titles or [])]

    # Build a smart query (same logic as auto_search) for the search box
    ROLE_MAP = [
        (["react", "javascript", "typescript", "vue", "angular"], "frontend developer"),
        (["django", "flask", "fastapi", "spring", "spring boot", "node.js"], "backend developer"),
        (["javascript", "java", "python", "sql"], "software developer"),
        (["machine learning", "tensorflow", "pytorch", "scikit-learn"], "machine learning engineer"),
        (["pandas", "numpy", "matplotlib"], "data analyst"),
        (["docker", "kubernetes", "aws", "terraform"], "devops engineer"),
        (["android", "kotlin", "swift", "flutter"], "mobile developer"),
        (["sql", "postgresql", "mysql", "mongodb"], "database developer"),
    ]
    query = None
    for role_skills, role_name in ROLE_MAP:
        if any(s in skills for s in role_skills):
            query = role_name
            break
    if not query:
        non_generic = [t for t in titles if t not in ("intern", "trainee", "associate")]
        query = non_generic[0] if non_generic else (f"{skills[0]} developer" if skills else (titles[0] if titles else ""))

    return Response({"query": query, "skills": resume.skills, "titles": resume.job_titles})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_history(request):
    searches = JobSearch.objects.filter(user=request.user).order_by("-searched_at")[:20]
    return Response(JobSearchSerializer(searches, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def job_detail(request, pk):
    searches = JobSearch.objects.filter(user=request.user)
    for s in searches:
        for job in s.results:
            if str(job.get("id")) == str(pk):
                return Response(job)
    return Response(status=404)


class SavedJobListCreateView(generics.ListCreateAPIView):
    serializer_class = SavedJobSerializer

    def get_queryset(self):
        return SavedJob.objects.filter(user=self.request.user).order_by("-saved_at")

    def perform_create(self, serializer):
        from django.db import IntegrityError
        try:
            serializer.save(user=self.request.user)
        except IntegrityError:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": "Job already saved."})


class SavedJobDestroyView(generics.DestroyAPIView):
    serializer_class = SavedJobSerializer

    def get_queryset(self):
        return SavedJob.objects.filter(user=self.request.user)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def profile_search(request):
    location = request.data.get("location", "")
    country = request.data.get("country", "in")

    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    skill_names = [s.get("name", "") if isinstance(s, dict) else str(s) for s in profile.skills]
    skill_names = [s for s in skill_names if s]

    if not skill_names and not profile.headline:
        return Response({"error": "Add skills or a headline to your profile first."}, status=400)

    query_parts = []
    if profile.headline:
        query_parts.append(profile.headline.split("|")[0].strip())
    query_parts += skill_names[:4]
    query = " ".join(query_parts[:5])

    jobs = fetch_jobs(query, location, country)
    jobs = analyze_jobs_trust(jobs)

    # Score against profile skills inline (no Resume object needed)
    skill_set = set(s.lower() for s in skill_names)
    scored = []
    for job in jobs:
        job_text = (job.get("title", "") + " " + job.get("description", "")).lower()
        matched = {s for s in skill_set if s in job_text}
        score = min(round((len(matched) / max(len(skill_set), 1)) * 100), 100)
        scored.append({**job, "match_score": score, "matched_skills": sorted(matched),
                       "missing_skills": sorted(skill_set - matched)})
    scored.sort(key=lambda x: -x["match_score"])
    return Response({"results": scored, "query": query})
