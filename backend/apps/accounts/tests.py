from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase

from apps.accounts.models import User


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
