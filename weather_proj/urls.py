from django.contrib import admin
from django.urls import path, include
from weather import views

urlpatterns = [
    path('', views.landing, name='landing'),
    path('admin/', admin.site.urls),
    path('weather/', include('weather.urls', namespace='weather')),
]
