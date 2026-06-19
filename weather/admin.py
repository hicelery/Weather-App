from django.contrib import admin
from .models import SearchQuery, FavouriteLocations  # Import your model

admin.site.register(FavouriteLocations)

admin.site.register(SearchQuery)
