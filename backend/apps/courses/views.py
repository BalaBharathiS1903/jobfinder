from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
import uuid

from .models import CourseProgress, CourseCertificate, CourseAccess, CustomCourse
from .serializers import CourseProgressSerializer, CourseCertificateSerializer

VALID_COURSES = {
    "python-basics", "web-dev", "data-science", "django-rest",
    "javascript-advanced", "sql-databases", "git-devops", "java-basics",
    "typescript", "golang", "rust-lang", "kotlin", "cpp", "php", "ruby", "swift",
}

COURSE_TOTALS = {
    "python-basics": 20, "web-dev": 20, "data-science": 20, "django-rest": 20,
    "javascript-advanced": 20, "sql-databases": 20, "git-devops": 20, "java-basics": 20,
    "typescript": 20, "golang": 20, "rust-lang": 20, "kotlin": 20,
    "cpp": 20, "php": 20, "ruby": 20, "swift": 20,
}


def _course_modules_and_total(course_id):
    custom_course = CustomCourse.objects.filter(course_id=course_id).first()
    if custom_course:
        modules = custom_course.modules or []
        total = sum(len((module or {}).get("lessons", [])) for module in modules if isinstance(module, dict))
        return custom_course, modules, total
    return None, None, COURSE_TOTALS.get(course_id, 0)


