from django.db import models
from apps.accounts.models import User


class CourseProgress(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name="course_progress")
    course_id  = models.CharField(max_length=100)
    completed  = models.JSONField(default=dict)   # {"0-0": true, "0-1": true, ...}
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
