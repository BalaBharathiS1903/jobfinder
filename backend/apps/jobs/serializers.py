from rest_framework import serializers
from .models import SavedJob


class SavedJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedJob
        fields = ("id", "job_id", "title", "company", "location", "url", "saved_at")
        read_only_fields = ("id", "saved_at")
