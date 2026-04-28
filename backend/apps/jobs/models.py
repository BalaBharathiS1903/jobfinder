from django.db import models
from apps.accounts.models import User

class JobSearch(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="job_searches")
    query = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    results = models.JSONField(default=list)
    searched_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} — {self.query}"

class SavedJob(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="saved_jobs")
    job_id = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    url = models.URLField(blank=True)
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "job_id")

    def __str__(self):
        return f"{self.user.email} — {self.title}"
