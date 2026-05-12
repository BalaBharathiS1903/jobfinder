from django.urls import path
from .views import (
    course_progress, course_certificate, all_progress,
    my_course_access,
    admin_user_course_access, admin_toggle_course_access, admin_approve_all_courses,
    list_custom_courses, get_custom_course, create_custom_course,
    update_custom_course, delete_custom_course, ai_generate_course,
)

urlpatterns = [
    path("progress/",                        all_progress),
    path("progress/<str:course_id>/",        course_progress),
    path("certificate/<str:course_id>/",     course_certificate),
    path("my-access/",                       my_course_access),
    path("admin/<int:user_id>/access/",      admin_user_course_access),
    path("admin/<int:user_id>/toggle/",      admin_toggle_course_access),
    path("admin/<int:user_id>/approve-all/", admin_approve_all_courses),
    path("custom/",                          list_custom_courses),
    path("custom/create/",                   create_custom_course),
    path("custom/ai-generate/",              ai_generate_course),
    path("custom/<str:course_id>/detail/",   get_custom_course),
    path("custom/<int:course_id>/edit/",     update_custom_course),
    path("custom/<int:course_id>/delete/",   delete_custom_course),
]
