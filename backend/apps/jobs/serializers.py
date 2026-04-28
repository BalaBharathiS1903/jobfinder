from rest_framework import serializers
from .models import JobSearch, SavedJob

class JobSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobSearch
        fields = ("id", "query", "location", "results", "searched_at")
        read_only_fields = fields

class SavedJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedJob
        fields = ("id", "job_id", "title", "company", "location", "url", "saved_at")
        read_only_fields = ("id", "saved_at")
