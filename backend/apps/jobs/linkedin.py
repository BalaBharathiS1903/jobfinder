import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

ADZUNA_COUNTRIES = {
    "in": "India", "us": "USA", "gb": "UK", "au": "Australia",
    "ca": "Canada", "de": "Germany", "sg": "Singapore",
}


def fetch_jobs(query, location="", country="in"):
    """Try Adzuna first, then JSearch, then mock data."""
    if settings.ADZUNA_APP_ID and settings.ADZUNA_APP_KEY not in ("", "your_adzuna_app_key_here"):
        results = _fetch_adzuna(query, location, country)
        logger.info(f"Adzuna returned {len(results)} results for '{query}'")
        if results:
            return results

    if settings.JSEARCH_API_KEY not in ("", "your_jsearch_rapidapi_key_here"):
        results = _fetch_jsearch(query, location, country)
        logger.info(f"JSearch returned {len(results)} results for '{query}'")
        if results:
            return results

    logger.warning(f"No API keys set — using mock data for '{query}'")
    return _filter_mock(query, location)


def _fetch_adzuna(query, location, country="in"):
    if country not in ADZUNA_COUNTRIES:
        country = "in"
    try:
        params = {
            "app_id": settings.ADZUNA_APP_ID,
            "app_key": settings.ADZUNA_APP_KEY,
            "results_per_page": 20,
            "what": query,
            "sort_by": "date",
            "max_days_old": 30,
        }
        if location:
            params["where"] = location
        resp = requests.get(
            f"https://api.adzuna.com/v1/api/jobs/{country}/search/1",
            params=params,
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json().get("results", [])
        return [
            {
                "id": str(j.get("id", i)),
                "title": j.get("title", ""),
                "company": j.get("company", {}).get("display_name", ""),
                "location": j.get("location", {}).get("display_name", ""),
                "url": j.get("redirect_url", ""),
                "description": j.get("description", ""),
                "source": "adzuna",
                "posted_at": j.get("created", ""),
            }
            for i, j in enumerate(data)
        ]
    except Exception as e:
        logger.error(f"Adzuna error: {e}")
        return []


def _fetch_jsearch(query, location, country="in"):
    try:
        country_names = {"in": "India", "us": "USA", "gb": "UK", "au": "Australia",
                         "ca": "Canada", "de": "Germany", "sg": "Singapore"}
        country_name = country_names.get(country, "India")
        parts = [query]
        if location:
            parts.append(location)
        parts.append(country_name)
        query_str = " ".join(parts)

        resp = requests.get(
            "https://jsearch.p.rapidapi.com/search",
            headers={
                "X-RapidAPI-Key": settings.JSEARCH_API_KEY,
                "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
            },
            params={"query": query_str, "page": "1", "num_pages": "1", "date_posted": "month"},
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json().get("data", [])
        return [
            {
                "id": str(j.get("job_id", i)),
                "title": j.get("job_title", ""),
                "company": j.get("employer_name", ""),
                "location": f"{j.get('job_city', '')}, {j.get('job_state', '')}, {j.get('job_country', '')}".strip(", "),
                "url": j.get("job_apply_link", ""),
                "description": (j.get("job_description", "") or "")[:500],
                "source": "jsearch",
                "posted_at": j.get("job_posted_at_datetime_utc", ""),
            }
            for i, j in enumerate(data)
        ]
    except Exception as e:
        logger.error(f"JSearch error: {e}")
        return []


def _filter_mock(query, location):
    """Last resort — returns empty with Adzuna search link."""
    q_encoded = query.replace(" ", "+")
    l_encoded = ("&l=" + location.replace(" ", "+")) if location else ""
    return [{
        "id": "mock-1",
        "title": f"Search results for: {query}",
        "company": "Adzuna Job Board",
        "location": location or "Worldwide",
        "url": f"https://www.adzuna.in/search?q={q_encoded}{l_encoded}",
        "description": f"No API keys configured. Click 'View Job' to search for '{query}' jobs on Adzuna directly.",
        "source": "mock",
    }]
