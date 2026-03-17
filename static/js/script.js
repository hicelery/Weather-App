// Weather App Main JavaScript

// Map weather codes to Font Awesome icons
const weatherIcons = {
    '01d': 'fas fa-sun',
    '01n': 'fas fa-moon',
    '02d': 'fas fa-cloud-sun',
    '02n': 'fas fa-cloud-moon',
    '03d': 'fas fa-cloud',
    '03n': 'fas fa-cloud',
    '04d': 'fas fa-cloud',
    '04n': 'fas fa-cloud',
    '09d': 'fas fa-cloud-rain',
    '09n': 'fas fa-cloud-rain',
    '10d': 'fas fa-cloud-sun-rain',
    '10n': 'fas fa-cloud-moon-rain',
    '11d': 'fas fa-bolt',
    '11n': 'fas fa-bolt',
    '13d': 'fas fa-snowflake',
    '13n': 'fas fa-snowflake',
    '50d': 'fas fa-smog',
    '50n': 'fas fa-smog'
};

// DOM Elements
const searchForm = document.getElementById('searchForm');
const locationInput = document.getElementById('locationInput');
const searchResults = document.getElementById('searchResults');
const weatherContainer = document.getElementById('weatherContainer');
const loadingContainer = document.getElementById('loadingContainer');
const errorContainer = document.getElementById('errorContainer');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    
    // Auto-load favorites weather on page load if available
    const favoritesContainer = document.getElementById('favoritesContainer');
    if (favoritesContainer) {
        loadFavorites();
    }
});

function setupEventListeners() {
    // Search form submission
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }

    // Location input for autocomplete
    if (locationInput) {
        locationInput.addEventListener('input', debounce(handleLocationInput, 300));
        locationInput.addEventListener('blur', () => {
            setTimeout(() => {
                searchResults.style.display = 'none';
            }, 200);
        });
        locationInput.addEventListener('focus', () => {
            if (searchResults.innerHTML.trim()) {
                searchResults.style.display = 'block';
            }
        });
    }

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target !== locationInput && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

// Handle location input for search suggestions
function handleLocationInput(e) {
    const query = e.target.value.trim();

    if (query.length < 2) {
        searchResults.style.display = 'none';
        return;
    }

    searchLocations(query);
}

// Search locations via API
function searchLocations(query) {
    // Show loading state
    searchResults.innerHTML = '<div class="list-group-item text-center"><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Searching...</div>';
    searchResults.style.display = 'block';

    fetch('/api/search/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({ query: query })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            searchResults.innerHTML = `<div class="list-group-item text-danger"><i class="fas fa-exclamation-triangle"></i> ${data.error}</div>`;
            return;
        }

        if (data.locations && data.locations.length > 0) {
            searchResults.innerHTML = data.locations.map(location => `
                <button type="button" class="list-group-item list-group-item-action" 
                        onclick="selectLocation(${location.latitude}, ${location.longitude}, '${location.name}')">
                    <strong>${location.name}</strong>
                    <span class="text-muted">${location.country}</span>
                </button>
            `).join('');
        } else {
            searchResults.innerHTML = '<div class="list-group-item text-muted">No locations found</div>';
        }
    })
    .catch(error => {
        console.error('Search error:', error);
        searchResults.innerHTML = '<div class="list-group-item text-danger"><i class="fas fa-exclamation-triangle"></i> Search failed</div>';
    });
}

// Select location from search results
function selectLocation(latitude, longitude, locationName) {
    locationInput.value = locationName;
    searchResults.style.display = 'none';
    fetchWeather(latitude, longitude, locationName);
}

// Handle search form submission
function handleSearch(e) {
    e.preventDefault();
    const query = locationInput.value.trim();

    if (!query) {
        showError('Please enter a location name');
        return;
    }

    // For now, just use the first result from search suggestions
    // In a real app, you might want to handle this differently
    searchLocations(query);
}

