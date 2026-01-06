// Global variable with default location
const apiKey = "81feab47f2b2b44f10ee9f0f9a026041";
 let weatherLocation = "New York, US";

 /* API Call to Fetch Data From OpenWeatherMap */
 function callWeatherAPI(weatherLocation) {
  console.log("Fetching weather data for", weatherLocation);
  const endpoint = `https://api.openweathermap.org/data/2.5/forecast?q=${weatherLocation}&appid=${apiKey}&units=metric`;
  fetch(endpoint)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // Log API response for debugging
      console.log(data);
    });
}

/* Event Listener for location form submission */
document
  .getElementById("location-form")
  .addEventListener("submit", handleSubmitButtonClick);

/* Function to handle submit button click, save user input as a variable and then run call to API */
function handleSubmitButtonClick(event) {
  event.preventDefault();
  /* Handles empty input field */
  if (!document.getElementById("user-input").value) {
    alert("Please enter a location");
    return;
  }
  /* Continues on if location is entered */
  weatherLocation = document.getElementById("user-input").value;
  console.log("User input:", weatherLocation);
  callWeatherAPI(weatherLocation);
}

