from django.urls import path
from .views import search_jobs, search_history, auto_search, resume_search_query, job_detail, SavedJobListCreateView, SavedJobDestroyView

urlpatterns = [
    path("search/", search_jobs),
    path("auto-search/", auto_search),
    path("history/", search_history),
    path("resume-query/<int:pk>/", resume_search_query),
    path("saved/", SavedJobListCreateView.as_view()),
    path("saved/<int:pk>/", SavedJobDestroyView.as_view()),
    path("<str:pk>/", job_detail),
]
