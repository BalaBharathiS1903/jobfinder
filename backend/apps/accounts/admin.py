from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import AuthenticationForm
from django import forms
from .models import User


class EmailAuthenticationForm(AuthenticationForm):
    """Custom login form that uses email instead of username."""
    username = forms.EmailField(label="Email", widget=forms.EmailInput(attrs={"autofocus": True}))


class UserAdmin(BaseUserAdmin):
    ordering = ["email"]
    list_display = ["email", "username", "is_staff", "is_superuser", "is_active", "has_prep_access"]
    list_filter = ["is_staff", "is_superuser", "is_active", "has_prep_access"]
    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "has_prep_access", "groups", "user_permissions")}),
        ("Limits", {"fields": ("resume_upload_limit", "job_search_limit")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "username", "password1", "password2", "is_staff", "is_superuser", "has_prep_access"),
        }),
    )


admin.site.login_form = EmailAuthenticationForm
admin.site.login_template = "admin/login.html"
admin.site.register(User, UserAdmin)
