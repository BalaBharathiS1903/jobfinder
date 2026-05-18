from django.urls import path
from .views import (
    RegisterView, MeView, login_view, refresh_view, logout_view,
    forgot_password_view, validate_default_reset_email_view,
    reset_password_view, default_password_reset_view, change_password_view,
    my_activity,
    admin_users_list, admin_create_user, admin_user_detail,
    admin_bulk_create_users, admin_user_update, admin_user_delete,
)

urlpatterns = [
    path("register/",        RegisterView.as_view()),
    path("login/",           login_view),
    path("refresh/",         refresh_view),
    path("logout/",          logout_view),
    path("me/",              MeView.as_view()),
    path("my-activity/",     my_activity),
    path("forgot-password/", forgot_password_view),
    path("validate-default-reset-email/", validate_default_reset_email_view),
    path("reset-password/",  reset_password_view),
    path("default-password-reset/", default_password_reset_view),
    path("change-password/", change_password_view),
    # admin
    path("admin/users/",                    admin_users_list),
    path("admin/users/create/",             admin_create_user),
    path("admin/users/bulk-create/",        admin_bulk_create_users),
    path("admin/users/<int:pk>/",           admin_user_update),
    path("admin/users/<int:pk>/detail/",    admin_user_detail),
    path("admin/users/<int:pk>/delete/",    admin_user_delete),
]
