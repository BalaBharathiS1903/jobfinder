from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
import uuid

from .models import CourseProgress, CourseCertificate, CourseAccess
from .serializers import CourseProgressSerializer, CourseCertificateSerializer

VALID_COURSES = {
    "python-basics", "web-dev", "data-science", "django-rest",
    "javascript-advanced", "sql-databases", "git-devops", "java-basics",
    "typescript", "golang", "rust-lang", "kotlin", "cpp", "php", "ruby", "swift",
}

COURSE_TOTALS = {
    "python-basics":       20,
    "web-dev":             20,
    "data-science":        20,
    "django-rest":         20,
    "javascript-advanced": 20,
    "sql-databases":       20,
    "git-devops":          20,
    "java-basics":         20,
    "typescript":          20,
    "golang":              20,
    "rust-lang":           20,
    "kotlin":              20,
    "cpp":                 20,
    "php":                 20,
    "ruby":                20,
    "swift":               20,
}


def has_course_access(user, course_id):
    """Superuser always has access. Others need per-course approval."""
    if user.is_superuser:
        return True
    return CourseAccess.objects.filter(user=user, course_id=course_id).exists()


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def course_progress(request, course_id):
    if not request.user.has_prep_access and not request.user.is_superuser:
        return Response({"error": "Prep Hub access denied. Contact admin."}, status=403)
    if course_id not in VALID_COURSES:
        return Response({"error": "Invalid course."}, status=404)
    if not has_course_access(request.user, course_id):
        return Response({"error": "Course not approved. Contact admin."}, status=403)

    progress, _ = CourseProgress.objects.get_or_create(
        user=request.user, course_id=course_id
    )

    if request.method == "GET":
        return Response(CourseProgressSerializer(progress).data)

    completed = request.data.get("completed", {})
    if not isinstance(completed, dict):
        return Response({"error": "completed must be an object."}, status=400)

    import re as _re
    for key in completed:
        if not _re.match(r'^\d+-\d+$', str(key)):
            return Response({"error": f"Invalid lesson key: {key}"}, status=400)

    total = COURSE_TOTALS.get(course_id, 0)
    done  = sum(1 for v in completed.values() if v)
    if done > total:
        return Response({"error": "Completed count exceeds course total."}, status=400)

    progress.completed = completed
    progress.save()
    cert_data = None

    if done >= total and total > 0:
        cert, _ = CourseCertificate.objects.get_or_create(
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
    if not request.user.has_prep_access and not request.user.is_superuser:
        return Response({"error": "Prep Hub access denied. Contact admin."}, status=403)

    # Get approved course IDs for this user
    if request.user.is_superuser:
        approved = set(VALID_COURSES)
    else:
        approved = set(
            CourseAccess.objects.filter(user=request.user).values_list("course_id", flat=True)
        )

    result = {}
    for course_id in VALID_COURSES:
        progress = CourseProgress.objects.filter(user=request.user, course_id=course_id).first()
        cert = CourseCertificate.objects.filter(user=request.user, course_id=course_id).first()
        total = COURSE_TOTALS.get(course_id, 0)
        done  = sum(1 for v in (progress.completed if progress else {}).values() if v)
        result[course_id] = {
            "completed":  progress.completed if progress else {},
            "done":       done,
            "total":      total,
            "pct":        round((done / total) * 100) if total else 0,
            "certificate": CourseCertificateSerializer(cert).data if cert else None,
            "approved":   course_id in approved,
        }
    return Response(result)


# ── Admin course access endpoints ─────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_user_course_access(request, user_id):
    """Get approved courses for a user."""
    if not request.user.is_superuser:
        return Response({"error": "Forbidden."}, status=403)
    approved = list(
        CourseAccess.objects.filter(user_id=user_id).values_list("course_id", flat=True)
    )
    return Response({"user_id": user_id, "approved_courses": approved})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_toggle_course_access(request, user_id):
    """Grant or revoke a course for a user. Body: {course_id, grant: true/false}"""
    if not request.user.is_superuser:
        return Response({"error": "Forbidden."}, status=403)
    from django.contrib.auth import get_user_model
    course_id = request.data.get("course_id")
    grant     = request.data.get("grant", True)
    if course_id not in VALID_COURSES:
        return Response({"error": "Invalid course."}, status=400)
    try:
        target = get_user_model().objects.get(pk=user_id)
    except get_user_model().DoesNotExist:
        return Response(status=404)
    if grant:
        CourseAccess.objects.get_or_create(user=target, course_id=course_id)
    else:
        CourseAccess.objects.filter(user=target, course_id=course_id).delete()
    approved = list(
        CourseAccess.objects.filter(user=target).values_list("course_id", flat=True)
    )
    return Response({"user_id": user_id, "approved_courses": approved})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_approve_all_courses(request, user_id):
    """Approve all courses for a user at once."""
    if not request.user.is_superuser:
        return Response({"error": "Forbidden."}, status=403)
    from django.contrib.auth import get_user_model
    try:
        target = get_user_model().objects.get(pk=user_id)
    except get_user_model().DoesNotExist:
        return Response(status=404)
    for course_id in VALID_COURSES:
        CourseAccess.objects.get_or_create(user=target, course_id=course_id)
    return Response({"user_id": user_id, "approved_courses": list(VALID_COURSES)})
