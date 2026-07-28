"use strict";
let weatherLocation = "London";
const storedFavouriteLocations = [];
let forecastDays = 5;
let weatherData = null;
let userLocation = "";
const todayDateElement = document.getElementById("current-date");
const container = document.getElementById("forecast-container");
const favouriteContainer = document.getElementById("favourites-container");
const currentLocationBtn = document.getElementById("current-location-btn");
if (currentLocationBtn) {
    currentLocationBtn.addEventListener("click", getCurrentLocationWeather);
}
const today = new Date();
const options = { year: "numeric", month: "long", day: "numeric" };
if (todayDateElement) {
    todayDateElement.textContent = today.toLocaleDateString(undefined, options);
}
const locationForm = document.getElementById("location-form");
if (locationForm) {
    locationForm.addEventListener("submit", handleSubmitButtonClick);
}
const forecastOptionsForm = document.getElementById("forecast-options-form");
if (forecastOptionsForm) {
    forecastOptionsForm.addEventListener("submit", handleFormFilters);
}
const addFavBtn = document.getElementById("add-favourite-btn");
if (addFavBtn) {
    addFavBtn.addEventListener("click", addFavouriteLocation);
}


// Scale current-location text to fit forecast-today width
window.addEventListener("resize", scaleCurrentLocationText);

initializeApp();

function scaleCurrentLocationText() {
    const currentLocationEl = document.getElementById("current-location");
    const forecastTodayEl = document.getElementById("forecast-today");
    
    if (!currentLocationEl || !forecastTodayEl) return;
    
    // Reset font size to measure
    currentLocationEl.style.fontSize = "";
    
    const maxWidth = forecastTodayEl.offsetWidth;
    let fontSize = 12; // Start small
    
    // Binary search for optimal font size
    let minSize = 8;
    let maxSize = 144;
    
    while (minSize <= maxSize) {
        const midSize = Math.floor((minSize + maxSize) / 2);
        currentLocationEl.style.fontSize = midSize + "px";
        
        if (currentLocationEl.scrollWidth <= maxWidth) {
            // Text fits, try larger
            fontSize = midSize;
            minSize = midSize + 1;
        } else {
            // Text doesn't fit, try smaller
            maxSize = midSize - 1;
        }
    }
    
    currentLocationEl.style.fontSize = fontSize + "px";
}

function initializeApp() {
    getCurrentLocation().then((location) => {
        weatherLocation = location || "London";
        return callWeatherAPI(weatherLocation);
    }).then((data) => {
        weatherData = data;
        updateWeatherDisplay();
        // Load favourite locations if user is authenticated
        loadFavouriteLocations();
    });
}

function getCurrentLocation() {    
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve("");
            return;
        }
        navigator.geolocation.getCurrentPosition((position) => {
            userLocation = `${position.coords.latitude},${position.coords.longitude}`;
            resolve(userLocation);
        }, () => resolve(""));
    });
}

