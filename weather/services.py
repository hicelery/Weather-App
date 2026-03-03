import requests
from decouple import config
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


class OpenWeatherService:
    """Service to interact with OpenWeather API"""

    BASE_URL = 'https://api.openweathermap.org/data/2.5'
    TIMEOUT = 5

    @classmethod
    def _get_api_key(cls):
        """Get API key from environment variables at runtime"""
        api_key = config('OPENWEATHER_API_KEY', default='')
        if not api_key:
            logger.error(
                "OPENWEATHER_API_KEY not set in environment variables")
        return api_key

    @classmethod
    def get_weather(cls, latitude, longitude):
        """
        Fetch weather data for given coordinates
        Returns JSON response or None if request fails
        """
        api_key = cls._get_api_key()
        if not api_key:
            return {'error': 'API key not configured'}

        # Check cache first
        cache_key = f'weather_{latitude}_{longitude}'
        cached = cache.get(cache_key)
        if cached:
            return cached

        try:
            url = f'{cls.BASE_URL}/weather'
            params = {
                'lat': latitude,
                'lon': longitude,
                'appid': api_key,
                'units': 'metric'
            }

            response = requests.get(url, params=params, timeout=cls.TIMEOUT)
            response.raise_for_status()
            data = response.json()

            # Cache for 10 minutes
            cache.set(cache_key, data, 600)
            return data

        except requests.exceptions.RequestException as e:
            logger.error(f"Weather API Error: {str(e)}")
            return {'error': f'Failed to fetch weather: {str(e)}'}

    @classmethod
    def get_forecast(cls, latitude, longitude, days=5):
        """
        Fetch weather forecast data
        """
        api_key = cls._get_api_key()
        if not api_key:
            return {'error': 'API key not configured'}

        cache_key = f'forecast_{latitude}_{longitude}'
        cached = cache.get(cache_key)
        if cached:
            return cached

        try:
            url = f'{cls.BASE_URL}/forecast'
            params = {
                'lat': latitude,
                'lon': longitude,
                'appid': api_key,
                'units': 'metric'
            }

            response = requests.get(url, params=params, timeout=cls.TIMEOUT)
            response.raise_for_status()
            data = response.json()

            # Cache for 30 minutes
            cache.set(cache_key, data, 1800)
            return data

        except requests.exceptions.RequestException as e:
            logger.error(f"Forecast API Error: {str(e)}")
            return {'error': f'Failed to fetch forecast: {str(e)}'}

    @classmethod
    def search_location(cls, query):
        """
        Search for location by name
        """
        api_key = cls._get_api_key()
        if not api_key:
            return {'error': 'API key not configured'}

        try:
            url = f'{cls.BASE_URL}/find'
            params = {
                'q': query,
                'appid': api_key,
                'units': 'metric',
                'type': 'like',
                'cnt': 10
            }

            response = requests.get(url, params=params, timeout=cls.TIMEOUT)
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            logger.error(f"Location Search Error: {str(e)}")
            return {'error': f'Failed to search locations: {str(e)}'}
