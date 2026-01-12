// Global variable with default location
const apiKey = env.API_KEY;
let weatherLocation = "London";
const storedFavouriteLocations = [];
let forecastDays = 5;
let weatherData = null; // Changed this to null so data can be loaded before displaying
const todayDateElement = document.getElementById("current-date");
const container = document.getElementById("forecast-container");
const favouriteContainer = document.getElementById("favourites-container");
let userLocation = "";
//Get user's location if available
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
        userLocation = `${position.coords.latitude},${position.coords.longitude}`;
    });
}

//Add date to forecast on page load
const today = new Date();
const options = { year: "numeric", month: "long", day: "numeric" };
todayDateElement.textContent = today.toLocaleDateString(undefined, options);

//submit event listeners
document
    .getElementById("location-form")
    .addEventListener("submit", handleSubmitButtonClick);
document
    .getElementById("forecast-options-form")
    .addEventListener("submit", handleFormFilters);

//Initialize weather display on page load
initializeApp();

/* Initialize Application */
function initializeApp() {
    //get default values
    if (userLocation) {
        weatherLocation = userLocation;
    } else {
        weatherLocation = "London"; // Default location if geolocation fails
    }
    //Call API add update display
    callWeatherAPI(weatherLocation).then((data) => {
        weatherData = data;
        updateWeatherDisplay(weatherLocation, forecastDays);
    });
}

/* API Call to Fetch Data From OpenWeatherMap */
function callWeatherAPI(weatherLocation) {
    console.log("Fetching weather data for", weatherLocation);
    const endpoint = `https://api.openweathermap.org/data/2.5/forecast?q=${weatherLocation}&appid=${apiKey}&units=metric`;
    // This is now asynchronous, returning a promise (fetch) it then needs to be handled with .then() when called
    return fetch(endpoint)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            return data; // keep the full object
        });
}

function updateWeatherDisplay() {
    if (!weatherData || !weatherData.list || !weatherData.city) return; // this check ensures it only runs once weatherData is defined.
    const container = document.getElementById("forecast-container");
    forecastDays =
        parseInt(document.getElementById("forecastDays").value, 10) || 1;
    // Update forecast based on user input

    console.log(forecastDays); // Number of days to fetch

    //Main current weather display
    document.getElementById("current-location").textContent =
        weatherData.city.name;
    document.getElementById("temp-display").textContent =
        weatherData.list[0].main.temp + "°C";
    document.getElementById("feels-like").textContent =
        weatherData.list[0].main.feels_like + "°C";
    document.getElementById("weather-type").textContent =
        weatherData.list[0].weather[0].main;
    document.getElementById("today-image").src =
        "https://openweathermap.org/img/wn/" +
        weatherData.list[0].weather[0].icon +
        "@2x.png";
    document.getElementById(
        "wind-today"
    ).textContent = `${weatherData.list[0].wind.speed} m/s`;

    //Adjust number of forecast cards
    while (container.querySelectorAll(".forecast-card").length < forecastDays) {
        addCard(container);
    }
    while (container.querySelectorAll(".forecast-card").length > forecastDays) {
        removeCard(container);
    }
    //Future Forecast display
    for (let i = 0; i < forecastDays; i++) {
        //Get data for each forecast day
        let forecast = weatherData.list[i * 8];

        //define variables for arrays of elements to be updated
        const dayElements = document.querySelectorAll(".forecast-card .day");
        const tempElements = document.querySelectorAll(
            ".forecast-card .temp-display"
        );
        const feelsLikeElements = document.querySelectorAll(
            ".forecast-card .feels-like"
        );
        const weatherTypeElements = document.querySelectorAll(
            ".forecast-card .weather-type"
        );
        const weatherIconElements = document.querySelectorAll(
            ".forecast-card .weather-icon"
        );
        const windSpeedElements = document.querySelectorAll(
            ".forecast-card .wind-speed"
        );
        const humidityElements = document.querySelectorAll(
            ".forecast-card .humidity"
        );
        //Add null check for each element to allow filters to remove elements
        /* changes date string to day name */
        if (dayElements[i]) {
            const date = new Date(forecast.dt_txt);
            const dayName = date.toLocaleDateString(undefined, {
                weekday: "long",
            });
            dayElements[i].textContent = dayName;
        }

        if (tempElements[i])
            tempElements[i].textContent = forecast.main.temp + " °C";
        if (feelsLikeElements[i])
            feelsLikeElements[i].textContent = forecast.main.feels_like + " °C";
        if (weatherTypeElements[i])
            weatherTypeElements[i].textContent = forecast.weather[0].main;
        if (weatherIconElements[i]) {
            weatherIconElements[i].src =
                "https://openweathermap.org/img/wn/" +
                forecast.weather[0].icon +
                "@2x.png";
        }
        if (windSpeedElements[i])
            windSpeedElements[i].textContent = `${forecast.wind.speed} KPH`;
        if (humidityElements[i])
            humidityElements[i].textContent = forecast.main.humidity + " %";
    }
}

