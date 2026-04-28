from django.urls import path
from .views import ResumeListView, ResumeDetailView, upload_resume, reparse_resume

urlpatterns = [
    path("", ResumeListView.as_view()),
    path("upload/", upload_resume),
    path("<int:pk>/", ResumeDetailView.as_view()),
    path("<int:pk>/reparse/", reparse_resume),
]
