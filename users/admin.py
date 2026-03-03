from django.contrib import admin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'default_location', 'created_at')
    list_filter = ('location_history_enabled', 'created_at')
    search_fields = ('user__username', 'user__email', 'default_location')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('User Info', {
            'fields': ('user',)
        }),
        ('Profile', {
            'fields': ('bio', 'profile_picture', 'default_location', 'location_history_enabled')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
