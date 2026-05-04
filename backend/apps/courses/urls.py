from django.urls import path
from .views import course_progress, course_certificate, all_progress

urlpatterns = [
    path("progress/",                    all_progress),
    path("progress/<str:course_id>/",    course_progress),
    path("certificate/<str:course_id>/", course_certificate),
]
