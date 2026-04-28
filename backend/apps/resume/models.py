from django.db import models
from apps.accounts.models import User

class Resume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="resumes")
    file = models.FileField(upload_to="resumes/")
    filename = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    # Parsed fields
    name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    skills = models.JSONField(default=list)
    job_titles = models.JSONField(default=list)
    keywords = models.JSONField(default=list)
    raw_text = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.email} — {self.filename}"
