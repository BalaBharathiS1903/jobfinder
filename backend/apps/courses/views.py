from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
import uuid

from .models import CourseProgress, CourseCertificate
from .serializers import CourseProgressSerializer, CourseCertificateSerializer

VALID_COURSES = {"python-basics", "web-dev", "data-science", "django-rest"}

COURSE_TOTALS = {
    "python-basics": 20,
    "web-dev":       20,
    "data-science":  20,
    "django-rest":   20,
}


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def course_progress(request, course_id):
    if course_id not in VALID_COURSES:
        return Response({"error": "Invalid course."}, status=404)

    progress, _ = CourseProgress.objects.get_or_create(
        user=request.user, course_id=course_id
    )

    if request.method == "GET":
        return Response(CourseProgressSerializer(progress).data)

    # POST — save completed lessons dict
    completed = request.data.get("completed", {})
    if not isinstance(completed, dict):
        return Response({"error": "completed must be an object."}, status=400)

    progress.completed = completed
    progress.save()

    # Auto-issue certificate when all lessons done
    total    = COURSE_TOTALS.get(course_id, 0)
    done     = sum(1 for v in completed.values() if v)
    cert_data = None

    if done >= total and total > 0:
        cert, created = CourseCertificate.objects.get_or_create(
            user=request.user,
            course_id=course_id,
            defaults={
                "cert_id": f"VDART-{course_id.upper()}-{request.user.username[:4].upper()}-{uuid.uuid4().hex[:5].upper()}",
                "completed_on": timezone.now().strftime("%d %B %Y").lstrip("0"),
            }
        )
        cert_data = CourseCertificateSerializer(cert).data

    return Response({
        **CourseProgressSerializer(progress).data,
        "certificate": cert_data,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def course_certificate(request, course_id):
    if course_id not in VALID_COURSES:
        return Response({"error": "Invalid course."}, status=404)
    try:
        cert = CourseCertificate.objects.get(user=request.user, course_id=course_id)
        return Response(CourseCertificateSerializer(cert).data)
    except CourseCertificate.DoesNotExist:
        return Response({"error": "Certificate not yet earned."}, status=404)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def all_progress(request):
    """Return progress + certificate status for all courses."""
    result = {}
    for course_id in VALID_COURSES:
        progress = CourseProgress.objects.filter(
            user=request.user, course_id=course_id
        ).first()
        cert = CourseCertificate.objects.filter(
            user=request.user, course_id=course_id
        ).first()
        total = COURSE_TOTALS.get(course_id, 0)
        done  = sum(1 for v in (progress.completed if progress else {}).values() if v)
        result[course_id] = {
            "completed":   progress.completed if progress else {},
            "done":        done,
            "total":       total,
            "pct":         round((done / total) * 100) if total else 0,
            "certificate": CourseCertificateSerializer(cert).data if cert else None,
        }
    return Response(result)
