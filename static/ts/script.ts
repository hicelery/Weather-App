// Global variable with default location
let weatherLocation: string = "London";
const storedFavouriteLocations: string[] = [];
let forecastDays: number = 5;
let weatherData: any = null; // Changed this to null so data can be loaded before displaying
const todayDateElement = document.getElementById("current-date") as HTMLElement;
const container = document.getElementById("forecast-container") as HTMLElement;
const favouriteContainer = document.getElementById(
    "favourites-container",
) as HTMLElement;
const currentLocationBtn = document.getElementById(
    "current-location-btn",
) as HTMLButtonElement | null;
if (currentLocationBtn) {
    currentLocationBtn.addEventListener("click", getCurrentLocationWeather);
}
let userLocation: string = "";

//Get user's location if available
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
        userLocation = `${position.coords.latitude},${position.coords.longitude}`;
    });
}

//Add date to forecast on page load
const today = new Date();
const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
};
if (todayDateElement) {
    todayDateElement.textContent = today.toLocaleDateString(undefined, options);
}

//submit event listeners
const locationForm = document.getElementById(
    "location-form",
) as HTMLFormElement | null;
if (locationForm) {
    locationForm.addEventListener("submit", handleSubmitButtonClick);
}

const forecastOptionsForm = document.getElementById(
    "forecast-options-form",
) as HTMLFormElement | null;
if (forecastOptionsForm) {
    forecastOptionsForm.addEventListener("submit", handleFormFilters);
}

// Scale current-location text to fit forecast-today width
window.addEventListener("resize", scaleCurrentLocationText);

//Initialize weather display on page load
initializeApp();

function scaleCurrentLocationText(): void {
    const currentLocationEl = document.getElementById(
        "current-location",
    ) as HTMLElement | null;
    const forecastTodayEl = document.getElementById(
        "forecast-today",
    ) as HTMLElement | null;

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

/* Initialize Application */
function initializeApp(): void {
    getCurrentLocation()
        .then((location) => {
            weatherLocation = location || "London";
            return callWeatherAPI(weatherLocation);
        })
        .then((data) => {
            weatherData = data;
            updateWeatherDisplay();
        });
}

function getCurrentLocation(): Promise<string> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve("");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = `${position.coords.latitude},${position.coords.longitude}`;
                resolve(userLocation);
            },
            () => resolve(""),
        );
    });
}

function getCurrentLocationWeather(): void {
    getCurrentLocation()
        .then((location) =>
            callWeatherAPI(location || userLocation || weatherLocation),
        )
        .then((data) => {
            weatherData = data;
            updateWeatherDisplay();
        });
}

/* API Call to Fetch Data From Django Backend */
function callWeatherAPI(location: string): Promise<any> {
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
            console.log(data);
            return data;
        })
        .catch(function (error) {
            console.error("Error fetching weather:", error);
            return null;
        });
}

