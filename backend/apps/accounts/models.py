from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
from django.utils import timezone
from datetime import timedelta

class User(AbstractUser):
    email = models.EmailField(unique=True)
    has_prep_access = models.BooleanField(default=False)
    resume_upload_limit = models.PositiveIntegerField(default=5)
    job_search_limit = models.PositiveIntegerField(default=15)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]


class PasswordResetToken(models.Model):
    user  = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reset_tokens")
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    def is_valid(self):
        return not self.used and timezone.now() < self.created_at + timedelta(hours=1)

    def __str__(self):
        return f"{self.user.email} — {self.token}"
