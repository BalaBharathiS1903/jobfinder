from django.db import models
from apps.accounts.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    # Personal
    full_name = models.CharField(max_length=255, blank=True)
    headline = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    location = models.CharField(max_length=255, blank=True)
    website = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    github = models.URLField(blank=True)
    leetcode = models.URLField(blank=True)
    summary = models.TextField(blank=True)
    photo = models.ImageField(upload_to="profile_photos/", blank=True, null=True)
    # JSON sections
    skills = models.JSONField(default=list)
    experience = models.JSONField(default=list)
    education = models.JSONField(default=list)
    certifications = models.JSONField(default=list)
    projects = models.JSONField(default=list)
    languages = models.JSONField(default=list)
    achievements = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} profile"
