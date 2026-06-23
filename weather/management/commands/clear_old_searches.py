from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from weather.models import SearchQuery


class Command(BaseCommand):
    help = "Delete API calls older than 24hours"

    def handle(self, *args, **kwargs):
        cutoff = timezone.now() - timedelta(hours=24)
        deleted, _ = SearchQuery.objects.filter(timestamp__lt=cutoff).delete()
        self.stdout.write(f"Deleted {deleted} expired search queries")