def _valid_lesson_keys(course_id, modules, total):
    if modules is not None:
        return {
            f"{module_index}-{lesson_index}"
            for module_index, module in enumerate(modules)
            for lesson_index, _lesson in enumerate((module or {}).get("lessons", []))
        }
    return {
        f"{module_index}-{lesson_index}"
        for module_index in range(total // 4)
        for lesson_index in range(4)
    }


def has_course_access(user, course_id):
    if user.is_superuser:
        return True
    return CourseAccess.objects.filter(user=user, course_id=course_id).exists()


def _course_dict(c):
    return {
        "id": c.id, "course_id": c.course_id,
        "title": c.title, "description": c.description,
        "icon": c.icon, "color": c.color,
        "level": c.level, "duration": c.duration,
        "skills": c.skills, "modules": c.modules,
        "youtube_playlist": c.youtube_playlist,
        "resource_links": c.resource_links,
        "course_link": c.course_link,
        "created_at": c.created_at,
    }


# ── Course progress & certificate ─────────────────────────────────────────────

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def course_progress(request, course_id):
    if not request.user.has_prep_access and not request.user.is_superuser:
        return Response({"error": "Prep Hub access denied. Contact admin."}, status=403)

    custom_course, modules, total = _course_modules_and_total(course_id)
    if course_id not in VALID_COURSES and not custom_course:
        return Response({"error": "Invalid course."}, status=404)
    if not has_course_access(request.user, course_id):
        return Response({"error": "Course not approved. Contact admin."}, status=403)

    progress, _ = CourseProgress.objects.get_or_create(user=request.user, course_id=course_id)

    if request.method == "GET":
        return Response(CourseProgressSerializer(progress).data)

    completed = request.data.get("completed", {})
    if not isinstance(completed, dict):
        return Response({"error": "completed must be an object."}, status=400)

    import re as _re
    for key in completed:
        if not _re.match(r'^\d+-\d+$', str(key)):
            return Response({"error": f"Invalid lesson key: {key}"}, status=400)
    valid_keys = _valid_lesson_keys(course_id, modules, total)
    for key in completed:
        if key not in valid_keys:
            return Response({"error": f"Lesson key is out of range for this course: {key}"}, status=400)

    done = sum(1 for v in completed.values() if v)
    if done > total and total > 0:
        return Response({"error": "Completed count exceeds course total."}, status=400)

    progress.completed = completed
    progress.save()
    cert_data = None

    if done >= total and total > 0:
        cert, _ = CourseCertificate.objects.get_or_create(
            user=request.user, course_id=course_id,
            defaults={
                "cert_id": f"VDART-{course_id.upper()[:12]}-{request.user.username[:4].upper()}-{uuid.uuid4().hex[:5].upper()}",
                "completed_on": timezone.now().strftime("%d %B %Y").lstrip("0"),
            }
        )
        cert_data = CourseCertificateSerializer(cert).data

    return Response({**CourseProgressSerializer(progress).data, "certificate": cert_data})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def course_certificate(request, course_id):
    is_custom = CustomCourse.objects.filter(course_id=course_id).exists()
    if course_id not in VALID_COURSES and not is_custom:
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

    if request.user.is_superuser:
        approved = set(VALID_COURSES) | set(CustomCourse.objects.values_list("course_id", flat=True))
    else:
        approved = set(CourseAccess.objects.filter(user=request.user).values_list("course_id", flat=True))

    result = {}

    # Built-in courses
    for course_id in VALID_COURSES:
        progress = CourseProgress.objects.filter(user=request.user, course_id=course_id).first()
        cert = CourseCertificate.objects.filter(user=request.user, course_id=course_id).first()
        total = COURSE_TOTALS.get(course_id, 0)
        done = sum(1 for v in (progress.completed if progress else {}).values() if v)
        result[course_id] = {
            "completed": progress.completed if progress else {},
            "done": done, "total": total,
            "pct": round((done / total) * 100) if total else 0,
            "certificate": CourseCertificateSerializer(cert).data if cert else None,
            "approved": course_id in approved,
        }

    # Custom courses
    for cc in CustomCourse.objects.all():
        course_id = cc.course_id
        if course_id in result:
            continue  # already handled as built-in override
        progress = CourseProgress.objects.filter(user=request.user, course_id=course_id).first()
        cert = CourseCertificate.objects.filter(user=request.user, course_id=course_id).first()
        total = sum(len(m.get("lessons", [])) for m in cc.modules)
        done = sum(1 for v in (progress.completed if progress else {}).values() if v)
        result[course_id] = {
            "completed": progress.completed if progress else {},
            "done": done, "total": total,
            "pct": round((done / total) * 100) if total else 0,
            "certificate": CourseCertificateSerializer(cert).data if cert else None,
            "approved": course_id in approved,
        }

    return Response(result)


# ── Admin course access ────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_course_access(request):
    """Return the list of approved course IDs for the current user."""
    if request.user.is_superuser:
        # Admin sees all courses as approved
        from .models import CustomCourse as CC
        all_ids = list(VALID_COURSES) + list(CC.objects.values_list("course_id", flat=True))
        return Response({"approved_courses": all_ids})
    approved = list(CourseAccess.objects.filter(user=request.user).values_list("course_id", flat=True))
    return Response({"approved_courses": approved})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_user_course_access(request, user_id):
    if not request.user.is_superuser:
        return Response({"error": "Forbidden."}, status=403)
    approved = list(CourseAccess.objects.filter(user_id=user_id).values_list("course_id", flat=True))
    return Response({"user_id": user_id, "approved_courses": approved})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_toggle_course_access(request, user_id):
    if not request.user.is_superuser:
        return Response({"error": "Forbidden."}, status=403)
    from django.contrib.auth import get_user_model
    course_id = request.data.get("course_id")
    grant = request.data.get("grant", True)
    all_valid = VALID_COURSES | set(CustomCourse.objects.values_list("course_id", flat=True))
    if course_id not in all_valid:
        return Response({"error": "Invalid course."}, status=400)
    try:
        target = get_user_model().objects.get(pk=user_id)
    except get_user_model().DoesNotExist:
        return Response(status=404)
    if grant:
        CourseAccess.objects.get_or_create(user=target, course_id=course_id)
    else:
        CourseAccess.objects.filter(user=target, course_id=course_id).delete()
    approved = list(CourseAccess.objects.filter(user=target).values_list("course_id", flat=True))
    return Response({"user_id": user_id, "approved_courses": approved})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_approve_all_courses(request, user_id):
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


# ── Custom Course CRUD ─────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_custom_courses(request):
    courses = CustomCourse.objects.all().order_by("-created_at")
    return Response([_course_dict(c) for c in courses])


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_custom_course(request, course_id):
    """Get a single custom course by course_id string — used by LearningPath."""
    try:
        return Response(_course_dict(CustomCourse.objects.get(course_id=course_id)))
    except CustomCourse.DoesNotExist:
        return Response(status=404)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_custom_course(request):
    if not request.user.is_superuser:
        return Response({"error": "Forbidden."}, status=403)
    import re
    title = request.data.get("title", "").strip()
    if not title:
        return Response({"error": "Title is required."}, status=400)

    course_id = request.data.get("course_id")
    if not course_id:
        course_id = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
        if CustomCourse.objects.filter(course_id=course_id).exists():
            course_id = f"{course_id}-{CustomCourse.objects.count() + 1}"
    elif CustomCourse.objects.filter(course_id=course_id).exists():
        return Response({"error": f"Course ID '{course_id}' already exists."}, status=400)

    course = CustomCourse.objects.create(
        course_id=course_id, title=title,
        description=request.data.get("description", ""),
        icon=request.data.get("icon", "📚"),
        color=request.data.get("color", "#2563EB"),
        level=request.data.get("level", "Beginner"),
        duration=request.data.get("duration", "4 hrs"),
        skills=request.data.get("skills", []),
        modules=request.data.get("modules", []),
        youtube_playlist=request.data.get("youtube_playlist", ""),
        resource_links=request.data.get("resource_links", []),
        course_link=request.data.get("course_link", ""),
    )
    return Response(_course_dict(course), status=201)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_custom_course(request, course_id):
    if not request.user.is_superuser:
        return Response({"error": "Forbidden."}, status=403)
    try:
        course = CustomCourse.objects.get(id=course_id)
    except CustomCourse.DoesNotExist:
        return Response(status=404)

    if "title" in request.data:
        title = request.data["title"].strip()
        if not title:
            return Response({"error": "Title is required."}, status=400)
        course.title = title
    for field in ("description", "icon", "color", "level", "duration", "youtube_playlist", "course_link"):
        if field in request.data:
            setattr(course, field, request.data[field])
    if "skills" in request.data:
        s = request.data["skills"]
        course.skills = s if isinstance(s, list) else []
    if "modules" in request.data:
        course.modules = request.data["modules"]
    if "resource_links" in request.data:
        course.resource_links = request.data["resource_links"]
    course.save()
    return Response(_course_dict(course))


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_custom_course(request, course_id):
    if not request.user.is_superuser:
        return Response({"error": "Forbidden."}, status=403)
    try:
        CustomCourse.objects.get(id=course_id).delete()
        return Response(status=204)
    except CustomCourse.DoesNotExist:
        return Response(status=404)


# ── Gemini AI course generator ─────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ai_generate_course(request):
    """Use Gemini AI to generate modules/lessons for a course."""
    if not request.user.is_superuser:
        return Response({"error": "Forbidden."}, status=403)

    import os, json, re
    title       = request.data.get("title", "").strip()
    description = request.data.get("description", "").strip()
    level       = request.data.get("level", "Beginner")
    duration    = request.data.get("duration", "4 hrs")
    skills      = request.data.get("skills", [])

    if not title:
        return Response({"error": "Title is required."}, status=400)

    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or api_key == "your-gemini-api-key":
        return Response({"error": "GEMINI_API_KEY not configured in .env"}, status=503)

    try:
        from google import genai
        client = genai.Client(api_key=api_key)

        prompt = f"""You are a curriculum designer. Generate a structured learning path for a course.

Course: {title}
Level: {level}
Duration: {duration}
Description: {description or 'Not provided'}
Skills: {', '.join(skills) if skills else 'Not specified'}

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{{
  "modules": [
    {{
      "title": "Module Title",
      "lessons": [
        {{"title": "Lesson Title", "duration": "8 min", "type": "coding"}},
        {{"title": "Lesson Title", "duration": "6 min", "type": "reading"}}
      ]
    }}
  ],
  "youtube_search": "best youtube search query for this course"
}}

Rules:
- 4 to 6 modules
- 4 lessons per module
- type must be one of: coding, reading, setup
- duration between 5-12 min
- lessons must be practical and specific to the course topic"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        raw = response.text.strip()
        raw = re.sub(r'^```(?:json)?\s*', '', raw)
        raw = re.sub(r'\s*```$', '', raw)
        data = json.loads(raw)
        return Response({
            "modules": data.get("modules", []),
            "youtube_search": data.get("youtube_search", title),
        })
    except json.JSONDecodeError:
        return Response({"error": "Gemini returned invalid JSON. Try again."}, status=500)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
