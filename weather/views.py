import requests
from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings

def index(request):
    return render(request, 'index.html')

def weather_api(request):
    query = request.GET.get('q', 'London')
    api_key = settings.OPENWEATHER_API_KEY
    url = (
        f"https://api.openweathermap.org/data/2.5/forecast?"
        f"q={query}&appid={api_key}&units=metric"
    )
    try:
        response = requests.get(url)
        data = response.json()
        return JsonResponse(data, status=response.status_code)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
