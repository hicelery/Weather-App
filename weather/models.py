from django.db import models

# Create your models here.


class SearchQuery(models.Model):
    location = models.CharField(max_length=255)
    weather_data = models.JSONField()  # Store full response

    timestamp = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=['location', '-timestamp'])]

    def __str__(self):
        return f"{self.location} at {self.timestamp}"
