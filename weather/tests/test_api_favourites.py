from django.test import TestCase
from django.urls import reverse

from weather.models import FavouriteLocations

from .base import WeatherTestCaseMixin


class FavouriteApiTests(WeatherTestCaseMixin, TestCase):
    def test_add_favourite_requires_authentication(self):
        response = self.client.post(
            reverse("weather:add_favourite_location", args=["London"]))

        self.assertEqual(response.status_code, 401)
        self.assertJSONEqual(response.content, {
                             "success": False, "error": "Authentication required"})

    def test_delete_favourite_requires_authentication(self):
        response = self.client.post(
            reverse("weather:remove_favourite_location", args=["London"]))

        self.assertEqual(response.status_code, 401)

    def test_get_favourites_requires_authentication(self):
        response = self.client.get(reverse("weather:get_favourites"))

        self.assertEqual(response.status_code, 401)

    def test_add_favourite_creates_record_for_authenticated_user(self):
        client, user = self.auth_client()

        response = client.post(
            reverse("weather:add_favourite_location", args=["London"]))

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            {"success": True, "message": "London added to favourites"},
        )
        self.assertTrue(FavouriteLocations.objects.filter(
            user=user, location="London").exists())

    def test_add_favourite_rejects_placeholder_location(self):
        client, _ = self.auth_client()

        response = client.post(
            reverse("weather:add_favourite_location", args=["placeholder"]))

        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(response.content, {
                             "success": False, "error": "Invalid location"})

    def test_add_favourite_is_post_only(self):
        client, _ = self.auth_client()

        response = client.get(
            reverse("weather:add_favourite_location", args=["London"]))

        self.assertEqual(response.status_code, 405)

    def test_delete_favourite_removes_only_the_authenticated_users_record(self):
        client, user = self.auth_client()
        other_user = self.make_user(username="other")
        FavouriteLocations.objects.create(location="Berlin", user=user)
        FavouriteLocations.objects.create(location="Berlin", user=other_user)

        response = client.post(
            reverse("weather:remove_favourite_location", args=["Berlin"]))

        self.assertEqual(response.status_code, 200)
        self.assertTrue(FavouriteLocations.objects.filter(
            user=other_user, location="Berlin").exists())
        self.assertFalse(FavouriteLocations.objects.filter(
            user=user, location="Berlin").exists())

    def test_get_favourites_returns_user_locations_newest_first(self):
        client, user = self.auth_client()
        first = FavouriteLocations.objects.create(location="Oslo", user=user)
        second = FavouriteLocations.objects.create(location="Cairo", user=user)

        response = client.get(reverse("weather:get_favourites"))

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            {
                "success": True,
                "locations": [
                    {"id": second.id, "location": "Cairo"},
                    {"id": first.id, "location": "Oslo"},
                ],
                "count": 2,
            },
        )

    def test_get_favourites_is_get_only(self):
        client, _ = self.auth_client()

        response = client.post(reverse("weather:get_favourites"))

        self.assertEqual(response.status_code, 405)
