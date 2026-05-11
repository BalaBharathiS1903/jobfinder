from rest_framework import serializers
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = (
            "id", "full_name", "headline", "email", "phone", "location",
            "website", "linkedin", "github", "leetcode", "summary",
            "skills", "experience", "education", "certifications",
            "projects", "languages", "achievements", "updated_at",
        )
        read_only_fields = ("id", "updated_at")
