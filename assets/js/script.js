// Global variable with default location
const apiKey = "81feab47f2b2b44f10ee9f0f9a026041";
let weatherLocation = "London";
const storedFavouriteLocations = [];
let forecastDays = 5;
let weatherData = null; // Changed this to null so data can be loaded before displaying
const todayDateElement = document.getElementById("current-date");
const container = document.getElementById("forecast-container");
const favouriteContainer = document.getElementById("favourites-container");

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

//get data on initial load, had to make this asynchronous to ensure data is ready before UI update
callWeatherAPI(weatherLocation).then((data) => {
  weatherData = data;
  updateWeatherDisplay();
});

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
    if (dayElements[i]) dayElements[i].textContent = forecast.dt_txt;
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
  const showPrecipitation =
    document.getElementById("precipitationCheck").checked;

  //Get all wind speed elements

  let windElements = document.querySelectorAll(".wind-speed");
  let tempElements = document.querySelectorAll(".temp-display");
  let rainElements = document.querySelectorAll(".rain-amount");

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
  rainElements.forEach((element) => {
    if (showPrecipitation) {
      element.classList.remove("d-none");
    } else {
      element.classList.add("d-none");
    }
  });
  handleSubmitButtonClick(event);
}

function addFavouriteLocation(event) {
  document.getElementById("max-favourites-msg").classList="d-none";
  event.preventDefault();
  const favouriteLocation =
    document.getElementById("current-location").textContent;

  if (favouriteContainer.children.length >= 6) {
   document.getElementById("max-favourites-msg").classList.remove("d-none");
   return;
  }

  addCard(favouriteContainer);

  // Wait for the API call to complete before accessing data
  callWeatherAPI(favouriteLocation).then((favouriteData) => {
    console.log(favouriteData);
    document.getElementById("favourite-title").textContent =
      favouriteData.city.name;
    document.getElementById("favourite-image").src =
      "https://openweathermap.org/img/wn/" +
      favouriteData.list[0].weather[0].icon +
      "@2x.png";
    document.getElementById("favourite-temp-display").textContent =
      favouriteData.list[0].main.temp + "°C";
    document.getElementById("favourite-weather-type").textContent =
      favouriteData.list[0].weather[0].main;
  });
}

function removeFavouriteLocation(event) {
  const closeBtn = event.target.closest(".remove-favourite-btn");
  if (!closeBtn) return;
  event.preventDefault();
  const card = closeBtn.closest(".forecast-card");
  if (card) card.remove();
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
      <div class="card h-100 position-relative">
        <button class="remove-favourite-btn btn-close position-absolute top-0 end-0 m-2" aria-label="Remove favourite"></button>
        <div class="card-body">
          <h5 id="favourite-title" class="card-title fs-1">Location</h5>
          <img id="favourite-image" src="" alt="Weather icon" class="weather-icon mb-2">
          <p id="favourite-weather-type" class="weather-type">Weather Type</p>
          <p id="favourite-temp-display" class="temp-display">Temperature: --°C</p>
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
