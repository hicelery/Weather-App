from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
import json
import logging

from .models import FavoriteLocation
from weather.models import Location

logger = logging.getLogger(__name__)


@login_required(login_url='account_login')
def favorites_list(request):
    """Display all favorite locations for the user"""
    favorites = FavoriteLocation.objects.filter(
        user=request.user
    ).select_related('location').order_by('-added_at')

    context = {
        'favorites': favorites,
    }
    return render(request, 'favorites/list.html', context)


@require_http_methods(["POST"])
@login_required(login_url='account_login')
@csrf_exempt
def add_favorite(request):
    """
    AJAX endpoint to add a location to favorites
    Expects JSON: {location_id: int} or {latitude: float, longitude: float, name: str, country: str}
    """
    try:
        data = json.loads(request.body)
        location_id = data.get('location_id')

        if location_id:
            # Get existing location
            location = get_object_or_404(Location, id=location_id)
        else:
            # Create new location if needed
            latitude = data.get('latitude')
            longitude = data.get('longitude')
            name = data.get('name', 'Unknown')
            country = data.get('country', 'Unknown')

            if not latitude or not longitude:
                return JsonResponse({
                    'error': 'Missing required fields'
                }, status=400)

            location, created = Location.objects.get_or_create(
                latitude=latitude,
                longitude=longitude,
                defaults={
                    'name': name,
                    'country': country,
                }
            )

        # Try to add to favorites
        try:
            favorite, created = FavoriteLocation.objects.get_or_create(
                user=request.user,
                location=location
            )

            if created:
                return JsonResponse({
                    'success': True,
                    'message': f'{location.name} added to favorites',
                    'location_id': location.id,
                })
            else:
                return JsonResponse({
                    'error': f'{location.name} is already in your favorites'
                }, status=400)

        except IntegrityError:
            return JsonResponse({
                'error': 'This location is already in your favorites'
            }, status=400)

    except json.JSONDecodeError:
        return JsonResponse({
            'error': 'Invalid JSON in request body'
        }, status=400)
    except Exception as e:
        logger.error(f"Add favorite error: {str(e)}")
        return JsonResponse({
            'error': 'Failed to add favorite location'
        }, status=500)


@require_http_methods(["DELETE"])
@login_required(login_url='account_login')
@csrf_exempt
def remove_favorite(request, location_id):
    """
    AJAX endpoint to remove a location from favorites
    """
    try:
        favorite = get_object_or_404(
            FavoriteLocation,
            user=request.user,
            location_id=location_id
        )
        location_name = favorite.location.name
        favorite.delete()

        return JsonResponse({
            'success': True,
            'message': f'{location_name} removed from favorites'
        })

    except Exception as e:
        logger.error(f"Remove favorite error: {str(e)}")
        return JsonResponse({
            'error': 'Failed to remove favorite location'
        }, status=500)


@login_required(login_url='account_login')
def get_user_favorites(request):
    """
    Get all user favorites as JSON (for AJAX)
    """
    favorites = FavoriteLocation.objects.filter(
        user=request.user
    ).select_related('location').order_by('-added_at')

    favorites_data = [
        {
            'id': f.location.id,
            'name': f.location.name,
            'country': f.location.country,
            'latitude': f.location.latitude,
            'longitude': f.location.longitude,
            'added_at': f.added_at.isoformat(),
        }
        for f in favorites
    ]

    return JsonResponse({
        'favorites': favorites_data,
        'count': len(favorites_data),
    })
