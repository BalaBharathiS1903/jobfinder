from django.db import models
from apps.accounts.models import User


class CourseAccess(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name="course_access")
    course_id  = models.CharField(max_length=100)
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "course_id")

    def __str__(self):
        return f"{self.user.email} — {self.course_id}"


class CustomCourse(models.Model):
    course_id        = models.CharField(max_length=100, unique=True)
    title            = models.CharField(max_length=255)
    description      = models.TextField(blank=True)
    icon             = models.CharField(max_length=10, default="📚")
    color            = models.CharField(max_length=20, default="#2563EB")
    level            = models.CharField(max_length=50, default="Beginner")
    duration         = models.CharField(max_length=50, default="4 hrs")
    skills           = models.JSONField(default=list)
    modules          = models.JSONField(default=list)
    youtube_playlist = models.CharField(max_length=200, blank=True)
    resource_links   = models.JSONField(default=list)  # [{label, url, color, bg}]
    course_link      = models.URLField(blank=True, default='')
    created_at       = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class CourseProgress(models.Model):
    user      = models.ForeignKey(User, on_delete=models.CASCADE, related_name="course_progress")
    course_id = models.CharField(max_length=100)
    completed = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "course_id")

    def __str__(self):
        return f"{self.user.email} — {self.course_id}"


class CourseCertificate(models.Model):
    user         = models.ForeignKey(User, on_delete=models.CASCADE, related_name="certificates")
    course_id    = models.CharField(max_length=100)
    cert_id      = models.CharField(max_length=100, unique=True)
    completed_on = models.CharField(max_length=60)
    issued_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "course_id")

    def __str__(self):
        return f"{self.cert_id}"