function getCurrentLocationWeather() {
    getCurrentLocation().then((location) => callWeatherAPI(location || userLocation || weatherLocation)).then((data) => {
        weatherData = data;
        updateWeatherDisplay();
    });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


//main weather API call - fetch from backend (backend handles cache etc)
function callWeatherAPI(location) {
    console.log("Fetching weather data for", location);
    const endpoint = `/weather/api/weather/?q=${encodeURIComponent(location)}`;
    return fetch(endpoint)
        .then(function (response) {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
        .then(function (data) {
            console.log(data)
        return data;
    })
        .catch(function (error) {
        console.error("Error fetching weather:", error);
        return null;
    });
}

//Main forecast display js
function updateWeatherDisplay() {
    if (!weatherData || !weatherData.list || !weatherData.city)
        return;
    const forecastDaysInput = document.getElementById("forecastDays");
    if (forecastDaysInput) {
        forecastDays = parseInt(forecastDaysInput.value, 10) || 1;
    }
    console.log(forecastDays);
    const currentLocationEl = document.getElementById("current-location");
    if (currentLocationEl)
        currentLocationEl.textContent = weatherData.city.name;
    const tempDisplayEl = document.getElementById("todaydetails-temp");
    if (tempDisplayEl)
        tempDisplayEl.textContent = weatherData.list[0].main.temp + "°C";
    const feelsLikeEl = document.getElementById("feels-like-display");
    if (feelsLikeEl)
        feelsLikeEl.textContent = weatherData.list[0].main.feels_like + "°C";
    const weatherTypeEl = document.getElementById("weather-label");
    if (weatherTypeEl)
        weatherTypeEl.textContent = weatherData.list[0].weather[0].main;
    const todayImageEl = document.getElementById("today-image");
    if (todayImageEl)
        todayImageEl.src = "/static/images/weathericons/" + weatherData.list[0].weather[0].main + ".png";

    const windTodayEl = document.getElementById("todaydetails-wind");
    if (windTodayEl)
        windTodayEl.textContent = `${weatherData.list[0].wind.speed} m/s`;
    const windSpeedDisplayEl = document.getElementById("wind-speed-display");
    if (windSpeedDisplayEl)
        windSpeedDisplayEl.textContent = `${weatherData.list[0].wind.speed} m/s`;
    const humidityDisplayEl = document.getElementById("humidity-display");
    if (humidityDisplayEl)
        humidityDisplayEl.textContent = `${weatherData.list[0].main.humidity}%`;
    if (container) {
        while (container.querySelectorAll(".forecast-card").length < forecastDays) {
            addForecastCard(container);
        }
        while (container.querySelectorAll(".forecast-card").length > forecastDays) {
            const cards = container.querySelectorAll(".forecast-card");
            if (cards.length > 0) {
                cards[cards.length - 1].remove();
            }
        }
    }
    const dailyForecasts = buildDailyForecasts(weatherData.list);
    for (let i = 0; i < forecastDays; i++) {
        const forecast = dailyForecasts[i];
        if (!forecast)
            continue;
        const dayElements = document.querySelectorAll(".forecast-card .day");
        const maxTempElements = document.querySelectorAll(".forecast-card .max-temp");
        const minTempElements = document.querySelectorAll(".forecast-card .min-temp");
        const weatherTypeElements = document.querySelectorAll(".forecast-card .weather-type");
        const weatherIconElements = document.querySelectorAll(".forecast-card .weather-icon");
        const windSpeedElements = document.querySelectorAll(".forecast-card .wind-speed");
        const humidityElements = document.querySelectorAll(".forecast-card .humidity");
        // Indexing starts at 0, but we want to skip the first card for today, so we use i-1 for the day name
        if (dayElements[i-1]) {
            const date = new Date(forecast.dt_txt);
            dayElements[i-1].textContent = date.toLocaleDateString(undefined, { weekday: "long" });
        }
        if (maxTempElements[i])
            maxTempElements[i].textContent = `${Math.round(forecast.maxTemp)} °C`;
        if (minTempElements[i])
            minTempElements[i].textContent = `${Math.round(forecast.minTemp)} °C`;
        if (weatherTypeElements[i])
            weatherTypeElements[i].textContent = forecast.weather[0].main;
        if (weatherIconElements[i]) {
            weatherIconElements[i].src = "https://openweathermap.org/img/wn/" + forecast.weather[0].icon + "@4x.png";
        }
        if (windSpeedElements[i])
            windSpeedElements[i].textContent = `${forecast.wind.speed} KPH`;
        if (humidityElements[i])
            humidityElements[i].textContent = forecast.main.humidity + " %";
    }
    
    // Scale current-location text to fit forecast-today width
    scaleCurrentLocationText();
}

function buildDailyForecasts(forecastList) {
    const forecastDaysMap = new Map();
    forecastList.forEach((forecast) => {
        const dateKey = forecast.dt_txt.slice(0, 10);
        if (!forecastDaysMap.has(dateKey)) {
            forecastDaysMap.set(dateKey, []);
        }
        forecastDaysMap.get(dateKey).push(forecast);
    });
    return Array.from(forecastDaysMap.values()).map((dayForecasts) => {
        const temperatures = dayForecasts.map((forecast) => forecast.main.temp);
        return {
            ...dayForecasts[0],
            minTemp: Math.min(...temperatures),
            maxTemp: Math.max(...temperatures)
        };
    });
}


function handleSubmitButtonClick(event) {
    const addFavBtn = document.getElementById("add-favourite-btn");
    if (addFavBtn)
        addFavBtn.classList.remove("d-none");
    const errorMsg = document.getElementById("error-message");
    if (errorMsg)
        errorMsg.classList.add("d-none");
    event.preventDefault();
    const userInput = document.getElementById("user-input");
    if (!userInput || !userInput.value) {
        if (errorMsg)
            errorMsg.classList.remove("d-none");
        return;
    }
    weatherLocation = userInput.value;
    console.log("User input:", weatherLocation);
    callWeatherAPI(weatherLocation).then((data) => {
        if (data) {
            weatherData = data;
            updateWeatherDisplay();
        }
    });
}

function handleFormFilters(event) {
    var _a, _b, _c;
    event.preventDefault();
    
    // Read visibility filter checkboxes
    const showWind = (_a = document.getElementById("windCheck")) === null || _a === void 0 ? void 0 : _a.checked;
    const showTemp = (_b = document.getElementById("tempCheck")) === null || _b === void 0 ? void 0 : _b.checked;
    const showHumidity = (_c = document.getElementById("humidityCheck")) === null || _c === void 0 ? void 0 : _c.checked;
    
    // Update number of forecast days
    const forecastDaysInput = document.getElementById("forecastDays");
    if (forecastDaysInput) {
        forecastDays = parseInt(forecastDaysInput.value, 10) || 5;
    }
    
    // Toggle visibility of elements based on filter checkboxes
    const windElements = document.querySelectorAll(".wind-speed");
    const maxTempElements = document.querySelectorAll(".max-temp");
    const minTempElements = document.querySelectorAll(".min-temp");
    const humidityElements = document.querySelectorAll(".humidity");
    
    windElements.forEach((element) => {
        showWind ? element.classList.remove("d-none") : element.classList.add("d-none");
    });
    maxTempElements.forEach((element) => {
        showTemp ? element.classList.remove("d-none") : element.classList.add("d-none");
    });
    minTempElements.forEach((element) => {
        showTemp ? element.classList.remove("d-none") : element.classList.add("d-none");
    });
    humidityElements.forEach((element) => {
        showHumidity ? element.classList.remove("d-none") : element.classList.add("d-none");
    });
    
    // Refresh display with new forecast days count and visibility settings
    updateWeatherDisplay();
}


/** Favourite location functions
 *  Add / remove functions
 *  Get and update display function (called by add and remove)
 */


function addFavouriteLocation(event) {
    event.preventDefault();
    const maxMsg = document.getElementById("max-favourites-msg");
    if (maxMsg)
        maxMsg.classList.add("d-none");
    const currentLocationEl = document.getElementById("current-location");
    const favouriteLocation = currentLocationEl ? currentLocationEl.textContent.trim() : "";
    
    if (favouriteContainer && favouriteContainer.children.length >= 3) {
        if (maxMsg)
            maxMsg.classList.remove("d-none");
        return;
    }
    
    if (!favouriteLocation || favouriteLocation === 'LOCATION') {
        alert('Please search for a location first');
        return;
    }
    
    // Make fetch request to add favourite location
    const url = `/weather/api/favourites/add/${encodeURIComponent(favouriteLocation)}/`;
    fetch(url, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            // Reload favourites after successful add
            loadFavouriteLocations();
        } else {
            alert('Failed to add favourite location');
        }
    })
    .catch(error => {
        console.error('Error adding favourite:', error);
        alert('Error adding favourite location');
    });
    
    //add favourite card+ container and call api for data.
    //as this is tiered cache in backend, we will use existing data
    if (favouriteContainer) {
        addCard(favouriteContainer);
    }
    if (favouriteLocation) {
        callWeatherAPI(favouriteLocation).then((favouriteData) => {
            if (favouriteData && favouriteData.city) {
                const favTitle = document.getElementById("favourite-title");
                if (favTitle)
                    favTitle.textContent = favouriteData.city.name;
                const favImg = document.getElementById("favourite-image");
                if (favImg)
                    favImg.src = "https://openweathermap.org/img/wn/" + favouriteData.list[0].weather[0].icon + "@2x.png";
                const favTemp = document.getElementById("favourite-temp-display");
                if (favTemp)
                    favTemp.textContent = favouriteData.list[0].main.temp + "°C";
                const favWeather = document.getElementById("favourite-weather-type");
                if (favWeather)
                    favWeather.textContent = favouriteData.list[0].weather[0].main;
            }
        });
    }
}

function confirmModal(event){
    //show delete confirmation modal when remove favourite clicked.
    const target = event.target;
    const closeBtn = target.closest(".remove-favourite-btn");
    if (!closeBtn)
        return;
    event.preventDefault();
    const card = closeBtn.closest(".forecast-card");
    if (!card) return;
    window.cardToDelete = card;
    const modal = new window.bootstrap.Modal(
        document.getElementById("deleteConfirmModal"),
    );
    modal.show();
}

//run removeFav when modal confirmed
const confirmDeleteBtn = document.getElementById(
    "confirmDeleteBtn",
    );
if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", () => {
        removeFavouriteLocation(window.cardToDelete);
        // Close modal
        const modal = window.bootstrap.Modal.getInstance(
            document.getElementById("deleteConfirmModal"),
        );
        if (modal) modal.hide();
    });
}



