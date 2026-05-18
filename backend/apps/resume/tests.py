from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.resume.models import Resume, ResumeVersion


def _parsed_resume(raw_text="Readable resume text"):
    return {
        "raw_text": raw_text,
        "name": "Test User",
        "email": "test@example.com",
        "phone": "9999999999",
        "summary": "Summary",
        "skills": ["python"],
        "job_titles": ["software developer"],
        "keywords": ["python"],
        "languages": ["python"],
        "frameworks": [],
        "tools": [],
        "soft_skills": [],
        "education": "Bachelor's Degree",
        "projects": ["Project One"],
        "years_exp": 2,
    }


class ResumeFlowTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="resume-user",
            email="resume@example.com",
            password="password123",
        )
        self.client.force_authenticate(self.user)

    @patch("apps.resume.views.parse_resume")
    def test_upload_rejects_unreadable_resume(self, mock_parse_resume):
        mock_parse_resume.return_value = _parsed_resume(raw_text="")
        file_obj = SimpleUploadedFile("resume.pdf", b"fake-pdf", content_type="application/pdf")

        response = self.client.post("/api/resume/upload/", {"file": file_obj}, format="multipart")

        self.assertEqual(response.status_code, 400)
        self.assertIn("Could not extract readable text", response.data["error"])
        self.assertEqual(Resume.objects.count(), 0)

    @patch("apps.resume.views.parse_resume")
    def test_replace_does_not_save_version_when_new_file_is_unreadable(self, mock_parse_resume):
        resume = Resume.objects.create(
            user=self.user,
            file=SimpleUploadedFile("existing.txt", b"existing text"),
            filename="existing.txt",
            version=1,
            raw_text="Existing text",
        )
        mock_parse_resume.return_value = _parsed_resume(raw_text="")
        replacement = SimpleUploadedFile("replacement.pdf", b"fake-pdf", content_type="application/pdf")

        response = self.client.post(f"/api/resume/{resume.id}/replace/", {"file": replacement}, format="multipart")

        self.assertEqual(response.status_code, 400)
        resume.refresh_from_db()
        self.assertEqual(resume.version, 1)
        self.assertEqual(ResumeVersion.objects.count(), 0)

    def test_save_from_builder_requires_content(self):
        response = self.client.post("/api/resume/save-from-builder/", {}, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Add some resume details before saving.")
