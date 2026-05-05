from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Resume, ResumeVersion
from .serializers import ResumeSerializer
from .parser import parse_resume

MAX_RESUMES = 5


def _save_version(resume):
    """Snapshot current resume state before overwriting."""
    ResumeVersion.objects.create(
        resume=resume,
        version=resume.version,
        filename=resume.filename,
        skills=resume.skills,
        keywords=resume.keywords,
        job_titles=resume.job_titles,
        name=resume.name,
        email=resume.email,
        phone=resume.phone,
    )


class ResumeListView(generics.ListAPIView):
    serializer_class = ResumeSerializer

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user).order_by("-uploaded_at")


class ResumeDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ResumeSerializer

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)


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

    count = Resume.objects.filter(user=request.user).count()
    if count >= MAX_RESUMES:
        return Response(
            {"error": f"Maximum {MAX_RESUMES} resumes allowed. Delete or replace an existing one."},
            status=400,
        )

    file_bytes = file.read()
    parsed = parse_resume(file_bytes, file.name)
    resume = Resume.objects.create(
        user=request.user, file=file, filename=file.name, version=1, **parsed,
    )
    return Response(ResumeSerializer(resume).data, status=201)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def replace_resume(request, pk):
    """Replace file + re-parse an existing resume, saving a version snapshot first."""
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

    # Save snapshot of current state
    _save_version(resume)

    file_bytes = file.read()
    parsed = parse_resume(file_bytes, file.name)

    resume.file     = file
    resume.filename = file.name
    resume.version  = resume.version + 1
    for field, value in parsed.items():
        setattr(resume, field, value)
    resume.save()
    return Response(ResumeSerializer(resume).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reparse_resume(request, pk):
    """Re-parse existing file without replacing it, saving a version snapshot first."""
    try:
        resume = Resume.objects.get(pk=pk, user=request.user)
    except Resume.DoesNotExist:
        return Response(status=404)

    _save_version(resume)

    file_bytes = resume.file.read()
    parsed = parse_resume(file_bytes, resume.filename)
    resume.version = resume.version + 1
    for field, value in parsed.items():
        setattr(resume, field, value)
    resume.save()
    return Response(ResumeSerializer(resume).data)
