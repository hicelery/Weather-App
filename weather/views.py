from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import json
import logging

from .services import OpenWeatherService
from .models import Location, WeatherLog
from favorites.models import FavoriteLocation

logger = logging.getLogger(__name__)


def home(request):
    """Main weather dashboard"""
    favorites = []
    if request.user.is_authenticated:
        favorites = FavoriteLocation.objects.filter(
            user=request.user
        ).select_related('location')

    context = {
        'favorites': favorites,
    }
    return render(request, 'weather/home.html', context)


@require_http_methods(["POST"])
@csrf_exempt
def get_weather(request):
    """
    AJAX endpoint to fetch weather for given coordinates
    Expects JSON: {latitude: float, longitude: float, location_name: str}
    """
    try:
        data = json.loads(request.body)
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        location_name = data.get('location_name', 'Unknown')

        if not latitude or not longitude:
            return JsonResponse({
                'error': 'Missing latitude or longitude'
            }, status=400)

        # Get weather data from API
        weather_data = OpenWeatherService.get_weather(latitude, longitude)

        if 'error' in weather_data:
            return JsonResponse(weather_data, status=500)

        # Create or get location
        location, created = Location.objects.get_or_create(
            latitude=latitude,
            longitude=longitude,
            defaults={
                'name': location_name or weather_data.get('name', 'Unknown'),
                'country': weather_data.get('sys', {}).get('country', 'Unknown'),
            }
        )

        # Log the API call
        WeatherLog.objects.create(
            user=request.user if request.user.is_authenticated else None,
            location=location,
            api_calls=1
        )

        # Check if user has favorited this location
        is_favorited = False
        if request.user.is_authenticated:
            is_favorited = FavoriteLocation.objects.filter(
                user=request.user,
                location=location
            ).exists()

        response_data = {
            **weather_data,
            'location_id': location.id,
            'is_favorited': is_favorited,
        }

        return JsonResponse(response_data)

    except json.JSONDecodeError:
        return JsonResponse({
            'error': 'Invalid JSON in request body'
        }, status=400)
    except Exception as e:
        logger.error(f"Weather view error: {str(e)}")
        return JsonResponse({
            'error': 'Failed to fetch weather data'
        }, status=500)


@require_http_methods(["POST"])
@csrf_exempt
def search_locations(request):
    """
    AJAX endpoint to search for locations
    Expects JSON: {query: str}
    """
    try:
        data = json.loads(request.body)
        query = data.get('query', '').strip()

        if not query or len(query) < 2:
            return JsonResponse({
                'error': 'Query must be at least 2 characters'
            }, status=400)

        # Search using OpenWeather API
        results = OpenWeatherService.search_location(query)

        if 'error' in results:
            return JsonResponse(results, status=500)

        # Format results
        locations = []
        if 'list' in results:
            for item in results['list']:
                locations.append({
                    'name': item.get('name'),
                    'country': item.get('sys', {}).get('country'),
                    'latitude': item.get('coord', {}).get('lat'),
                    'longitude': item.get('coord', {}).get('lon'),
                })

        return JsonResponse({
            'locations': locations
        })

    except json.JSONDecodeError:
        return JsonResponse({
            'error': 'Invalid JSON in request body'
        }, status=400)
    except Exception as e:
        logger.error(f"Search locations error: {str(e)}")
        return JsonResponse({
            'error': 'Failed to search locations'
        }, status=500)
