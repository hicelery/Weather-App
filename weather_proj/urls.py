from django.contrib import admin
from django.urls import path
from weather import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.index, name='index'),
    path('api/weather/', views.weather_api, name='weather_api'),
]
