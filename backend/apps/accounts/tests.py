from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from rest_framework.test import APIClient, APITestCase

from apps.accounts.models import PasswordResetToken, User


class PasswordResetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="reset-user",
            email="reset@example.com",
            password="old-password-123",
        )

    def test_reset_password_requires_valid_token(self):
        response = self.client.post(
            "/api/auth/reset-password/",
            {"email": self.user.email, "password": "new-password-123"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(User.objects.get(pk=self.user.pk).check_password("new-password-123"))

    def test_reset_password_uses_single_use_token(self):
        token = PasswordResetToken.objects.create(user=self.user)

        response = self.client.post(
            "/api/auth/reset-password/",
            {"token": str(token.token), "password": "new-password-123"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(User.objects.get(pk=self.user.pk).check_password("new-password-123"))
        token.refresh_from_db()
        self.assertTrue(token.used)

        reuse_response = self.client.post(
            "/api/auth/reset-password/",
            {"token": str(token.token), "password": "another-password-123"},
            format="json",
        )
        self.assertEqual(reuse_response.status_code, 400)
        self.assertFalse(User.objects.get(pk=self.user.pk).check_password("another-password-123"))

    @override_settings(DEBUG=True, EXPOSE_DEBUG_RESET_TOKEN=True)
    def test_forgot_password_returns_debug_token_without_enumerating_unknown_email(self):
        missing_response = self.client.post(
            "/api/auth/forgot-password/",
            {"email": "missing@example.com"},
            format="json",
        )
        self.assertEqual(missing_response.status_code, 200)
        self.assertNotIn("reset_token", missing_response.data)

        response = self.client.post(
            "/api/auth/forgot-password/",
            {"email": self.user.email},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("reset_token", response.data)
        self.assertEqual(PasswordResetToken.objects.filter(user=self.user, used=False).count(), 1)

    def test_legacy_default_reset_endpoints_are_disabled(self):
        validate_response = self.client.post(
            "/api/auth/validate-default-reset-email/",
            {"email": self.user.email},
            format="json",
        )
        reset_response = self.client.post(
            "/api/auth/default-password-reset/",
            {
                "email": self.user.email,
                "default_password": "vdart@#12345",
                "new_password": "new-password-123",
            },
            format="json",
        )

        self.assertEqual(validate_response.status_code, 410)
        self.assertEqual(reset_response.status_code, 410)


class CookieAuthCSRFFlowTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="csrf-user",
            email="csrf@example.com",
            password="old-password-123",
        )
        self.client = APIClient(enforce_csrf_checks=True)

    def test_cookie_auth_requires_csrf_header_for_authenticated_posts(self):
        login_response = self.client.post(
            "/api/auth/login/",
            {"email": self.user.email, "password": "old-password-123"},
            format="json",
        )
        self.assertEqual(login_response.status_code, 200)
        self.assertNotIn("access", login_response.data)
        self.assertNotIn("refresh", login_response.data)

        blocked = self.client.post(
            "/api/auth/change-password/",
            {"current_password": "old-password-123", "new_password": "new-password-456"},
            format="json",
        )
        self.assertEqual(blocked.status_code, 403)

        csrf_token = self.client.cookies["csrftoken"].value
        allowed = self.client.post(
            "/api/auth/change-password/",
            {"current_password": "old-password-123", "new_password": "new-password-456"},
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(allowed.status_code, 200)
        self.assertTrue(User.objects.get(pk=self.user.pk).check_password("new-password-456"))


class AdminBulkCreateUsersTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="password123",
        )
        self.client.force_authenticate(self.admin)

    def test_bulk_create_rejects_non_utf8_csv(self):
        file_obj = SimpleUploadedFile("users.csv", b"\xff\xfe\x00", content_type="text/csv")

        response = self.client.post("/api/auth/admin/users/bulk-create/", {"file": file_obj}, format="multipart")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "CSV files must be UTF-8 encoded.")

    def test_bulk_create_requires_email_column(self):
        file_obj = SimpleUploadedFile(
            "users.csv",
            b"username,password\nalice,password123\n",
            content_type="text/csv",
        )

        response = self.client.post("/api/auth/admin/users/bulk-create/", {"file": file_obj}, format="multipart")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "The uploaded file must include an email column.")

    def test_bulk_delete_users_deletes_regular_users_and_skips_superusers(self):
        user_one = User.objects.create_user(
            username="user-one",
            email="user-one@example.com",
            password="password123",
        )
        user_two = User.objects.create_user(
            username="user-two",
            email="user-two@example.com",
            password="password123",
        )

        response = self.client.post(
            "/api/auth/admin/users/bulk-delete/",
            {"user_ids": [user_one.id, self.admin.id, user_two.id]},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["deleted_count"], 2)
        self.assertEqual(response.data["skipped_count"], 1)
        self.assertFalse(User.objects.filter(id=user_one.id).exists())
        self.assertFalse(User.objects.filter(id=user_two.id).exists())
        self.assertTrue(User.objects.filter(id=self.admin.id).exists())

    def test_bulk_delete_requires_non_empty_list(self):
        response = self.client.post(
            "/api/auth/admin/users/bulk-delete/",
            {"user_ids": []},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "user_ids must be a non-empty list.")
