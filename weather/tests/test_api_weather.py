from datetime import timedelta
from unittest.mock import Mock, patch

from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
import requests

from weather.models import SearchQuery

from .base import WeatherTestCaseMixin


@override_settings(OPENWEATHER_API_KEY="test-key")
class WeatherApiTests(WeatherTestCaseMixin, TestCase):
    def setUp(self):
        self.url = reverse("weather:weather_api")

    def test_weather_api_uses_cache_when_available(self):
        cached_payload = {"source": "cache"}

        with patch("weather.views.cache.get", return_value=cached_payload) as cache_get, patch(
            "weather.views.requests.get"
        ) as requests_get:
            response = self.client.get(self.url, {"q": "London"})

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, cached_payload)
        cache_get.assert_called_once_with("weather_London")
        requests_get.assert_not_called()

    def test_weather_api_reuses_recent_database_result(self):
        payload = {"source": "database"}
        record = SearchQuery.objects.create(
            location="Paris", weather_data=payload)
        SearchQuery.objects.filter(pk=record.pk).update(
            timestamp=timezone.now() - timedelta(minutes=5))

        with patch("weather.views.cache.get", return_value=None), patch(
            "weather.views.cache.set"
        ) as cache_set, patch("weather.views.requests.get") as requests_get:
            response = self.client.get(self.url, {"q": "Paris"})

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, payload)
        cache_set.assert_called_once()
        requests_get.assert_not_called()

    def test_weather_api_fetches_and_persists_new_query(self):
        api_response = Mock()
        api_response.status_code = 200
        api_response.json.return_value = {"source": "api", "city": "Rome"}

        with patch("weather.views.cache.get", return_value=None), patch(
            "weather.views.cache.set"
        ) as cache_set, patch("weather.views.requests.get", return_value=api_response) as requests_get:
            response = self.client.get(self.url, {"q": "Rome"})

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, {
                             "source": "api", "city": "Rome"})
        requests_get.assert_called_once()
        cache_set.assert_called_once()
        self.assertTrue(SearchQuery.objects.filter(location="Rome").exists())

    def test_weather_api_uses_coordinate_parameters_when_query_looks_like_coordinates(self):
        api_response = Mock()
        api_response.status_code = 200
        api_response.json.return_value = {"source": "api"}

        with patch("weather.views.cache.get", return_value=None), patch(
            "weather.views.requests.get", return_value=api_response
        ) as requests_get:
            response = self.client.get(self.url, {"q": "51.5,-0.12"})

        self.assertEqual(response.status_code, 200)
        _, kwargs = requests_get.call_args
        self.assertEqual(kwargs["params"]["lat"], 51.5)
        self.assertEqual(kwargs["params"]["lon"], -0.12)
        self.assertNotIn("q", kwargs["params"])

    def test_weather_api_falls_back_to_query_when_coordinates_are_invalid(self):
        api_response = Mock()
        api_response.status_code = 200
        api_response.json.return_value = {"source": "api"}

        with patch("weather.views.cache.get", return_value=None), patch(
            "weather.views.requests.get", return_value=api_response
        ) as requests_get:
            response = self.client.get(self.url, {"q": "51.5,invalid"})

        self.assertEqual(response.status_code, 200)
        _, kwargs = requests_get.call_args
        self.assertEqual(kwargs["params"]["q"], "51.5,invalid")
        self.assertNotIn("lat", kwargs["params"])
        self.assertNotIn("lon", kwargs["params"])

    def test_weather_api_returns_upstream_status_code_on_failure(self):
        api_response = Mock()
        api_response.status_code = 404

        with patch("weather.views.cache.get", return_value=None), patch(
            "weather.views.requests.get", return_value=api_response
        ):
            response = self.client.get(self.url, {"q": "Nowhere"})

        self.assertEqual(response.status_code, 404)
        self.assertJSONEqual(response.content, {
                             "error": "Weather API request failed"})

    def test_weather_api_returns_service_unavailable_on_request_exception(self):
        with patch("weather.views.cache.get", return_value=None), patch(
            "weather.views.requests.get", side_effect=requests.RequestException("boom")
        ):
            response = self.client.get(self.url, {"q": "London"})

        self.assertEqual(response.status_code, 503)
        self.assertJSONEqual(response.content, {
                             "error": "Weather service unavailable"})

    def test_weather_api_returns_bad_gateway_on_invalid_json(self):
        api_response = Mock()
        api_response.status_code = 200
        api_response.json.side_effect = ValueError("bad json")

        with patch("weather.views.cache.get", return_value=None), patch(
            "weather.views.requests.get", return_value=api_response
        ):
            response = self.client.get(self.url, {"q": "London"})

        self.assertEqual(response.status_code, 502)
        self.assertJSONEqual(response.content, {
                             "error": "Invalid response from weather service"})
