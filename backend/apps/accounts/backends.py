from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, email=None, **kwargs):
        UserModel = get_user_model()
        # Accept either email= or username= (Django admin passes username=)
        login_email = email or username
        if not login_email or not password:
            return None
        try:
            user = UserModel.objects.get(email__iexact=login_email)
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
        except UserModel.DoesNotExist:
            return None
