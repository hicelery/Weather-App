from django.test import TestCase

from weather.models import FavouriteLocations, SearchQuery

from .base import WeatherTestCaseMixin


class WeatherModelTests(WeatherTestCaseMixin, TestCase):
    def test_search_query_string_representation_includes_location(self):
        record = SearchQuery.objects.create(
            location="London",
            weather_data={"forecast": "sunny"},
        )

        self.assertIn("London", str(record))

    def test_favourite_location_string_representation_includes_user_and_location(self):
        user = self.make_user()
        record = FavouriteLocations.objects.create(
            location="Lisbon", user=user)

        self.assertIn("Lisbon", str(record))
        self.assertIn(user.username, str(record))

    def test_search_query_has_location_timestamp_index(self):
        index_fields = [list(index.fields)
                        for index in SearchQuery._meta.indexes]

        self.assertIn(["location", "-timestamp"], index_fields)
