import requests
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from datetime import timedelta
from .models import SearchQuery, FavouriteLocations


def landing(request):
    return render(request, 'landing.html')


def index(request):
    favourite_locations = []
    if request.user.is_authenticated:
        favourite_locations = FavouriteLocations.objects.filter(
            user=request.user)
    return render(request,
                  'weather/index.html',
                  {'favourite_locations': favourite_locations})


def weather_api(request):
    query = request.GET.get('q', 'London')
    api_key = settings.OPENWEATHER_API_KEY
    cache_key = f'weather_{query}'
    cache_timeout = 600  # 10 minutes

    # 1. Check cache first (fast path for recent requests)
    cached_data = cache.get(cache_key)
    if cached_data:
        print("Cache hit for query")
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
            # Data exists in DB within 10 min window
            # reuse it and refresh cache
            data = recent_query.weather_data
            cache.set(cache_key, data, timeout=cache_timeout)
            return JsonResponse(data)
    except SearchQuery.DoesNotExist:
        # No recent data in DB, will fetch from API
        pass

    # 3. No cached/recent data - fetch from OpenWeather API
    url = "https://api.openweathermap.org/data/2.5/forecast"
    params = {
        "appid": api_key,
        "units": "metric"
    }
    # Detect if query contains coordinates (lat,lon format)
    if "," in query:
        try:
            parts = query.split(",")
            lat = float(parts[0].strip())
            lon = float(parts[1].strip())
            params["lat"] = lat
            params["lon"] = lon
        except (ValueError, IndexError):
            # If parsing fails, treat as city name
            params["q"] = query
    else:
        params["q"] = query
    try:
        response = requests.get(url, params=params, timeout=10)

        if response.status_code != 200:
            return JsonResponse(
                {"error": "Weather API request failed"},
                status=response.status_code,
            )

        data = response.json()
        # Cache and save to database for sharing across users
        cache.set(cache_key, data, timeout=cache_timeout)
        SearchQuery.objects.create(location=query, weather_data=data)

        return JsonResponse(data, status=200)
    except requests.RequestException:
        return JsonResponse(
            {"error": "Weather service unavailable"},
            status=503,
        )

    except ValueError:
        return JsonResponse(
            {"error": "Invalid response from weather service"},
            status=502,
        )


@require_POST
@login_required
def add_favourite_location(request, location):
    # This functions returns favourite locations and weather data
    if location == 'placeholder':
        return redirect(request.META.get('HTTP_REFERER', '/'))
    else:
        try:
            FavouriteLocations.objects.create(
                location=location, user=request.user)
            return redirect(request.META.get('HTTP_REFERER', '/'))

        except Exception:
            return redirect(request.META.get('HTTP_REFERER', '/'))


@require_POST
@login_required
def delete_favourite_location(request, location):
    try:
        FavouriteLocations.objects.filter(
            location=location, user=request.user).delete()
        return redirect(request.META.get('HTTP_REFERER', '/'))
    except Exception:
        return redirect(request.META.get('HTTP_REFERER', '/'))