// Fetch weather data
function fetchWeather(latitude, longitude, locationName) {
    showLoading(true);
    hideError();
    weatherContainer.style.display = 'none';

    // Get forecast days from input (default 5)
    const forecastDaysInput = document.getElementById('forecastDays');
    const forecastDays = forecastDaysInput ? parseInt(forecastDaysInput.value) || 5 : 5;

    fetch('/api/weather/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            latitude: latitude,
            longitude: longitude,
            location_name: locationName,
            days: forecastDays
        })
    })
    .then(response => response.json())
    .then(data => {
        showLoading(false);

        if (data.error) {
            showError(data.error);
            return;
        }

        // Store current location info
        currentLocationId = data.location_id;
        currentLocationData = data;

        // Update weather display
        updateWeatherDisplay(data);
        weatherContainer.style.display = 'block';
    })
    .catch(error => {
        showLoading(false);
        console.error('Weather fetch error:', error);
        showError('Failed to fetch weather data. Please try again.');
    });
}

// Update weather display with data
function updateWeatherDisplay(data) {
    const iconCode = data.weather[0].icon;
    const iconClass = weatherIcons[iconCode] || 'fas fa-cloud';

    // Update location info
    document.getElementById('locationName').textContent = data.name;
    document.getElementById('locationCountry').textContent = data.sys.country;

    // Update weather display
    document.getElementById('weatherIcon').innerHTML = `<i class="${iconClass}"></i>`;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('weatherDescription').textContent = data.weather[0].main + ' - ' + data.weather[0].description;

    // Update weather details
    document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    document.getElementById('windSpeed').textContent = `${data.wind.speed} m/s`;
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;

    // Display forecast cards if available
    if (data.forecast && data.forecast.length > 0) {
        displayForecastCards(data.forecast);
    }

    // Update favorite button
    updateFavoriteButton(data.is_favorited);
}

// Display forecast cards
function displayForecastCards(forecastData) {
    const forecastCardsContainer = document.getElementById('forecastCardsContainer');
    const forecastCardsRow = document.getElementById('forecastCardsRow');

    if (!forecastCardsContainer || !forecastCardsRow) return;

    // Clear existing cards
    forecastCardsRow.innerHTML = '';

    // Create card for each day
    forecastData.forEach(day => {
        const iconCode = `${day.weather_icon}`; // e.g., '01d', '02d', etc.
        const iconClass = weatherIcons[iconCode] || 'fas fa-cloud';
        
        // Format date
        const dateObj = new Date(day.date);
        const dateStr = dateObj.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });

        const card = document.createElement('div');
        card.className = 'col-md-4 col-lg-2 mb-3';
        card.innerHTML = `
            <div class="card h-100 shadow-sm forecast-card">
                <div class="card-body text-center p-3">
                    <h6 class="card-title mb-3">${dateStr}</h6>
                    <div class="mb-3">
                        <i class="${iconClass} fa-2x" style="color: #0d6efd;"></i>
                    </div>
                    <div class="temperature-range mb-2">
                        <p class="mb-1">
                            <strong>${Math.round(day.temp_max)}°C</strong>
                        </p>
                        <p class="text-muted small mb-2">
                            ${Math.round(day.temp_min)}°C
                        </p>
                    </div>
                    <p class="card-text small text-capitalize mb-2">
                        ${day.weather_main}
                    </p>
                    <hr class="my-2">
                    <div class="forecast-details small">
                        <div class="forecast-detail-item mb-1">
                            <i class="fas fa-droplet"></i> ${Math.round(day.precipitation_prob * 100)}%
                        </div>
                        <div class="forecast-detail-item mb-1">
                            <i class="fas fa-wind"></i> ${day.wind_speed.toFixed(1)} m/s
                        </div>
                        <div class="forecast-detail-item">
                            <i class="fas fa-tint"></i> ${day.humidity}%
                        </div>
                    </div>
                </div>
            </div>
        `;

        forecastCardsRow.appendChild(card);
    });

    // Show the forecast cards container
    forecastCardsContainer.style.display = 'block';
}

