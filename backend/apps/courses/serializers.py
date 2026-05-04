from rest_framework import serializers
from .models import CourseProgress, CourseCertificate


class CourseProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CourseProgress
        fields = ("course_id", "completed", "updated_at")
        read_only_fields = ("updated_at",)


class CourseCertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CourseCertificate
        fields = ("course_id", "cert_id", "completed_on", "issued_at")
        read_only_fields = ("cert_id", "completed_on", "issued_at")
