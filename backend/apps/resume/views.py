from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Resume
from .serializers import ResumeSerializer
from .parser import parse_resume

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
        return Response({"error": "Unsupported file type."}, status=400)

    file_bytes = file.read()
    parsed = parse_resume(file_bytes, file.name)

    resume = Resume.objects.create(
        user=request.user,
        file=file,
        filename=file.name,
        **parsed,
    )
    return Response(ResumeSerializer(resume).data, status=201)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reparse_resume(request, pk):
    try:
        resume = Resume.objects.get(pk=pk, user=request.user)
    except Resume.DoesNotExist:
        return Response(status=404)

    file_bytes = resume.file.read()
    parsed = parse_resume(file_bytes, resume.filename)
    for field, value in parsed.items():
        setattr(resume, field, value)
    resume.save()
    return Response(ResumeSerializer(resume).data)
