from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from .serializers import RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


def _set_auth_cookies(response, access, refresh):
    secure = not settings.DEBUG
    response.set_cookie("access", access, httponly=True, secure=secure, samesite="Lax", max_age=3600)
    response.set_cookie("refresh", refresh, httponly=True, secure=secure, samesite="Lax", max_age=604800)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    from django.contrib.auth import authenticate
    email = request.data.get("email", "").strip()
    password = request.data.get("password", "")
    user = authenticate(request, email=email, password=password)
    if not user:
        return Response({"error": "Invalid credentials."}, status=401)
    refresh = RefreshToken.for_user(user)
    resp = Response({
        "detail": "Login successful.",
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    })
    _set_auth_cookies(resp, str(refresh.access_token), str(refresh))
    return resp


@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_view(request):
    token = request.COOKIES.get("refresh") or request.data.get("refresh", "")
    if not token:
        return Response({"error": "No refresh token."}, status=401)
    try:
        refresh = RefreshToken(token)
        access = str(refresh.access_token)
        resp = Response({"detail": "Refreshed.", "access": access})
        _set_auth_cookies(resp, access, str(refresh))
        return resp
    except TokenError:
        return Response({"error": "Invalid or expired refresh token."}, status=401)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    resp = Response({"detail": "Logged out."})
    resp.delete_cookie("access")
    resp.delete_cookie("refresh")
    return resp


@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password_view(request):
    email = request.data.get("email", "").strip().lower()
    if not email:
        return Response({"error": "Email is required."}, status=400)
    try:
        validate_email(email)
    except ValidationError:
        return Response({"error": "Enter a valid email address."}, status=400)
    from apps.accounts.models import User
    if not User.objects.filter(email__iexact=email).exists():
        return Response({"error": "Email not found."}, status=404)
    return Response({"detail": "Email validated. You can now reset your password."})


