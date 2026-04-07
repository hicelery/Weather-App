"use strict";
let weatherLocation = "London";
const storedFavouriteLocations = [];
let forecastDays = 5;
let weatherData = null;
const todayDateElement = document.getElementById("current-date");
const container = document.getElementById("forecast-container");
const favouriteContainer = document.getElementById("favourites-container");
let userLocation = "";
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
        userLocation = `${position.coords.latitude},${position.coords.longitude}`;
    });
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
initializeApp();

function initializeApp() {
    if (userLocation) {
        weatherLocation = userLocation;
    }
    else {
        weatherLocation = "London";
    }
    callWeatherAPI(weatherLocation).then((data) => {
        weatherData = data;
        updateWeatherDisplay();
    });
}

function callWeatherAPI(location) {
    console.log("Fetching weather data for", location);
    const endpoint = `/api/weather/?q=${encodeURIComponent(location)}`;
    return fetch(endpoint)
        .then(function (response) {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
        .then(function (data) {
        console.log(data);
        return data;
    })
        .catch(function (error) {
        console.error("Error fetching weather:", error);
        return null;
    });
}

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
    const tempDisplayEl = document.getElementById("temp-display");
    if (tempDisplayEl)
        tempDisplayEl.textContent = weatherData.list[0].main.temp + "°C";
    const feelsLikeEl = document.getElementById("feels-like");
    if (feelsLikeEl)
        feelsLikeEl.textContent = weatherData.list[0].main.feels_like + "°C";
    const weatherTypeEl = document.getElementById("weather-type");
    if (weatherTypeEl)
        weatherTypeEl.textContent = weatherData.list[0].weather[0].main;
    const todayImageEl = document.getElementById("today-image");
    if (todayImageEl)
        todayImageEl.src = "https://openweathermap.org/img/wn/" + weatherData.list[0].weather[0].icon + "@2x.png";
    const windTodayEl = document.getElementById("wind-today");
    if (windTodayEl)
        windTodayEl.textContent = `${weatherData.list[0].wind.speed} m/s`;
    if (container) {
        while (container.querySelectorAll(".forecast-card").length < forecastDays) {
            addCard(container);
        }
        while (container.querySelectorAll(".forecast-card").length > forecastDays) {
            const cards = container.querySelectorAll(".forecast-card");
            if (cards.length > 0) {
                cards[cards.length - 1].remove();
            }
        }
    }
    for (let i = 0; i < forecastDays; i++) {
        let forecast = weatherData.list[i * 8];
        if (!forecast)
            continue;
        const dayElements = document.querySelectorAll(".forecast-card .day");
        const tempElements = document.querySelectorAll(".forecast-card .temp-display");
        const feelsLikeElements = document.querySelectorAll(".forecast-card .feels-like");
        const weatherTypeElements = document.querySelectorAll(".forecast-card .weather-type");
        const weatherIconElements = document.querySelectorAll(".forecast-card .weather-icon");
        const windSpeedElements = document.querySelectorAll(".forecast-card .wind-speed");
        const humidityElements = document.querySelectorAll(".forecast-card .humidity");
        if (dayElements[i]) {
            const date = new Date(forecast.dt_txt);
            dayElements[i].textContent = date.toLocaleDateString(undefined, { weekday: "long" });
        }
        if (tempElements[i])
            tempElements[i].textContent = forecast.main.temp + " °C";
        if (feelsLikeElements[i])
            feelsLikeElements[i].textContent = forecast.main.feels_like + " °C";
        if (weatherTypeElements[i])
            weatherTypeElements[i].textContent = forecast.weather[0].main;
        if (weatherIconElements[i]) {
            weatherIconElements[i].src = "https://openweathermap.org/img/wn/" + forecast.weather[0].icon + "@2x.png";
        }
        if (windSpeedElements[i])
            windSpeedElements[i].textContent = `${forecast.wind.speed} KPH`;
        if (humidityElements[i])
            humidityElements[i].textContent = forecast.main.humidity + " %";
    }
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
    const showWind = (_a = document.getElementById("windCheck")) === null || _a === void 0 ? void 0 : _a.checked;
    const showTemp = (_b = document.getElementById("tempCheck")) === null || _b === void 0 ? void 0 : _b.checked;
    const showHumidity = (_c = document.getElementById("humidityCheck")) === null || _c === void 0 ? void 0 : _c.checked;
    const windElements = document.querySelectorAll(".wind-speed");
    const tempElements = document.querySelectorAll(".temp-display");
    const feelsLikeElements = document.querySelectorAll(".feels-like");
    const humidityElements = document.querySelectorAll(".humidity");
    windElements.forEach((element) => {
        showWind ? element.classList.remove("d-none") : element.classList.add("d-none");
    });
    tempElements.forEach((element) => {
        showTemp ? element.classList.remove("d-none") : element.classList.add("d-none");
    });
    feelsLikeElements.forEach((element) => {
        showTemp ? element.classList.remove("d-none") : element.classList.add("d-none");
    });
    humidityElements.forEach((element) => {
        showHumidity ? element.classList.remove("d-none") : element.classList.add("d-none");
    });
    updateWeatherDisplay();
}


function addFavouriteLocation(event) {
    event.preventDefault();
    const maxMsg = document.getElementById("max-favourites-msg");
    if (maxMsg)
        maxMsg.classList.add("d-none");
    const currentLocationEl = document.getElementById("current-location");
    const favouriteLocation = currentLocationEl ? currentLocationEl.textContent : "";
    if (favouriteContainer && favouriteContainer.children.length >= 3) {
        if (maxMsg)
            maxMsg.classList.remove("d-none");
        return;
    }
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


function removeFavouriteLocation(event) {
    const target = event.target;
    const closeBtn = target.closest(".remove-favourite-btn");
    if (!closeBtn)
        return;
    event.preventDefault();
    const card = closeBtn.closest(".forecast-card");
    if (card)
        card.remove();
    const maxMsg = document.getElementById("max-favourites-msg");
    if (maxMsg && favouriteContainer && favouriteContainer.children.length <= 3) {
        maxMsg.classList.add("d-none");
    }
}
const addFavBtn = document.getElementById("add-favourite-btn");
if (addFavBtn) {
    addFavBtn.addEventListener("click", addFavouriteLocation);
}
if (favouriteContainer) {
    favouriteContainer.addEventListener("click", removeFavouriteLocation);
}


function addCard(containerToUse) {
    const firstCard = containerToUse.querySelector(".forecast-card");
    if (firstCard) {
        const newCard = firstCard.cloneNode(true);
        containerToUse.appendChild(newCard);
    }
    else {
        const newCard = document.createElement("div");
        newCard.className = "forecast-card col-md-4 mb-3";
        newCard.innerHTML = `
      <div class="favourite-card weather-card card h-100 position-relative">
        <button class="remove-favourite-btn btn-close position-absolute top-0 end-0 m-2" aria-label="Remove favourite"></button>
        <div class="card-body">
          <h5 id="favourite-title" class="card-title fs-1">Location</h5>
          <img id="favourite-image" class="weather-icon mb-2" src="" alt="Weather icon">
          <p id="favourite-weather-type" class="weather-type">Weather Type</p>
          <p id="favourite-temp-display" class="temp-display">Temperature: --°C</p>
        </div>
      </div>
    `;
        containerToUse.appendChild(newCard);
    }
}
