from django.urls import path
from . import views

app_name = 'favorites'

urlpatterns = [
    path('', views.favorites_list, name='list'),
    path('api/add/', views.add_favorite, name='add'),
    path('api/remove/<int:location_id>/', views.remove_favorite, name='remove'),
    path('api/get-all/', views.get_user_favorites, name='get_all'),
]