/* Function to handle submit button click, save user input as a variable and then run call to API */

function handleSubmitButtonClick(event) {
    //hide error message and add to faves button on new submit
    document.getElementById("add-favourite-btn").classList = "d-none";
    document.getElementById("error-message").classList = "d-none";
    event.preventDefault();
    /* Handles empty input field */
    if (!document.getElementById("user-input").value) {
        document.getElementById("error-message").classList.toggle("d-none");
        return;
    }
    /* Continues on if location is entered */
    weatherLocation = document.getElementById("user-input").value;
    console.log("User input:", weatherLocation);

    // Fetch new data, then update UI
    callWeatherAPI(weatherLocation).then((data) => {
        weatherData = data;
        updateWeatherDisplay();
    });

    document.getElementById("add-favourite-btn").classList.remove("d-none");
}

function handleFormFilters(event) {
    event.preventDefault();
    //get filter values
    const showWind = document.getElementById("windCheck").checked;
    const showTemp = document.getElementById("tempCheck").checked;
    const showHumidity = document.getElementById("humidityCheck").checked;

    //Get all wind speed elements

    let windElements = document.querySelectorAll(".wind-speed");
    let tempElements = document.querySelectorAll(".temp-display");
    let feelsLikeElements = document.querySelectorAll(".feels-like");
    let humidityElements = document.querySelectorAll(".humidity");

    //loop through and remove or add based on filter
    windElements.forEach((element) => {
        if (showWind) {
            element.classList.remove("d-none");
        } else {
            element.classList.add("d-none");
        }
    });
    tempElements.forEach((element) => {
        if (showTemp) {
            element.classList.remove("d-none");
        } else {
            element.classList.add("d-none");
        }
    });
    feelsLikeElements.forEach((element) => {
        if (showTemp) {
            element.classList.remove("d-none");
        } else {
            element.classList.add("d-none");
        }
    });
    humidityElements.forEach((element) => {
        if (showHumidity) {
            element.classList.remove("d-none");
        } else {
            element.classList.add("d-none");
        }
    });
    /*could also just call update display again to refresh all data
    
    should probably add a check to see if we need to run the update again:
    add some variable tracking to see if any of the filters have changed since last time :
    let lastShowWind, lastShowTemp, lastShowPrecipitation = null
    compare current values to last values  
    if changed run update display again
    */
    updateWeatherDisplay();
}

function addFavouriteLocation(event) {
    event.preventDefault();
    const maxMsg = document.getElementById("max-favourites-msg");
    if (maxMsg) maxMsg.classList.add("d-none");

    const favouriteLocation =
        document.getElementById("current-location").textContent;

    if (favouriteContainer.children.length >= 3) {
        if (maxMsg) maxMsg.classList.remove("d-none");
        return;
    }

    addCard(favouriteContainer);

    // Wait for the API call to complete before accessing data
    callWeatherAPI(favouriteLocation).then((favouriteData) => {
        console.log(favouriteData);
        document.getElementsByClassName("favourite-title").textContent =
            favouriteData.city.name;
        document.getElementsByClassName("favourite-image").src =
            "https://openweathermap.org/img/wn/" +
            favouriteData.list[0].weather[0].icon +
            "@2x.png";
        document.getElementsByClassName("favourite-temp-display").textContent =
            favouriteData.list[0].main.temp + "°C";
        document.getElementsByClassName("favourite-weather-type").textContent =
            favouriteData.list[0].weather[0].main;
    });
}

function removeFavouriteLocation(event) {
    const closeBtn = event.target.closest(".remove-favourite-btn");
    if (!closeBtn) return;
    event.preventDefault();
    const card = closeBtn.closest(".forecast-card");
    if (card) card.remove();
    const maxMsg = document.getElementById("max-favourites-msg");
    if (maxMsg && favouriteContainer.children.length <= 3) {
        maxMsg.classList.add("d-none");
    }
}
// Favourite Location Event Listener - Must go underneath function definitions to work
document
    .getElementById("add-favourite-btn")
    .addEventListener("click", addFavouriteLocation);

favouriteContainer.addEventListener("click", removeFavouriteLocation);

//Add a new forecast card to container, by cloning first card or creating new if empty
function addCard(container) {
    const firstCard = container.querySelector(".forecast-card");
    if (firstCard) {
        const newCard = firstCard.cloneNode(true);
        container.appendChild(newCard);
    } else {
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
        container.appendChild(newCard);
    }
}

//Remove last forecast card from container
function removeCard(container) {
    if (container.children.length > 0) {
        let lastCard = container.lastElementChild;
        container.removeChild(lastCard);
    }
}
