from django.contrib import admin
from .models import FavoriteLocation


@admin.register(FavoriteLocation)
class FavoriteLocationAdmin(admin.ModelAdmin):
    list_display = ('user', 'location', 'added_at')
    list_filter = ('added_at', 'user')
    search_fields = ('user__username', 'location__name')
    readonly_fields = ('added_at',)

    fieldsets = (
        ('Favorite Info', {
            'fields': ('user', 'location')
        }),
        ('Added', {
            'fields': ('added_at',),
            'classes': ('collapse',)
        }),
    )
