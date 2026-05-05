from django.urls import path
from .views import RegisterView, MeView, login_view, refresh_view, logout_view, forgot_password_view, reset_password_view

urlpatterns = [
    path("register/",       RegisterView.as_view()),
    path("login/",          login_view),
    path("refresh/",        refresh_view),
    path("logout/",         logout_view),
    path("me/",             MeView.as_view()),
    path("forgot-password/", forgot_password_view),
    path("reset-password/",  reset_password_view),
]
