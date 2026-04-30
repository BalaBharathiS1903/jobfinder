from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/resume/", include("apps.resume.urls")),
    path("api/jobs/", include("apps.jobs.urls")),
    path("api/profile/", include("apps.profile.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
