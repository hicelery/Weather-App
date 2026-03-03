from django.contrib import admin
from .models import Location, WeatherLog


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'latitude', 'longitude', 'created_at')
    list_filter = ('country', 'created_at')
    search_fields = ('name', 'country')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Location Info', {
            'fields': ('name', 'country')
        }),
        ('Coordinates', {
            'fields': ('latitude', 'longitude')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(WeatherLog)
class WeatherLogAdmin(admin.ModelAdmin):
    list_display = ('location', 'user', 'api_calls', 'timestamp')
    list_filter = ('timestamp', 'location')
    search_fields = ('location__name', 'user__username')
    readonly_fields = ('timestamp',)

    fieldsets = (
        ('Log Info', {
            'fields': ('user', 'location', 'api_calls')
        }),
        ('Timestamp', {
            'fields': ('timestamp',),
            'classes': ('collapse',)
        }),
    )
