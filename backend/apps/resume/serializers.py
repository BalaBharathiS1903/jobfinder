from rest_framework import serializers
from .models import Resume, ResumeVersion


class ResumeVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ResumeVersion
        fields = ("version", "filename", "skills", "keywords", "job_titles",
                  "name", "email", "phone", "saved_at")


class ResumeSerializer(serializers.ModelSerializer):
    versions = ResumeVersionSerializer(many=True, read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model  = Resume
        fields = ("id", "filename", "uploaded_at", "version",
                  "name", "email", "phone", "summary",
                  "skills", "job_titles", "keywords",
                  "languages", "frameworks", "tools", "soft_skills",
                  "education", "projects", "years_exp", "versions", "file_url")
        read_only_fields = fields

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
