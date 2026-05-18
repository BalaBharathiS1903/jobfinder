from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.jobs.models import JobSearch
from apps.profile.models import UserProfile
from apps.resume.models import Resume


def _job(job_id, title, description):
    return {
        "id": job_id,
        "title": title,
        "company": "Acme",
        "location": "Remote",
        "url": "https://example.com/jobs/" + job_id,
        "description": description,
        "source": "mock",
    }


class JobSearchEndpointTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="tester",
            email="tester@example.com",
            password="password123",
            job_search_limit=3,
        )
        self.client.force_authenticate(self.user)

    def create_resume(self, *, skills=None, job_titles=None, filename="resume.txt"):
        file_obj = SimpleUploadedFile(filename, b"sample resume")
        return Resume.objects.create(
            user=self.user,
            file=file_obj,
            filename=filename,
            skills=skills or [],
            job_titles=job_titles or [],
        )

    @patch("apps.jobs.views.rank_jobs")
    @patch("apps.jobs.views.analyze_jobs_trust")
    @patch("apps.jobs.views.fetch_jobs")
    def test_search_uses_resume_role_and_logs_results(self, mock_fetch, mock_trust, mock_rank):
        resume = self.create_resume(skills=["React"], job_titles=["Intern"])
        jobs = [_job("1", "Frontend Developer", "React role")]
        ranked_jobs = [{**jobs[0], "match_score": 91, "trust_label": "Verified"}]
        mock_fetch.return_value = jobs
        mock_trust.return_value = jobs
        mock_rank.return_value = ranked_jobs

        response = self.client.post(
            "/api/jobs/search/",
            {"query": "", "resume_id": resume.id, "location": "Remote", "country": "us"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(JobSearch.objects.count(), 1)
        search = JobSearch.objects.get()
        self.assertEqual(search.query, "frontend developer")
        self.assertEqual(search.location, "Remote")
        self.assertEqual(search.results[0]["match_score"], 91)
        mock_fetch.assert_called_once_with("frontend developer", "Remote", "us")

    @patch("apps.jobs.views.fetch_jobs")
    def test_auto_search_respects_daily_limit(self, mock_fetch):
        self.user.job_search_limit = 1
        self.user.save(update_fields=["job_search_limit"])
        self.create_resume(skills=["Python"])
        JobSearch.objects.create(user=self.user, query="existing", location="", results=[])

        response = self.client.post(
            "/api/jobs/auto-search/",
            {"resume_id": Resume.objects.get().id, "location": "Remote", "country": "us"},
            format="json",
        )

        self.assertEqual(response.status_code, 429)
        self.assertIn("Daily job search limit", response.data["error"])
        mock_fetch.assert_not_called()

    @patch("apps.jobs.views.rank_jobs")
    @patch("apps.jobs.views.analyze_jobs_trust")
    @patch("apps.jobs.views.fetch_jobs")
    def test_auto_search_logs_ranked_results(self, mock_fetch, mock_trust, mock_rank):
        resume = self.create_resume(skills=["Python", "Django"])

        def fetch_side_effect(query, location, country):
            return [_job(query, f"{query.title()} Engineer", f"{query} backend role")]

        ranked_jobs = [{**_job("python", "Python Engineer", "python backend role"), "match_score": 88, "trust_label": "Verified"}]
        mock_fetch.side_effect = fetch_side_effect
        mock_trust.side_effect = lambda jobs: jobs
        mock_rank.return_value = ranked_jobs

        response = self.client.post(
            "/api/jobs/auto-search/",
            {"resume_id": resume.id, "location": "Bengaluru", "country": "in"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["query"], "python, django")
        self.assertEqual(JobSearch.objects.count(), 1)
        search = JobSearch.objects.get()
        self.assertEqual(search.query, "python, django")
        self.assertEqual(search.results[0]["trust_label"], "Verified")

    @patch("apps.jobs.views.analyze_jobs_trust")
    @patch("apps.jobs.views.fetch_jobs")
    def test_profile_search_logs_and_ranks_against_profile_skills(self, mock_fetch, mock_trust):
        UserProfile.objects.create(
            user=self.user,
            headline="Backend Developer | Django",
            skills=[{"name": "Python"}, {"name": "Django"}],
        )
        jobs = [_job("2", "Backend Developer", "Python Django APIs")]
        mock_fetch.return_value = jobs
        mock_trust.return_value = jobs

        response = self.client.post(
            "/api/jobs/profile-search/",
            {"location": "Hyderabad", "country": "in"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["query"], "Backend Developer Python Django")
        self.assertEqual(JobSearch.objects.count(), 1)
        search = JobSearch.objects.get()
        self.assertEqual(search.query, "Backend Developer Python Django")
        self.assertEqual(search.results[0]["match_score"], 100)

