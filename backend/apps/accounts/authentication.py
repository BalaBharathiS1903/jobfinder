from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken


class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        token = request.COOKIES.get("access")
        if not token:
            return None
        try:
            validated = AccessToken(token)
            user = self.get_user(validated)
            return (user, validated)
        except TokenError:
            return None
