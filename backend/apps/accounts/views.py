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
    from apps.accounts.models import User
    email = request.data.get("email", "")
    password = request.data.get("password", "")
    try:
        user_obj = User.objects.get(email=email)
        user = authenticate(request, username=user_obj.username, password=password)
    except User.DoesNotExist:
        # Still run a dummy check to prevent timing-based email enumeration
        User().check_password(password)
        user = None
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
    token = request.COOKIES.get("refresh")
    if not token:
        return Response({"error": "No refresh token."}, status=401)
    try:
        refresh = RefreshToken(token)
        resp = Response({"detail": "Refreshed."})
        _set_auth_cookies(resp, str(refresh.access_token), str(refresh))
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
