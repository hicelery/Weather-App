from django.db import models
from django.contrib.auth.models import User
from weather.models import Location


class FavoriteLocation(models.Model):
    """User's favorite locations for weather tracking"""
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='favorite_locations')
    location = models.ForeignKey(
        Location, on_delete=models.CASCADE, related_name='favorited_by')
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} → {self.location.name}"

    class Meta:
        verbose_name_plural = "Favorite Locations"
        unique_together = ('user', 'location')
        ordering = ['-added_at']
