import base64
import binascii
import uuid
from django.core.files.base import ContentFile
from rest_framework import serializers
from .models import UserProfile


class Base64ImageField(serializers.ImageField):
    max_upload_size = 5 * 1024 * 1024
    allowed_extensions = {"jpg", "jpeg", "png", "webp", "gif"}

    def to_internal_value(self, data):
        if isinstance(data, str):
            if data == "":
                return None
            if data.startswith("data:"):
                try:
                    header, imgstr = data.split(";base64,")
                except ValueError:
                    raise serializers.ValidationError("Invalid image data.")
                try:
                    decoded_file = base64.b64decode(imgstr, validate=True)
                except (TypeError, ValueError, binascii.Error):
                    raise serializers.ValidationError("Invalid base64 image.")
                file_ext = header.split("/")[-1].split(";")[0]
                if file_ext == "jpeg":
                    file_ext = "jpg"
                if file_ext not in self.allowed_extensions:
                    raise serializers.ValidationError("Unsupported image type.")
                if len(decoded_file) > self.max_upload_size:
                    raise serializers.ValidationError("Image file too large. Maximum size is 5 MB.")
                file_name = f"{uuid.uuid4().hex}.{file_ext}"
                data = ContentFile(decoded_file, name=file_name)
        return super().to_internal_value(data)

    def to_representation(self, value):
        if not value:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(value.url)
        return value.url if hasattr(value, 'url') else str(value)


class UserProfileSerializer(serializers.ModelSerializer):
    photo = Base64ImageField(required=False, allow_null=True)

    class Meta:
        model = UserProfile
        fields = (
            "id", "full_name", "headline", "email", "phone", "location",
            "website", "linkedin", "github", "leetcode", "summary",
            "photo", "skills", "experience", "education", "certifications",
            "projects", "languages", "achievements", "updated_at",
        )
        read_only_fields = ("id", "updated_at")
