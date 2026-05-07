from django.urls import path
from .views import (
    RegisterView, MeView, login_view, refresh_view, logout_view,
    forgot_password_view, reset_password_view,
    my_activity,
    admin_users_list, admin_create_user, admin_user_detail,
    admin_user_update, admin_user_delete,
)

urlpatterns = [
    path("login/",           login_view),
    path("refresh/",         refresh_view),
    path("logout/",          logout_view),
    path("me/",              MeView.as_view()),
    path("my-activity/",     my_activity),
    path("forgot-password/", forgot_password_view),
    path("reset-password/",  reset_password_view),
    # admin
    path("admin/users/",                    admin_users_list),
    path("admin/users/create/",             admin_create_user),
    path("admin/users/<int:pk>/",           admin_user_update),
    path("admin/users/<int:pk>/detail/",    admin_user_detail),
    path("admin/users/<int:pk>/delete/",    admin_user_delete),
]