// Update favorite button state
function updateFavoriteButton(isFavorited) {
    const favBtn = document.getElementById('favoriteBtn');
    if (!favBtn) return;

    if (isFavorited) {
        favBtn.classList.remove('btn-danger');
        favBtn.classList.add('btn-success');
        favBtn.innerHTML = '<i class="fas fa-heart fav-active"></i> In Favorites';
        favBtn.disabled = false;
        favBtn.onclick = () => removeFavoriteByLocation(currentLocationId);
    } else {
        favBtn.classList.remove('btn-success');
        favBtn.classList.add('btn-danger');
        favBtn.innerHTML = '<i class="fas fa-heart"></i> Add to Favorites';
        favBtn.disabled = false;
        favBtn.onclick = () => toggleFavorite();
    }
}

// Toggle favorite status
function toggleFavorite() {
    if (!currentLocationId) {
        showError('Please search for a location first');
        return;
    }

    const favBtn = document.getElementById('favoriteBtn');
    favBtn.disabled = true;

    fetch('/favorites/api/add/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            location_id: currentLocationId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccess(data.message);
            updateFavoriteButton(true);
            // Reload favorites section if it exists
            if (document.getElementById('favoritesContainer')) {
                loadFavorites();
            }
        } else {
            showError(data.error || 'Failed to add favorite');
            favBtn.disabled = false;
        }
    })
    .catch(error => {
        console.error('Favorite add error:', error);
        showError('Failed to add favorite location');
        favBtn.disabled = false;
    });
}

// Remove favorite by location ID
function removeFavoriteByLocation(locationId) {
    if (!confirm('Remove this location from favorites?')) {
        return;
    }

    const favBtn = document.getElementById('favoriteBtn');
    favBtn.disabled = true;

    fetch(`/favorites/api/remove/${locationId}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccess(data.message);
            updateFavoriteButton(false);
            // Reload favorites section if it exists
            if (document.getElementById('favoritesContainer')) {
                loadFavorites();
            }
        } else {
            showError(data.error || 'Failed to remove favorite');
            favBtn.disabled = false;
        }
    })
    .catch(error => {
        console.error('Favorite remove error:', error);
        showError('Failed to remove favorite location');
        favBtn.disabled = false;
    });
}

// Remove favorite from list view
function removeFavorite(locationId) {
    if (!confirm('Remove this location from favorites?')) {
        return;
    }

    fetch(`/favorites/api/remove/${locationId}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccess(data.message);
            // Remove card from DOM
            const card = document.querySelector(`[data-location-id="${locationId}"]`);
            if (card) {
                card.parentElement.remove();
            }
            // Reload favorites if empty
            const favContainer = document.getElementById('favoritesContainer');
            if (favContainer && favContainer.children.length === 0) {
                location.reload();
            }
        } else {
            showError(data.error || 'Failed to remove favorite');
        }
    })
    .catch(error => {
        console.error('Favorite remove error:', error);
        showError('Failed to remove favorite location');
    });
}

// Show favorite weather
function showFavoriteWeather(latitude, longitude, locationName) {
    locationInput.value = locationName;
    fetchWeather(latitude, longitude, locationName);
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Load favorites
function loadFavorites() {
    fetch('/favorites/api/get-all/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {
        // Favorites are already displayed by server-side rendering
        // This could be used to refresh dynamically if needed
    })
    .catch(error => {
        console.error('Load favorites error:', error);
    });
}

// Show/hide loading state
function showLoading(show) {
    if (loadingContainer) {
        loadingContainer.style.display = show ? 'block' : 'none';
    }
}

// Show error message
function showError(message) {
    if (errorContainer) {
        document.getElementById('errorMessage').textContent = message;
        errorContainer.style.display = 'block';
    }
}

// Hide error message
function hideError() {
    if (errorContainer) {
        errorContainer.style.display = 'none';
    }
}

// Show success message (using Bootstrap toast or alert)
function showSuccess(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const container = document.querySelector('main') || document.body;
    const firstChild = container.firstChild;
    if (firstChild) {
        firstChild.parentNode.insertBefore(alertDiv, firstChild);
    } else {
        container.appendChild(alertDiv);
    }

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const dismissBtn = alertDiv.querySelector('.btn-close');
        if (dismissBtn) {
            dismissBtn.click();
        }
    }, 5000);
}

// Debounce function
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Format time
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}
