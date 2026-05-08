from django.contrib import admin
from .models import CourseProgress, CourseCertificate, CourseAccess

admin.site.register(CourseProgress)
admin.site.register(CourseCertificate)
admin.site.register(CourseAccess)
