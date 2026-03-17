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
    """Main weather dashboard
    get user's favorite locations if authenticated
    display 5 days of placeholder location."""
    favorites = []
    if request.user.is_authenticated:
        favorites = FavoriteLocation.objects.filter(
            user=request.user
        ).select_related('location')

    context = {
        'favorites': favorites,
    }
    return render(request, 'weather/home.html', context)


def _process_forecast_data(forecast_data):
    """
    Process and aggregate forecast data by day.
    Expects forecast data from OpenWeather API and returns daily summaries.
    """
    if 'error' in forecast_data or 'list' not in forecast_data:
        return []

    # Group forecasts by day
    daily_forecasts = {}

    for forecast in forecast_data['list']:
        # Get date part only (YYYY-MM-DD)
        dt_txt = forecast.get('dt_txt', '')
        day = dt_txt.split(' ')[0]

        if day not in daily_forecasts:
            daily_forecasts[day] = {
                'date': day,
                'forecasts': []
            }

        daily_forecasts[day]['forecasts'].append(forecast)

    # Create daily summaries
    daily_summaries = []
    for day in sorted(daily_forecasts.keys()):
        forecasts = daily_forecasts[day]['forecasts']

        # Get the middle forecast of the day for a representative snapshot
        middle_forecast = forecasts[len(forecasts) // 2]

        # Calculate daily min/max/avg temperatures
        temps = [f['main']['temp'] for f in forecasts]

        daily_summary = {
            'date': day,
            'temp_min': min(temps),
            'temp_max': max(temps),
            'temp_avg': sum(temps) / len(temps),
            'weather_main': middle_forecast['weather'][0]['main'],
            'weather_description': middle_forecast['weather'][0]['description'],
            'weather_icon': middle_forecast['weather'][0]['icon'],
            'humidity': middle_forecast['main']['humidity'],
            'wind_speed': middle_forecast['wind']['speed'],
            'pressure': middle_forecast['main']['pressure'],
            'clouds': middle_forecast.get('clouds', {}).get('all', 0),
            # Probability of precipitation
            'precipitation_prob': middle_forecast.get('pop', 0),
        }
        daily_summaries.append(daily_summary)

    return daily_summaries


@require_http_methods(["POST"])
@csrf_exempt
def get_weather(request):
    """
    AJAX endpoint to fetch weather for given coordinates
    Expects JSON: {latitude: float, longitude: float, location_name: str, days: int}
    Returns: Current weather data plus forecast data for specified number of days
    """
    try:
        data = json.loads(request.body)
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        location_name = data.get('location_name', 'Unknown')
        days = data.get('days', 5)

        if not latitude or not longitude:
            return JsonResponse({
                'error': 'Missing latitude or longitude'
            }, status=400)

        # Get current weather data from API
        weather_data = OpenWeatherService.get_weather(latitude, longitude)

        if 'error' in weather_data:
            return JsonResponse(weather_data, status=500)

        # Get forecast data from API
        forecast_data = OpenWeatherService.get_forecast(latitude, longitude)

        if 'error' not in forecast_data:
            # Process forecast data into daily summaries
            daily_forecasts = _process_forecast_data(forecast_data)
            # Limit to requested number of days
            daily_forecasts = daily_forecasts[:int(days)]
        else:
            daily_forecasts = []

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
            api_calls=2  # One for current weather, one for forecast
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
            'forecast': daily_forecasts,
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
