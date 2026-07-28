from django.contrib.auth import get_user_model
from django.test import Client


User = get_user_model()


class WeatherTestCaseMixin:
    def make_user(self, username="tester", password="password123"):
        return User.objects.create_user(username=username, password=password)

    def auth_client(self, user=None):
        client = Client()
        user = user or self.make_user()
        client.force_login(user)
        return client, user
