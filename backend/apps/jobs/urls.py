from django.urls import path
from .views import search_jobs, auto_search, SavedJobListCreateView, SavedJobDestroyView, profile_search

urlpatterns = [
    path("search/", search_jobs),
    path("auto-search/", auto_search),
    path("profile-search/", profile_search),
    path("saved/", SavedJobListCreateView.as_view()),
    path("saved/<int:pk>/", SavedJobDestroyView.as_view()),
]
