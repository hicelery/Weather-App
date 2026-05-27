from django.urls import path
from weather import views

app_name = 'weather'

urlpatterns = [
    path('', views.index, name='index'),
    path('api/weather/', views.weather_api, name='weather_api'),
    path('api/favourites/add/<str:location>/',
         views.add_favourite_location,
         name='add_favourite_location'),
    path('api/favourites/remove/<str:location>/',
         views.delete_favourite_location,
         name='remove_favourite_location'),
]