function removeFavouriteLocation(card) {
    if (!card) return; 

    const locationTitle = card.querySelector(".favourite-title");
    const locationName = locationTitle ? locationTitle.textContent.trim() : "";
        
        // Make fetch request to remove favourite location
    if (locationName && locationName !== "Location") {
        const url = `/weather/api/favourites/remove/${encodeURIComponent(locationName)}/`;
        fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
                }
        })
        .then(response => {
            if (response.ok) {
                card.remove();
                alert('Removed favourite location');
            } else {
                alert('Failed to remove favourite location');
            }
        })
        .catch(error => {
            console.error('Error removing favourite:', error);
            alert('Error removing favourite location');
        }); 
        }
    const maxMsg = document.getElementById("max-favourites-msg");
    if (maxMsg && favouriteContainer && favouriteContainer.children.length <= 3) {
        maxMsg.classList.add("d-none");
    }
}


function addForecastCard(containerToUse) {

    const firstCard = containerToUse.querySelector("#forecast-container");
    if (firstCard) {
        const newCard = firstCard.cloneNode(true);
        containerToUse.appendChild(newCard);
    }
    else {
        const newCard = document.createElement("div");
        newCard.className = "col-6 col-sm-4 col-md-3 col-lg-2 forecast-card mb-2";
        newCard.innerHTML = `
            <div class="card weather-card h-100">
                <div class="day"></div>
                <img src="{% static 'images/favicon.ico' %}" alt="Weather Icon" class="weather-icon" />
                <div class="max-temp"></div>
                <div class="min-temp"></div>
                <div class="weather-type">{Weather}</div>
                <div class="humidity small">Rain Amount</div>
                <div class="wind-speed">Wind</div>
                </div>
            </div>
    `;
        containerToUse.appendChild(newCard);
    }
}

