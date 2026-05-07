from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.conf import settings
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
    response.set_cookie(
        "access", access,
        httponly=True, secure=secure, samesite="Lax",
        max_age=60 * 60,          # 1 hour
    )
    response.set_cookie(
        "refresh", refresh,
        httponly=True, secure=secure, samesite="Lax",
        max_age=60 * 60 * 24 * 7, # 7 days
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    from django.contrib.auth import authenticate
    email = request.data.get("email", "").strip()
    password = request.data.get("password", "")
    # USERNAME_FIELD is email, so authenticate with email directly
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
    # Accept token from cookie OR request body (frontend uses localStorage)
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
    from apps.accounts.models import User, PasswordResetToken
    email = request.data.get("email", "").strip().lower()
    if not email:
        return Response({"error": "Email is required."}, status=400)
    try:
        user = User.objects.get(email__iexact=email)
        # Invalidate old tokens
        PasswordResetToken.objects.filter(user=user, used=False).update(used=True)
        # Create new token
        token_obj = PasswordResetToken.objects.create(user=user)
        return Response({
            "detail": "Reset token generated.",
            "token": str(token_obj.token),
            "email": user.email,
        })
    except User.DoesNotExist:
        # Don't reveal if email exists — return success anyway
        return Response({"detail": "If that email exists, a reset token has been generated."}, status=200)


@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password_view(request):
    from apps.accounts.models import PasswordResetToken
    token_str = request.data.get("token", "").strip()
    new_password = request.data.get("password", "")
    if not token_str or not new_password:
        return Response({"error": "Token and password are required."}, status=400)
    if len(new_password) < 8:
        return Response({"error": "Password must be at least 8 characters."}, status=400)
    try:
        token_obj = PasswordResetToken.objects.get(token=token_str)
        if not token_obj.is_valid():
            return Response({"error": "Token is invalid or expired."}, status=400)
        user = token_obj.user
        user.set_password(new_password)
        user.save()
        token_obj.used = True
        token_obj.save()
        return Response({"detail": "Password reset successful. You can now log in."})
    except PasswordResetToken.DoesNotExist:
        return Response({"error": "Invalid token."}, status=400)


# ── Superadmin endpoints ──────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_users_list(request):
    if not request.user.is_superuser:
        return Response({"error": "Forbidden."}, status=403)
    from django.contrib.auth import get_user_model
    User = get_user_model()
    # Return ALL users including staff
    users = User.objects.all().order_by("-date_joined")
    return Response(UserSerializer(users, many=True).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def admin_user_update(request, pk):
    if not request.user.is_superuser:
        return Response({"error": "Forbidden."}, status=403)
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        target = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=404)
    if target.is_superuser and target != request.user:
        return Response({"error": "Cannot modify other superadmin accounts."}, status=400)
    if target == request.user and "is_active" in request.data:
        return Response({"error": "Cannot deactivate yourself."}, status=400)
    for field in ("is_active", "has_prep_access"):
        if field in request.data:
            setattr(target, field, bool(request.data[field]))
    target.save()
    return Response(UserSerializer(target).data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def admin_user_delete(request, pk):
    if not request.user.is_superuser:
        return Response({"error": "Forbidden."}, status=403)
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        target = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=404)
    if target.is_superuser:
        return Response({"error": "Cannot delete superadmin accounts."}, status=400)
    target.delete()
    return Response(status=204)
