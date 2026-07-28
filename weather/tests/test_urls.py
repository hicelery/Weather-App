from django.test import SimpleTestCase
from django.urls import resolve, reverse

from weather import views


class WeatherUrlTests(SimpleTestCase):
    def test_landing_url_resolves(self):
        self.assertEqual(resolve("/").func, views.landing)

    def test_weather_index_url_resolves(self):
        self.assertEqual(resolve("/weather/").func, views.index)

    def test_weather_api_url_resolves(self):
        self.assertEqual(
            resolve("/weather/api/weather/").func, views.weather_api)

    def test_favourites_urls_resolve(self):
        self.assertEqual(resolve("/weather/api/favourites/").func,
                         views.get_favourite_location)
        self.assertEqual(
            resolve("/weather/api/favourites/add/London/").func,
            views.add_favourite_location,
        )
        self.assertEqual(
            resolve("/weather/api/favourites/remove/London/").func,
            views.delete_favourite_location,
        )

    def test_reverse_names(self):
        self.assertEqual(reverse("landing"), "/")
        self.assertEqual(reverse("weather:index"), "/weather/")
        self.assertEqual(reverse("weather:weather_api"),
                         "/weather/api/weather/")
