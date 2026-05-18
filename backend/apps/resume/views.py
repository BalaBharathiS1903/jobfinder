from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Resume, ResumeVersion
from .serializers import ResumeSerializer
from .parser import parse_resume

MAX_RESUMES = 5


def _resume_error(message, status=400):
    return Response({"error": message}, status=status)


def _validate_resume_upload(file):
    if not file:
        return "No file provided."
    allowed = (".pdf", ".docx", ".txt")
    if not any(file.name.lower().endswith(ext) for ext in allowed):
        return "Unsupported file type. Use PDF, DOCX or TXT."
    if file.size > 5 * 1024 * 1024:
        return "File too large. Maximum size is 5 MB."
    return None


def _parse_resume_payload(file_bytes, filename):
    parsed = parse_resume(file_bytes, filename)
    if not (parsed.get("raw_text") or "").strip():
        raise ValueError(
            "Could not extract readable text from this file. "
            "Upload a text-based PDF, DOCX, or TXT resume."
        )
    return parsed


def _serialize_resume(resume, request, *, status=200):
    return Response(ResumeSerializer(resume, context={"request": request}).data, status=status)


def _save_version(resume):
    ResumeVersion.objects.create(
        resume=resume, version=resume.version, filename=resume.filename,
        skills=resume.skills, keywords=resume.keywords, job_titles=resume.job_titles,
        name=resume.name, email=resume.email, phone=resume.phone,
    )


class ResumeListView(generics.ListAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user).order_by("-uploaded_at")
    def get_serializer_context(self):
        return {'request': self.request}


class ResumeDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)
    def get_serializer_context(self):
        return {'request': self.request}


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_resume(request):
    file = request.FILES.get("file")
    validation_error = _validate_resume_upload(file)
    if validation_error:
        return _resume_error(validation_error)
    if Resume.objects.filter(user=request.user).count() >= request.user.resume_upload_limit:
        return _resume_error(
            f"Maximum {request.user.resume_upload_limit} resumes allowed. Delete or replace an existing one."
        )
    file_bytes = file.read()
    file.seek(0)
    try:
        parsed = _parse_resume_payload(file_bytes, file.name)
    except ValueError as exc:
        return _resume_error(str(exc))
    resume = Resume.objects.create(user=request.user, file=file, filename=file.name, version=1, **parsed)
    return _serialize_resume(resume, request, status=201)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def replace_resume(request, pk):
    try:
        resume = Resume.objects.get(pk=pk, user=request.user)
    except Resume.DoesNotExist:
        return Response(status=404)
    file = request.FILES.get("file")
    validation_error = _validate_resume_upload(file)
    if validation_error:
        return _resume_error(validation_error)
    file_bytes = file.read()
    file.seek(0)
    try:
        parsed = _parse_resume_payload(file_bytes, file.name)
    except ValueError as exc:
        return _resume_error(str(exc))
    _save_version(resume)
    resume.file = file
    resume.filename = file.name
    resume.version = resume.version + 1
    for field, value in parsed.items():
        setattr(resume, field, value)
    resume.save()
    return _serialize_resume(resume, request)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reparse_resume(request, pk):
    try:
        resume = Resume.objects.get(pk=pk, user=request.user)
    except Resume.DoesNotExist:
        return Response(status=404)
    resume.file.open("rb")
    try:
        file_bytes = resume.file.read()
    finally:
        resume.file.close()
    try:
        parsed = _parse_resume_payload(file_bytes, resume.filename)
    except ValueError as exc:
        return _resume_error(str(exc))
    _save_version(resume)
    resume.version = resume.version + 1
    for field, value in parsed.items():
        setattr(resume, field, value)
    resume.save()
    return _serialize_resume(resume, request)


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

    # Normalize expected types from the frontend payload
    if not isinstance(skills, list):
        skills = []
    if not isinstance(experience, list):
        experience = []
    if not isinstance(education, list):
        education = []
    if not isinstance(projects, list):
        projects = []
    if not isinstance(certs, list):
        certs = []
    if not any([name, email, phone, headline, summary, skills, experience, education, projects, certs]):
        return _resume_error("Add some resume details before saving.")

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

    # IMPORTANT: match Resume model field types
    # - education is a string
    # - projects is JSONField: store full project objects as provided by the frontend
    education_str = ""
    if education and isinstance(education, list):
        first = education[0] or {}
        education_str = first.get("degree", "") or ""

    fields = dict(
        name=name,
        email=email,
        phone=phone,
        summary=summary,
        skills=all_skills,
        languages=parsed.get("languages", []),
        frameworks=parsed.get("frameworks", []),
        tools=parsed.get("tools", []),
        soft_skills=parsed.get("soft_skills", []),
        job_titles=parsed.get("job_titles", []),
        keywords=parsed.get("keywords", []),
        projects=[p for p in projects if isinstance(p, dict) and (p.get("name") or p.get("description"))],
        education=education_str,
        years_exp=parsed.get("years_exp", 0),
        raw_text=raw_text,
    )


    if replace_id:
        try:
            resume = Resume.objects.get(pk=replace_id, user=request.user)
        except Resume.DoesNotExist:
            return _resume_error("Resume not found.", status=404)
        _save_version(resume)
        resume.file     = file_obj
        resume.filename = filename
        resume.version  = resume.version + 1
        for k, v in fields.items():
            setattr(resume, k, v)
        resume.save()
        return _serialize_resume(resume, request)

    if Resume.objects.filter(user=request.user).count() >= request.user.resume_upload_limit:
        return _resume_error(
            f"Maximum {request.user.resume_upload_limit} resumes allowed. Delete or replace one first."
        )

    resume = Resume.objects.create(
        user=request.user, file=file_obj, filename=filename, version=1, **fields
    )
    return _serialize_resume(resume, request, status=201)
