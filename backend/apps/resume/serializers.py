from rest_framework import serializers
from .models import Resume, ResumeVersion


class ResumeVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ResumeVersion
        fields = ("version", "filename", "skills", "keywords", "job_titles",
                  "name", "email", "phone", "saved_at")


class ResumeSerializer(serializers.ModelSerializer):
    versions = ResumeVersionSerializer(many=True, read_only=True)

    class Meta:
        model  = Resume
        fields = ("id", "filename", "uploaded_at", "version",
                  "name", "email", "phone",
                  "skills", "job_titles", "keywords",
                  "languages", "frameworks", "tools", "soft_skills",
                  "education", "projects", "years_exp", "versions")
        read_only_fields = fields
