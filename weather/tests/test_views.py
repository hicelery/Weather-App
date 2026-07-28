from django.test import TestCase
from django.urls import reverse

from weather.models import FavouriteLocations

from .base import WeatherTestCaseMixin


class LandingViewTests(TestCase):
    def test_landing_view_renders_successfully(self):
        response = self.client.get(reverse("landing"))

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "landing.html")
        self.assertContains(response, "Visit GitHub")
        self.assertContains(response, "Weather App")


class IndexViewTests(WeatherTestCaseMixin, TestCase):
    def test_index_view_renders_for_anonymous_users(self):
        response = self.client.get(reverse("weather:index"))

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "weather/index.html")
        self.assertEqual(list(response.context["favourite_locations"]), [])

    def test_index_view_includes_authenticated_favourites(self):
        client, user = self.auth_client()
        favourite = FavouriteLocations.objects.create(
            location="Berlin", user=user)

        response = client.get(reverse("weather:index"))

        self.assertIn(favourite, response.context["favourite_locations"])

    def test_index_view_exposes_search_forms_and_controls(self):
        response = self.client.get(reverse("weather:index"))

        self.assertContains(response, 'id="location-form"')
        self.assertContains(response, 'id="forecast-options-form"')
        self.assertContains(response, 'id="user-input"')
        self.assertContains(response, 'id="forecastDays"')
        self.assertContains(response, 'id="current-location-btn"')
        self.assertContains(response, "add-favourite-btn")
