from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from rest_framework.test import APITestCase

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

    @override_settings(DEBUG=True)
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
