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
    location = request.data.get("location", "")
    country = request.data.get("country", "in")

    if not resume_id:
        return Response({"error": "resume_id is required."}, status=400)

    try:
        resume = Resume.objects.get(pk=resume_id, user=request.user)
    except Resume.DoesNotExist:
        return Response(status=404)

    queries = []
    if resume.job_titles:
        queries.append(resume.job_titles[0])
    if resume.skills:
        queries.append(" ".join(resume.skills[:3]))
    if not queries:
        queries = [" ".join(resume.keywords[:3])]

    seen_ids = set()
    all_jobs = []
    for q in queries:
        for job in fetch_jobs(q, location, country):
            if job["id"] not in seen_ids:
                seen_ids.add(job["id"])
                all_jobs.append(job)

    all_jobs = analyze_jobs_trust(all_jobs)
    ranked = rank_jobs(all_jobs, resume)
    return Response({"results": ranked, "query": queries[0]})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def resume_search_query(request, pk):
    try:
        resume = Resume.objects.get(pk=pk, user=request.user)
    except Resume.DoesNotExist:
        return Response(status=404)

    titles = resume.job_titles[:1]
    skills = resume.skills[:4]
    parts = titles + [s for s in skills if s not in " ".join(titles).lower()]
    query = " ".join(parts) if parts else " ".join(resume.keywords[:3])
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
        serializer.save(user=self.request.user)


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
