from django.urls import path
from .views import (
    RegisterView, MeView, login_view, refresh_view, logout_view,
    forgot_password_view, reset_password_view,
    admin_users_list, admin_user_update, admin_user_delete,
)

urlpatterns = [
    path("register/",        RegisterView.as_view()),
    path("login/",           login_view),
    path("refresh/",         refresh_view),
    path("logout/",          logout_view),
    path("me/",              MeView.as_view()),
    path("forgot-password/", forgot_password_view),
    path("reset-password/",  reset_password_view),
    # superadmin
    path("admin/users/",          admin_users_list),
    path("admin/users/<int:pk>/",  admin_user_update),
    path("admin/users/<int:pk>/delete/", admin_user_delete),
]
