from rest_framework import exceptions
from rest_framework.authentication import CSRFCheck
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken


class CookieJWTAuthentication(JWTAuthentication):
    def enforce_csrf(self, request):
        check = CSRFCheck(lambda _request: None)
        check.process_request(request)
        reason = check.process_view(request, None, (), {})
        if reason:
            raise exceptions.PermissionDenied(f"CSRF Failed: {reason}")

    def authenticate(self, request):
        token = request.COOKIES.get("access")
        if not token:
            return None
        try:
            validated = AccessToken(token)
            user = self.get_user(validated)
            self.enforce_csrf(request)
            return (user, validated)
        except TokenError:
            return None
