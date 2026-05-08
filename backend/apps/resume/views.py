from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Resume, ResumeVersion
from .serializers import ResumeSerializer
from .parser import parse_resume

MAX_RESUMES = 5


def _save_version(resume):
    ResumeVersion.objects.create(
        resume=resume, version=resume.version, filename=resume.filename,
        skills=resume.skills, keywords=resume.keywords, job_titles=resume.job_titles,
        name=resume.name, email=resume.email, phone=resume.phone,
    )


class ResumeListView(generics.ListAPIView):
    serializer_class = ResumeSerializer
    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user).order_by("-uploaded_at")
    def get_serializer_context(self):
        return {'request': self.request}


class ResumeDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ResumeSerializer
    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)
    def get_serializer_context(self):
        return {'request': self.request}


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_resume(request):
    file = request.FILES.get("file")
    if not file:
        return Response({"error": "No file provided."}, status=400)
    allowed = (".pdf", ".docx", ".txt")
    if not any(file.name.lower().endswith(ext) for ext in allowed):
        return Response({"error": "Unsupported file type. Use PDF, DOCX or TXT."}, status=400)
    if file.size > 5 * 1024 * 1024:
        return Response({"error": "File too large. Maximum size is 5 MB."}, status=400)
    if Resume.objects.filter(user=request.user).count() >= request.user.resume_upload_limit:
        return Response({"error": f"Maximum {request.user.resume_upload_limit} resumes allowed. Delete or replace an existing one."}, status=400)
    parsed = parse_resume(file.read(), file.name)
    resume = Resume.objects.create(user=request.user, file=file, filename=file.name, version=1, **parsed)
    return Response(ResumeSerializer(resume).data, status=201)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def replace_resume(request, pk):
    try:
        resume = Resume.objects.get(pk=pk, user=request.user)
    except Resume.DoesNotExist:
        return Response(status=404)
    file = request.FILES.get("file")
    if not file:
        return Response({"error": "No file provided."}, status=400)
    allowed = (".pdf", ".docx", ".txt")
    if not any(file.name.lower().endswith(ext) for ext in allowed):
        return Response({"error": "Unsupported file type."}, status=400)
    if file.size > 5 * 1024 * 1024:
        return Response({"error": "File too large. Maximum size is 5 MB."}, status=400)
    _save_version(resume)
    parsed = parse_resume(file.read(), file.name)
    resume.file = file
    resume.filename = file.name
    resume.version = resume.version + 1
    for field, value in parsed.items():
        setattr(resume, field, value)
    resume.save()
    return Response(ResumeSerializer(resume).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reparse_resume(request, pk):
    try:
        resume = Resume.objects.get(pk=pk, user=request.user)
    except Resume.DoesNotExist:
        return Response(status=404)
    _save_version(resume)
    parsed = parse_resume(resume.file.read(), resume.filename)
    resume.version = resume.version + 1
    for field, value in parsed.items():
        setattr(resume, field, value)
    resume.save()
    return Response(ResumeSerializer(resume).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_from_builder(request):
    """Save a resume built in Resume Builder — no file upload needed."""
    from django.core.files.base import ContentFile

    data       = request.data
    name       = data.get("name", "").strip()
    email      = data.get("email", "").strip()
    phone      = data.get("phone", "").strip()
    headline   = data.get("headline", "")
    summary    = data.get("summary", "")
    skills     = data.get("skills", [])
    experience = data.get("experience", [])
    education  = data.get("education", [])
    projects   = data.get("projects", [])
    certs      = data.get("certifications", [])
    replace_id = data.get("replace_id")

    # Build plain text for parsing
    lines = [name, headline, email, phone, summary]
    for e in experience:
        lines += [e.get("title",""), e.get("company",""), e.get("description","")]
    for e in education:
        lines += [e.get("degree",""), e.get("institution","")]
    for p in projects:
        lines += [p.get("name",""), p.get("tech",""), p.get("description","")]
    for c in certs:
        lines += [c.get("name",""), c.get("issuer","")]
    raw_text = "\n".join(l for l in lines if l)

    parsed     = parse_resume(raw_text.encode("utf-8"), "builder.txt")
    all_skills = list(dict.fromkeys(skills + parsed.get("skills", [])))
    filename   = f"{name or 'resume'}_builder.txt"
    file_obj   = ContentFile(raw_text.encode("utf-8"), name=filename)

    fields = dict(
        name=name, email=email, phone=phone, summary=summary,
        skills=all_skills,
        languages=parsed.get("languages", []),
        frameworks=parsed.get("frameworks", []),
        tools=parsed.get("tools", []),
        soft_skills=parsed.get("soft_skills", []),
        job_titles=parsed.get("job_titles", []),
        keywords=parsed.get("keywords", []),
        projects=[p.get("name","") for p in projects if p.get("name")],
        education=education[0].get("degree","") if education else "",
        years_exp=parsed.get("years_exp", 0),
        raw_text=raw_text,
    )

    if replace_id:
        try:
            resume = Resume.objects.get(pk=replace_id, user=request.user)
        except Resume.DoesNotExist:
            return Response({"error": "Resume not found."}, status=404)
        _save_version(resume)
        resume.file     = file_obj
        resume.filename = filename
        resume.version  = resume.version + 1
        for k, v in fields.items():
            setattr(resume, k, v)
        resume.save()
        return Response(ResumeSerializer(resume).data)

    if Resume.objects.filter(user=request.user).count() >= request.user.resume_upload_limit:
        return Response({"error": f"Maximum {request.user.resume_upload_limit} resumes allowed. Delete or replace one first."}, status=400)

    resume = Resume.objects.create(
        user=request.user, file=file_obj, filename=filename, version=1, **fields
    )
    return Response(ResumeSerializer(resume).data, status=201)
