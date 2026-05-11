from django.contrib import admin
from .models import CourseProgress, CourseCertificate, CourseAccess, CustomCourse

admin.site.register(CourseProgress)
admin.site.register(CourseCertificate)
admin.site.register(CourseAccess)
admin.site.register(CustomCourse)
