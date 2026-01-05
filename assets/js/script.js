/* API Call to Fetch Data From OpenWeatherMap */

let weatherLocation = 'London';
const apiKey = '81feab47f2b2b44f10ee9f0f9a026041';

const endpoint = `https://api.openweathermap.org/data/2.5/forecast?q=${weatherLocation}&appid=${apiKey}&units=metric`;

function callWeatherAPI(weatherLocation) {
    console.log('Fetching weather data for', weatherLocation);
    fetch(endpoint)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // Log API response for debugging
            console.log(data);})
};

callWeatherAPI(weatherLocation);