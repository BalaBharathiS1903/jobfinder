from django.db import models
from apps.accounts.models import User

class Resume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="resumes")
    file = models.FileField(upload_to="resumes/")
    filename = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    version = models.PositiveIntegerField(default=1)

    name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    skills = models.JSONField(default=list)
    job_titles = models.JSONField(default=list)
    keywords = models.JSONField(default=list)
    raw_text = models.TextField(blank=True)
    summary = models.TextField(blank=True)

    languages = models.JSONField(default=list)
    frameworks = models.JSONField(default=list)
    tools = models.JSONField(default=list)
    soft_skills = models.JSONField(default=list)
    education = models.CharField(max_length=100, blank=True)
    projects = models.JSONField(default=list)
    years_exp = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.email} — {self.filename} (v{self.version})"


class ResumeVersion(models.Model):
    """Snapshot saved before each re-parse or replace."""
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="versions")
    version = models.PositiveIntegerField()
    filename = models.CharField(max_length=255)
    skills = models.JSONField(default=list)
    keywords = models.JSONField(default=list)
    job_titles = models.JSONField(default=list)
    name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-version"]

    def __str__(self):
        return f"{self.resume.filename} v{self.version}"
