from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.courses.models import CourseAccess, CustomCourse


class CourseProgressTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="learner",
            email="learner@example.com",
            password="password123",
            has_prep_access=True,
        )
        self.client.force_authenticate(self.user)

    def test_builtin_course_rejects_out_of_range_lesson_key(self):
        CourseAccess.objects.create(user=self.user, course_id="python-basics")

        response = self.client.post(
            "/api/courses/progress/python-basics/",
            {"completed": {"5-0": True}},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("out of range", response.data["error"])

    def test_custom_course_rejects_unknown_lesson_key(self):
        CustomCourse.objects.create(
            course_id="custom-course",
            title="Custom Course",
            modules=[
                {
                    "title": "Module 1",
                    "lessons": [{"title": "Intro", "duration": "5 min", "type": "reading"}],
                }
            ],
        )
        CourseAccess.objects.create(user=self.user, course_id="custom-course")

        response = self.client.post(
            "/api/courses/progress/custom-course/",
            {"completed": {"0-1": True}},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("out of range", response.data["error"])
