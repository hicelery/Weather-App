import requests
from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
from .models import SearchQuery


def index(request):
    return render(request, 'index.html')


def weather_api(request):
    query = request.GET.get('q', 'London')
    api_key = settings.OPENWEATHER_API_KEY
    cache_key = f'weather_{query}'
    cache_timeout = 600  # 10 minutes

    # 1. Check cache first (fast path for recent requests)
    cached_data = cache.get(cache_key)
    if cached_data:
        return JsonResponse(cached_data)

    # 2. Check database for recent data (within 10 min window)
    # This allows data to be shared across multiple users even if cache expired
    try:
        ten_minutes_ago = timezone.now() - timedelta(seconds=cache_timeout)
        recent_query = SearchQuery.objects.filter(
            location=query,
            timestamp__gte=ten_minutes_ago
        ).latest('timestamp')

        if recent_query:
            # Data exists in DB within 10 min window - reuse it and refresh cache
            data = recent_query.weather_data
            cache.set(cache_key, data, timeout=cache_timeout)
            return JsonResponse(data)
    except SearchQuery.DoesNotExist:
        # No recent data in DB, will fetch from API
        pass

    # 3. No cached/recent data - fetch from OpenWeather API
    url = f"https://api.openweathermap.org/data/2.5/forecast?q={query}&appid={api_key}&units=metric"
    try:
        response = requests.get(url)
        data = response.json()

        # Cache and save to database for sharing across users
        cache.set(cache_key, data, timeout=cache_timeout)
        SearchQuery.objects.create(location=query, weather_data=data)

        return JsonResponse(data, status=response.status_code)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
