from django.urls import path
from .views import my_profile, admin_update_user_profile

urlpatterns = [
    path("", my_profile),
    path("admin/<int:user_id>/", admin_update_user_profile),
]