@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password_view(request):
    from apps.accounts.models import User
    email = request.data.get("email", "").strip().lower()
    new_password = request.data.get("password", "")
    if not email or not new_password:
        return Response({"error": "Email and password are required."}, status=400)
    try:
        validate_email(email)
    except ValidationError:
        return Response({"error": "Enter a valid email address."}, status=400)
    if len(new_password) < 8:
        return Response({"error": "Password must be at least 8 characters."}, status=400)
    try:
        user = User.objects.get(email__iexact=email)
        user.set_password(new_password)
        user.save()
    except User.DoesNotExist:
        pass
    return Response({"detail": "If that email exists, the password has been updated."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    current_password = request.data.get("current_password", "")
    new_password = request.data.get("new_password", "")
    if not current_password or not new_password:
        return Response({"error": "Current and new password are required."}, status=400)
    user = request.user
    if not user.check_password(current_password):
        return Response({"error": "Current password is incorrect."}, status=400)
    if len(new_password) < 8:
        return Response({"error": "New password must be at least 8 characters."}, status=400)
    user.set_password(new_password)
    user.save()
    return Response({"detail": "Password changed successfully."})


# ── User activity endpoint ───────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_activity(request):
    from apps.resume.models import Resume, ResumeVersion
    from apps.resume.serializers import ResumeSerializer
    from apps.jobs.models import JobSearch, SavedJob
    user = request.user

    resumes = Resume.objects.filter(user=user).order_by("-uploaded_at")
    resume_data = ResumeSerializer(resumes, many=True).data

    # Per-resume reparse/replace history count
    for r in resume_data:
        r["version_count"] = ResumeVersion.objects.filter(resume_id=r["id"]).count()

    job_searches = list(
        JobSearch.objects.filter(user=user).order_by("-searched_at")
        .values("id", "query", "location", "searched_at")
    )

    saved_jobs = list(
        SavedJob.objects.filter(user=user).order_by("-saved_at")
        .values("id", "title", "company", "location", "url", "saved_at")
    )

    # Daily job search count (today)
    from django.utils import timezone
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    daily_search_count = JobSearch.objects.filter(user=user, searched_at__gte=today_start).count()

    # Course progress
    from apps.courses.models import CourseProgress, CourseCertificate
    course_progress_qs = CourseProgress.objects.filter(user=user)
    course_progress = []
    for cp in course_progress_qs:
        completed_count = sum(1 for v in cp.completed.values() if v)
        course_progress.append({
            "course_id": cp.course_id,
            "completed_lessons": completed_count,
            "updated_at": cp.updated_at,
        })
    certificates = list(
        CourseCertificate.objects.filter(user=user)
        .values("course_id", "cert_id", "completed_on", "issued_at")
    )

    return Response({
        "limits": {
            "resume_upload_limit": user.resume_upload_limit,
            "job_search_limit": user.job_search_limit,
        },
        "resume_count": resumes.count(),
        "resumes": resume_data,
        "job_search_total": len(job_searches),
        "job_search_today": daily_search_count,
        "job_searches": job_searches,
        "saved_jobs_count": len(saved_jobs),
        "saved_jobs": saved_jobs,
        "course_progress": course_progress,
        "certificates": certificates,
    })


# ── Admin endpoints ───────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_users_list(request):
    if not request.user.is_superuser:
        return Response({"error": "Forbidden."}, status=403)
    from django.contrib.auth import get_user_model
    users = get_user_model().objects.all().order_by("-date_joined")
    return Response(UserSerializer(users, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_create_user(request):
    if not request.user.is_superuser:
        return Response({"error": "Forbidden."}, status=403)
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(UserSerializer(user).data, status=201)
    return Response(serializer.errors, status=400)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_user_detail(request, pk):
    """Full user data: account + profile + resumes + activity."""
    if not request.user.is_superuser:
        return Response({"error": "Forbidden."}, status=403)
    from django.contrib.auth import get_user_model
    from apps.profile.models import UserProfile
    from apps.profile.serializers import UserProfileSerializer
    from apps.resume.models import Resume
    from apps.resume.serializers import ResumeSerializer
    from apps.jobs.models import JobSearch, SavedJob
    try:
        target = get_user_model().objects.get(pk=pk)
    except get_user_model().DoesNotExist:
        return Response(status=404)
    profile = None
    try:
        profile = UserProfileSerializer(target.profile, context={'request': request}).data
    except UserProfile.DoesNotExist:
        pass
    resumes = ResumeSerializer(Resume.objects.filter(user=target).order_by("-uploaded_at"), many=True).data
    job_searches = list(JobSearch.objects.filter(user=target).order_by("-searched_at").values("query", "location", "searched_at")[:20])
    saved_jobs = list(SavedJob.objects.filter(user=target).order_by("-saved_at").values("title", "company", "location", "saved_at")[:20])
    return Response({
        "user": UserSerializer(target).data,
        "profile": profile,
        "resumes": resumes,
        "job_searches": job_searches,
        "saved_jobs": saved_jobs,
    })


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def admin_user_update(request, pk):
    if not request.user.is_superuser:
        return Response({"error": "Forbidden."}, status=403)
    from django.contrib.auth import get_user_model
    try:
        target = get_user_model().objects.get(pk=pk)
    except get_user_model().DoesNotExist:
        return Response(status=404)
    if target.is_superuser and target != request.user:
        return Response({"error": "Cannot modify other superadmin accounts."}, status=400)
    if target == request.user and "is_active" in request.data:
        return Response({"error": "Cannot deactivate yourself."}, status=400)

    if "username" in request.data:
        username = request.data.get("username", "").strip()
        if not username:
            return Response({"username": "Username cannot be blank."}, status=400)
        if username.lower() != target.username.lower() and get_user_model().objects.filter(username__iexact=username).exclude(pk=target.pk).exists():
            return Response({"username": "This username is already taken."}, status=400)
        target.username = username

    if "email" in request.data:
        email = request.data.get("email", "").strip().lower()
        if not email:
            return Response({"email": "Email cannot be blank."}, status=400)
        try:
            validate_email(email)
        except ValidationError:
            return Response({"email": "Enter a valid email address."}, status=400)
        if email != target.email.lower() and get_user_model().objects.filter(email__iexact=email).exclude(pk=target.pk).exists():
            return Response({"email": "An account with this email already exists."}, status=400)
        target.email = email

    for field in ("is_active", "has_prep_access", "resume_upload_limit", "job_search_limit"):
        if field in request.data:
            setattr(target, field, request.data[field])
    target.save()
    return Response(UserSerializer(target).data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def admin_user_delete(request, pk):
    if not request.user.is_superuser:
        return Response({"error": "Forbidden."}, status=403)
    from django.contrib.auth import get_user_model
    try:
        target = get_user_model().objects.get(pk=pk)
    except get_user_model().DoesNotExist:
        return Response(status=404)
    if target.is_superuser:
        return Response({"error": "Cannot delete superadmin accounts."}, status=400)
    target.delete()
    return Response(status=204)