function addCard(containerToUse) {
    const firstCard = containerToUse.querySelector(".forecast-card");
    if (firstCard) {
        const newCard = firstCard.cloneNode(true);
        containerToUse.appendChild(newCard);
        return newCard;
    }
    else {
        const newCard = document.createElement("div");
        newCard.className = "forecast-card col-md-4 mb-3";
        newCard.innerHTML = `
      <div class="favourite-card weather-card card h-100 position-relative">
        <button class="remove-favourite-btn btn-close position-absolute top-0 end-0 m-2" aria-label="Remove favourite"></button>
        <div class="card-body">
          <h5 class="favourite-title card-title fs-1">Location</h5>
          <img class="favourite-image weather-icon mb-2" src="" alt="Weather icon">
          <p class="favourite-weather-type weather-type">Weather Type</p>
          <p class="favourite-temp-display temp-display">Temperature: --°C</p>
        </div>
      </div>
    `;
        const removeBtn = newCard.querySelector(".remove-favourite-btn");
        if (removeBtn) {
            removeBtn.addEventListener("click", confirmModal);
        }
        
        containerToUse.appendChild(newCard);
                return newCard;
    }
}



// Load favourite locations from the API endpoint
function loadFavouriteLocations() {
    fetch('/weather/api/favourites/')
        .then(response => {
            const contentType = response.headers.get("content-type") || "";

            if (!contentType.includes("application/json")) {
                throw new Error(`Expected JSON from favourites API, got ${contentType || 'unknown content type'}`);
            }

            return response.json().then(data => {
                if (!response.ok) {
                    throw new Error(data.error || `Favourites API request failed with status ${response.status}`);
                }

                return data;
            });
        })
        .then(data => {
            if (data.success && favouriteContainer) {
                // Clear existing cards
                favouriteContainer.innerHTML = '';
                // Add a card for each favourite location
                data.locations.forEach(location => {
                    const favouriteCard = addCard(favouriteContainer);
                    // Load weather data for this location
                    callWeatherAPI(location.location).then((weatherData) => {
                        if (weatherData && weatherData.city && favouriteCard) {
                            const favTitle = favouriteCard.querySelector('.favourite-title');
                            if (favTitle)
                                favTitle.textContent = weatherData.city.name;

                            const favImg = favouriteCard.querySelector('.favourite-image');
                            if (favImg)
                                favImg.src = "https://openweathermap.org/img/wn/" + weatherData.list[0].weather[0].icon + "@2x.png";

                            const favTemp = favouriteCard.querySelector('.favourite-temp-display');
                            if (favTemp)
                                favTemp.textContent = weatherData.list[0].main.temp + "°C";

                            const favWeather = favouriteCard.querySelector('.favourite-weather-type');
                            if (favWeather)
                                favWeather.textContent = weatherData.list[0].weather[0].main;
                        }
                    });
                });
            }
        })
        .catch(error => console.error('Error loading favourites:', error));
}