function updateWeatherDisplay(): void {
    if (!weatherData || !weatherData.list || !weatherData.city) return;

    const forecastDaysInput = document.getElementById(
        "forecastDays",
    ) as HTMLInputElement | null;
    if (forecastDaysInput) {
        forecastDays = parseInt(forecastDaysInput.value, 10) || 1;
    }
    console.log(forecastDays);

    const currentLocationEl = document.getElementById(
        "current-location",
    ) as HTMLElement | null;
    if (currentLocationEl)
        currentLocationEl.textContent = weatherData.city.name;

    const tempDisplayEl = document.getElementById(
        "todaydetails-temp",
    ) as HTMLElement | null;
    if (tempDisplayEl)
        tempDisplayEl.textContent = weatherData.list[0].main.temp + "°C";

    const feelsLikeEl = document.getElementById(
        "feels-like-display",
    ) as HTMLElement | null;
    if (feelsLikeEl)
        feelsLikeEl.textContent = weatherData.list[0].main.feels_like + "°C";

    const weatherTypeEl = document.getElementById(
        "todaydetails-weather",
    ) as HTMLElement | null;
    if (weatherTypeEl)
        weatherTypeEl.textContent = weatherData.list[0].weather[0].main;

    const todayImageEl = document.getElementById(
        "today-image",
    ) as HTMLImageElement | null;
    if (todayImageEl)
        todayImageEl.src =
            "/static/images/weathericons/" +
            weatherData.list[0].weather[0].main +
            ".png";

    const windTodayEl = document.getElementById(
        "todaydetails-wind",
    ) as HTMLElement | null;
    if (windTodayEl)
        windTodayEl.textContent = `${weatherData.list[0].wind.speed} m/s`;

    const windSpeedDisplayEl = document.getElementById(
        "wind-speed-display",
    ) as HTMLElement | null;
    if (windSpeedDisplayEl)
        windSpeedDisplayEl.textContent = `${weatherData.list[0].wind.speed} m/s`;

    const humidityDisplayEl = document.getElementById(
        "humidity-display",
    ) as HTMLElement | null;
    if (humidityDisplayEl)
        humidityDisplayEl.textContent = `${weatherData.list[0].main.humidity}%`;

    //Adjust number of forecast cards
    if (container) {
        while (
            container.querySelectorAll(".forecast-card").length < forecastDays
        ) {
            addCard(container);
        }
        while (
            container.querySelectorAll(".forecast-card").length > forecastDays
        ) {
            const cards = container.querySelectorAll(".forecast-card");
            if (cards.length > 0) {
                cards[cards.length - 1].remove();
            }
        }
    }

    //Future Forecast display
    for (let i = 0; i < forecastDays; i++) {
        let forecast = weatherData.list[i * 8];
        if (!forecast) continue;

        const dayElements = document.querySelectorAll(".forecast-card .day");
        const tempElements = document.querySelectorAll(
            ".forecast-card .temp-display",
        );
        const feelsLikeElements = document.querySelectorAll(
            ".forecast-card .feels-like",
        );
        const weatherTypeElements = document.querySelectorAll(
            ".forecast-card .weather-type",
        );
        const weatherIconElements = document.querySelectorAll(
            ".forecast-card .weather-icon",
        );
        const windSpeedElements = document.querySelectorAll(
            ".forecast-card .wind-speed",
        );
        const humidityElements = document.querySelectorAll(
            ".forecast-card .humidity",
        );

        // Indexing starts at 0, but we want to skip the first card for today, so we use i-1 for the day name
        if (dayElements[i - 1]) {
            const date = new Date(forecast.dt_txt);
            dayElements[i - 1].textContent = date.toLocaleDateString(
                undefined,
                {
                    weekday: "long",
                },
            );
        }

        if (tempElements[i])
            tempElements[i].textContent = forecast.main.temp + " °C";
        if (feelsLikeElements[i])
            feelsLikeElements[i].textContent = forecast.main.feels_like + " °C";
        if (weatherTypeElements[i])
            weatherTypeElements[i].textContent = forecast.weather[0].main;
        if (weatherIconElements[i]) {
            (weatherIconElements[i] as HTMLImageElement).src =
                "https://openweathermap.org/img/wn/" +
                forecast.weather[0].icon +
                "@4x.png";
        }
        if (windSpeedElements[i])
            windSpeedElements[i].textContent = `${forecast.wind.speed} KPH`;
        if (humidityElements[i])
            humidityElements[i].textContent = forecast.main.humidity + " %";
    }

    // Scale current-location text to fit forecast-today width
    scaleCurrentLocationText();
}

