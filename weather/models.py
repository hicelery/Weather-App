from django.db import models
from django.contrib.auth.models import User


class Location(models.Model):
    """Weather location data"""
    name = models.CharField(max_length=200)
    country = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name}, {self.country}"

    class Meta:
        verbose_name_plural = "Locations"
        indexes = [
            models.Index(fields=['latitude', 'longitude']),
        ]


class WeatherLog(models.Model):
    """Track API calls for admin statistics"""
    user = models.ForeignKey(User, on_delete=models.CASCADE,
                             related_name='weather_logs', null=True, blank=True)
    location = models.ForeignKey(
        Location, on_delete=models.CASCADE, related_name='logs')
    api_calls = models.IntegerField(default=1)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Log: {self.location} at {self.timestamp}"

    class Meta:
        verbose_name_plural = "Weather Logs"
        ordering = ['-timestamp']
