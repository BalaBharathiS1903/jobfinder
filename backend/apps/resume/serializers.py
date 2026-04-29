from rest_framework import serializers
from .models import Resume

class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ("id", "filename", "uploaded_at", "name", "email", "phone",
                  "skills", "job_titles", "keywords", "languages", "frameworks",
                  "tools", "soft_skills", "education", "projects", "years_exp")
        read_only_fields = fields

class ResumeUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True)

    class Meta:
        model = Resume
        fields = ("file",)