function handleSubmitButtonClick(event: Event): void {
    const addFavBtn = document.getElementById(
        "add-favourite-btn",
    ) as HTMLButtonElement | null;
    if (addFavBtn) addFavBtn.classList.remove("d-none");

    const errorMsg = document.getElementById(
        "error-message",
    ) as HTMLElement | null;
    if (errorMsg) errorMsg.classList.add("d-none");

    event.preventDefault();

    const userInput = document.getElementById(
        "user-input",
    ) as HTMLInputElement | null;
    if (!userInput || !userInput.value) {
        if (errorMsg) errorMsg.classList.remove("d-none");
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

    updateFavoriteForm(weatherData?.city?.name || weatherLocation);
}

function updateFavoriteForm(location: string): void {
    const form = document.getElementById(
        "add-fav-form",
    ) as HTMLFormElement | null;
    if (form) {
        form.action =
            `{% url 'weather:add_favourite_location' location='PLACEHOLDER' %}`.replace(
                "PLACEHOLDER",
                encodeURIComponent(location),
            );
    }
}

function handleFormFilters(event: Event): void {
    event.preventDefault();
    const showWind = (
        document.getElementById("windCheck") as HTMLInputElement | null
    )?.checked;
    const showTemp = (
        document.getElementById("tempCheck") as HTMLInputElement | null
    )?.checked;
    const showHumidity = (
        document.getElementById("humidityCheck") as HTMLInputElement | null
    )?.checked;

    const windElements = document.querySelectorAll(".wind-speed");
    const tempElements = document.querySelectorAll(".temp-display");
    const feelsLikeElements = document.querySelectorAll(".feels-like");
    const humidityElements = document.querySelectorAll(".humidity");

    windElements.forEach((element) => {
        showWind
            ? element.classList.remove("d-none")
            : element.classList.add("d-none");
    });
    tempElements.forEach((element) => {
        showTemp
            ? element.classList.remove("d-none")
            : element.classList.add("d-none");
    });
    feelsLikeElements.forEach((element) => {
        showTemp
            ? element.classList.remove("d-none")
            : element.classList.add("d-none");
    });
    humidityElements.forEach((element) => {
        showHumidity
            ? element.classList.remove("d-none")
            : element.classList.add("d-none");
    });

    updateWeatherDisplay();
}

function addFavouriteLocation(event: Event): void {
    event.preventDefault();
    const maxMsg = document.getElementById(
        "max-favourites-msg",
    ) as HTMLElement | null;
    if (maxMsg) maxMsg.classList.add("d-none");

    const currentLocationEl = document.getElementById(
        "current-location",
    ) as HTMLElement | null;
    const favouriteLocation = currentLocationEl
        ? currentLocationEl.textContent || ""
        : "";

    if (favouriteContainer && favouriteContainer.children.length >= 3) {
        if (maxMsg) maxMsg.classList.remove("d-none");
        return;
    }

    if (favouriteContainer) {
        addCard(favouriteContainer);
    }

    if (favouriteLocation) {
        callWeatherAPI(favouriteLocation).then((favouriteData) => {
            if (favouriteData && favouriteData.city) {
                const favTitle = document.getElementById(
                    "favourite-title",
                ) as HTMLElement | null;
                if (favTitle) favTitle.textContent = favouriteData.city.name;

                const favImg = document.getElementById(
                    "favourite-image",
                ) as HTMLImageElement | null;
                if (favImg)
                    favImg.src =
                        "https://openweathermap.org/img/wn/" +
                        favouriteData.list[0].weather[0].icon +
                        "@2x.png";

                const favTemp = document.getElementById(
                    "favourite-temp-display",
                ) as HTMLElement | null;
                if (favTemp)
                    favTemp.textContent =
                        favouriteData.list[0].main.temp + "°C";

                const favWeather = document.getElementById(
                    "favourite-weather-type",
                ) as HTMLElement | null;
                if (favWeather)
                    favWeather.textContent =
                        favouriteData.list[0].weather[0].main;
            }
        });
    }
}

function removeFavouriteLocation(event: Event): void {
    const target = event.target as HTMLElement;
    const closeBtn = target.closest(
        ".remove-favourite-btn",
    ) as HTMLElement | null;
    if (!closeBtn) return;

    event.preventDefault();
    const card = closeBtn.closest(".forecast-card") as HTMLElement | null;
    if (card) card.remove();

    const maxMsg = document.getElementById(
        "max-favourites-msg",
    ) as HTMLElement | null;
    if (
        maxMsg &&
        favouriteContainer &&
        favouriteContainer.children.length <= 3
    ) {
        maxMsg.classList.add("d-none");
    }
}

const addFavBtn = document.getElementById(
    "add-favourite-btn",
) as HTMLButtonElement | null;
if (addFavBtn) {
    addFavBtn.addEventListener("click", addFavouriteLocation);
}

if (favouriteContainer) {
    favouriteContainer.addEventListener("click", removeFavouriteLocation);
}

function addCard(containerToUse: HTMLElement): void {
    const firstCard = containerToUse.querySelector(".forecast-card");
    if (firstCard) {
        const newCard = firstCard.cloneNode(true) as HTMLElement;
        containerToUse.appendChild(newCard);
    } else {
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
