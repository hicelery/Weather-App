// Global variable with default location
const apiKey = "81feab47f2b2b44f10ee9f0f9a026041";
let weatherLocation = "";
let forecastDays = 5;
const container = document.getElementById("forecast-container");

document
    .getElementById("location-form")
    .addEventListener("submit", handleSubmitButtonClick);

document
    .getElementById("forecast-options-form")
    .addEventListener("submit", handleFormFilters);

//get data on initial load
updateWeatherDisplay(weatherLocation, forecastDays);

/* API Call to Fetch Data From OpenWeatherMap */
function callWeatherAPI(weatherLocation, forecastDays) {
    //console.log("Fetching weather data for", weatherLocation);
    //const endpoint = `https://api.openweathermap.org/data/2.5/forecast/daily?q=${weatherLocation}&cnt={forecastDays}&appid=${apiKey}&units=metric`;
    // fetch(endpoint)
    // .then(function (response) {
    //   return response.json();
    //  })
    // .then(function (data) {
    // Log API response for debugging
    let data = {
        cod: "200",
        message: 0,
        cnt: 40,
        list: [
            {
                dt: 1767733200,
                main: {
                    temp: 3.74,
                    feels_like: -0.23,
                    temp_min: 2.73,
                    temp_max: 3.74,
                    pressure: 1010,
                    sea_level: 1010,
                    grnd_level: 1006,
                    humidity: 81,
                    temp_kf: 1.01,
                },
                weather: [
                    {
                        id: 804,
                        main: "Clouds",
                        description: "overcast clouds",
                        icon: "04n",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 4.98,
                    deg: 221,
                    gust: 13.63,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-06 21:00:00",
            },
            {
                dt: 1767744000,
                main: {
                    temp: 3.35,
                    feels_like: -1.62,
                    temp_min: 2.56,
                    temp_max: 3.35,
                    pressure: 1009,
                    sea_level: 1009,
                    grnd_level: 1001,
                    humidity: 86,
                    temp_kf: 0.79,
                },
                weather: [
                    {
                        id: 500,
                        main: "Rain",
                        description: "light rain",
                        icon: "10n",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 7.04,
                    deg: 219,
                    gust: 15.4,
                },
                pop: 1,
                rain: {
                    "3h": 2.92,
                },
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-07 00:00:00",
            },
            {
                dt: 1767754800,
                main: {
                    temp: 1.64,
                    feels_like: -3.28,
                    temp_min: 0.59,
                    temp_max: 1.64,
                    pressure: 1006,
                    sea_level: 1006,
                    grnd_level: 1000,
                    humidity: 91,
                    temp_kf: 1.05,
                },
                weather: [
                    {
                        id: 500,
                        main: "Rain",
                        description: "light rain",
                        icon: "10n",
                    },
                ],
                clouds: {
                    all: 98,
                },
                wind: {
                    speed: 5.82,
                    deg: 288,
                    gust: 11.03,
                },
                visibility: 8424,
                pop: 1,
                rain: {
                    "3h": 0.86,
                },
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-07 03:00:00",
            },
            {
                dt: 1767765600,
                main: {
                    temp: -1.07,
                    feels_like: -5.74,
                    temp_min: -1.07,
                    temp_max: -1.07,
                    pressure: 1005,
                    sea_level: 1005,
                    grnd_level: 1000,
                    humidity: 81,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 600,
                        main: "Snow",
                        description: "light snow",
                        icon: "13n",
                    },
                ],
                clouds: {
                    all: 89,
                },
                wind: {
                    speed: 4.2,
                    deg: 273,
                    gust: 11.44,
                },
                visibility: 10000,
                pop: 1,
                snow: {
                    "3h": 0.12,
                },
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-07 06:00:00",
            },
            {
                dt: 1767776400,
                main: {
                    temp: -0.59,
                    feels_like: -5.42,
                    temp_min: -0.59,
                    temp_max: -0.59,
                    pressure: 1006,
                    sea_level: 1006,
                    grnd_level: 1001,
                    humidity: 82,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 802,
                        main: "Clouds",
                        description: "scattered clouds",
                        icon: "03d",
                    },
                ],
                clouds: {
                    all: 33,
                },
                wind: {
                    speed: 4.62,
                    deg: 269,
                    gust: 13.41,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "d",
                },
                dt_txt: "2026-01-07 09:00:00",
            },
            {
                dt: 1767787200,
                main: {
                    temp: 4.01,
                    feels_like: -0.25,
                    temp_min: 4.01,
                    temp_max: 4.01,
                    pressure: 1005,
                    sea_level: 1005,
                    grnd_level: 1001,
                    humidity: 69,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 802,
                        main: "Clouds",
                        description: "scattered clouds",
                        icon: "03d",
                    },
                ],
                clouds: {
                    all: 39,
                },
                wind: {
                    speed: 5.74,
                    deg: 279,
                    gust: 12.82,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "d",
                },
                dt_txt: "2026-01-07 12:00:00",
            },
            {
                dt: 1767798000,
                main: {
                    temp: 4.32,
                    feels_like: -0.02,
                    temp_min: 4.32,
                    temp_max: 4.32,
                    pressure: 1005,
                    sea_level: 1005,
                    grnd_level: 1001,
                    humidity: 69,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 802,
                        main: "Clouds",
                        description: "scattered clouds",
                        icon: "03d",
                    },
                ],
                clouds: {
                    all: 41,
                },
                wind: {
                    speed: 6.13,
                    deg: 276,
                    gust: 12.81,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "d",
                },
                dt_txt: "2026-01-07 15:00:00",
            },
            {
                dt: 1767808800,
                main: {
                    temp: 3.32,
                    feels_like: -1,
                    temp_min: 3.32,
                    temp_max: 3.32,
                    pressure: 1006,
                    sea_level: 1006,
                    grnd_level: 1002,
                    humidity: 73,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 803,
                        main: "Clouds",
                        description: "broken clouds",
                        icon: "04n",
                    },
                ],
                clouds: {
                    all: 69,
                },
                wind: {
                    speed: 5.48,
                    deg: 275,
                    gust: 12.3,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-07 18:00:00",
            },
            {
                dt: 1767819600,
                main: {
                    temp: 2.04,
                    feels_like: -1.82,
                    temp_min: 2.04,
                    temp_max: 2.04,
                    pressure: 1007,
                    sea_level: 1007,
                    grnd_level: 1003,
                    humidity: 78,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 804,
                        main: "Clouds",
                        description: "overcast clouds",
                        icon: "04n",
                    },
                ],
                clouds: {
                    all: 91,
                },
                wind: {
                    speed: 4.06,
                    deg: 272,
                    gust: 10.96,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-07 21:00:00",
            },
            {
                dt: 1767830400,
                main: {
                    temp: 1.62,
                    feels_like: -1.33,
                    temp_min: 1.62,
                    temp_max: 1.62,
                    pressure: 1007,
                    sea_level: 1007,
                    grnd_level: 1003,
                    humidity: 80,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 804,
                        main: "Clouds",
                        description: "overcast clouds",
                        icon: "04n",
                    },
                ],
                clouds: {
                    all: 96,
                },
                wind: {
                    speed: 2.74,
                    deg: 258,
                    gust: 7.76,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-08 00:00:00",
            },
            {
                dt: 1767841200,
                main: {
                    temp: 1.79,
                    feels_like: 0.03,
                    temp_min: 1.79,
                    temp_max: 1.79,
                    pressure: 1007,
                    sea_level: 1007,
                    grnd_level: 1003,
                    humidity: 80,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 804,
                        main: "Clouds",
                        description: "overcast clouds",
                        icon: "04n",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 1.68,
                    deg: 269,
                    gust: 5.26,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-08 03:00:00",
            },
            {
                dt: 1767852000,
                main: {
                    temp: 2.04,
                    feels_like: 2.04,
                    temp_min: 2.04,
                    temp_max: 2.04,
                    pressure: 1007,
                    sea_level: 1007,
                    grnd_level: 1002,
                    humidity: 84,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 804,
                        main: "Clouds",
                        description: "overcast clouds",
                        icon: "04n",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 0.99,
                    deg: 261,
                    gust: 1.81,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-08 06:00:00",
            },
            {
                dt: 1767862800,
                main: {
                    temp: 2.02,
                    feels_like: 2.02,
                    temp_min: 2.02,
                    temp_max: 2.02,
                    pressure: 1006,
                    sea_level: 1006,
                    grnd_level: 1002,
                    humidity: 94,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 804,
                        main: "Clouds",
                        description: "overcast clouds",
                        icon: "04d",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 1.23,
                    deg: 198,
                    gust: 2.6,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "d",
                },
                dt_txt: "2026-01-08 09:00:00",
            },
            {
                dt: 1767873600,
                main: {
                    temp: 3.13,
                    feels_like: 1.5,
                    temp_min: 3.13,
                    temp_max: 3.13,
                    pressure: 1004,
                    sea_level: 1004,
                    grnd_level: 1000,
                    humidity: 84,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 804,
                        main: "Clouds",
                        description: "overcast clouds",
                        icon: "04d",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 1.74,
                    deg: 157,
                    gust: 3.93,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "d",
                },
                dt_txt: "2026-01-08 12:00:00",
            },
            {
                dt: 1767884400,
                main: {
                    temp: 3.64,
                    feels_like: 1.11,
                    temp_min: 3.64,
                    temp_max: 3.64,
                    pressure: 999,
                    sea_level: 999,
                    grnd_level: 995,
                    humidity: 95,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 500,
                        main: "Rain",
                        description: "light rain",
                        icon: "10d",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 2.71,
                    deg: 154,
                    gust: 6.98,
                },
                visibility: 8717,
                pop: 1,
                rain: {
                    "3h": 2.02,
                },
                sys: {
                    pod: "d",
                },
                dt_txt: "2026-01-08 15:00:00",
            },
            {
                dt: 1767895200,
                main: {
                    temp: 4.05,
                    feels_like: -0.14,
                    temp_min: 4.05,
                    temp_max: 4.05,
                    pressure: 990,
                    sea_level: 990,
                    grnd_level: 986,
                    humidity: 95,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 501,
                        main: "Rain",
                        description: "moderate rain",
                        icon: "10n",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 5.61,
                    deg: 113,
                    gust: 13.55,
                },
                visibility: 10000,
                pop: 1,
                rain: {
                    "3h": 3.9,
                },
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-08 18:00:00",
            },
            {
                dt: 1767906000,
                main: {
                    temp: 8.72,
                    feels_like: 5.41,
                    temp_min: 8.72,
                    temp_max: 8.72,
                    pressure: 979,
                    sea_level: 979,
                    grnd_level: 975,
                    humidity: 94,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 501,
                        main: "Rain",
                        description: "moderate rain",
                        icon: "10n",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 6.64,
                    deg: 164,
                    gust: 15.08,
                },
                visibility: 10000,
                pop: 1,
                rain: {
                    "3h": 7.67,
                },
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-08 21:00:00",
            },
            {
                dt: 1767916800,
                main: {
                    temp: 6.39,
                    feels_like: 5.67,
                    temp_min: 6.39,
                    temp_max: 6.39,
                    pressure: 973,
                    sea_level: 973,
                    grnd_level: 969,
                    humidity: 89,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 500,
                        main: "Rain",
                        description: "light rain",
                        icon: "10n",
                    },
                ],
                clouds: {
                    all: 99,
                },
                wind: {
                    speed: 1.39,
                    deg: 97,
                    gust: 2.31,
                },
                visibility: 10000,
                pop: 1,
                rain: {
                    "3h": 0.25,
                },
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-09 00:00:00",
            },
            {
                dt: 1767927600,
                main: {
                    temp: 1.99,
                    feels_like: -4.57,
                    temp_min: 1.99,
                    temp_max: 1.99,
                    pressure: 979,
                    sea_level: 979,
                    grnd_level: 975,
                    humidity: 94,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 600,
                        main: "Snow",
                        description: "light snow",
                        icon: "13n",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 10.6,
                    deg: 311,
                    gust: 19.24,
                },
                visibility: 588,
                pop: 1,
                snow: {
                    "3h": 0.5,
                },
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-09 03:00:00",
            },
            {
                dt: 1767938400,
                main: {
                    temp: 2,
                    feels_like: -4.53,
                    temp_min: 2,
                    temp_max: 2,
                    pressure: 986,
                    sea_level: 986,
                    grnd_level: 982,
                    humidity: 95,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 601,
                        main: "Snow",
                        description: "snow",
                        icon: "13n",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 10.48,
                    deg: 294,
                    gust: 19.91,
                },
                visibility: 239,
                pop: 1,
                snow: {
                    "3h": 2.44,
                },
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-09 06:00:00",
            },
            {
                dt: 1767949200,
                main: {
                    temp: 2.6,
                    feels_like: -3.2,
                    temp_min: 2.6,
                    temp_max: 2.6,
                    pressure: 990,
                    sea_level: 990,
                    grnd_level: 986,
                    humidity: 91,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 600,
                        main: "Snow",
                        description: "light snow",
                        icon: "13d",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 8.75,
                    deg: 294,
                    gust: 16.79,
                },
                visibility: 10000,
                pop: 1,
                snow: {
                    "3h": 1.15,
                },
                sys: {
                    pod: "d",
                },
                dt_txt: "2026-01-09 09:00:00",
            },
            {
                dt: 1767960000,
                main: {
                    temp: 3.49,
                    feels_like: -1.84,
                    temp_min: 3.49,
                    temp_max: 3.49,
                    pressure: 993,
                    sea_level: 993,
                    grnd_level: 988,
                    humidity: 82,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 804,
                        main: "Clouds",
                        description: "overcast clouds",
                        icon: "04d",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 8.14,
                    deg: 292,
                    gust: 16.14,
                },
                visibility: 10000,
                pop: 0.8,
                sys: {
                    pod: "d",
                },
                dt_txt: "2026-01-09 12:00:00",
            },
            {
                dt: 1767970800,
                main: {
                    temp: 3.87,
                    feels_like: -1.27,
                    temp_min: 3.87,
                    temp_max: 3.87,
                    pressure: 994,
                    sea_level: 994,
                    grnd_level: 989,
                    humidity: 81,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 804,
                        main: "Clouds",
                        description: "overcast clouds",
                        icon: "04d",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 7.93,
                    deg: 295,
                    gust: 16.15,
                },
                visibility: 10000,
                pop: 0.05,
                sys: {
                    pod: "d",
                },
                dt_txt: "2026-01-09 15:00:00",
            },
            {
                dt: 1767981600,
                main: {
                    temp: 3.24,
                    feels_like: -1.9,
                    temp_min: 3.24,
                    temp_max: 3.24,
                    pressure: 996,
                    sea_level: 996,
                    grnd_level: 991,
                    humidity: 87,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 804,
                        main: "Clouds",
                        description: "overcast clouds",
                        icon: "04n",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 7.39,
                    deg: 301,
                    gust: 14.45,
                },
                visibility: 10000,
                pop: 0.01,
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-09 18:00:00",
            },
            {
                dt: 1767992400,
                main: {
                    temp: 3,
                    feels_like: -2.1,
                    temp_min: 3,
                    temp_max: 3,
                    pressure: 998,
                    sea_level: 998,
                    grnd_level: 993,
                    humidity: 80,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 804,
                        main: "Clouds",
                        description: "overcast clouds",
                        icon: "04n",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 7.11,
                    deg: 305,
                    gust: 14.76,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-09 21:00:00",
            },
            {
                dt: 1768003200,
                main: {
                    temp: 2.81,
                    feels_like: -2.31,
                    temp_min: 2.81,
                    temp_max: 2.81,
                    pressure: 1000,
                    sea_level: 1000,
                    grnd_level: 995,
                    humidity: 78,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 804,
                        main: "Clouds",
                        description: "overcast clouds",
                        icon: "04n",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 7.01,
                    deg: 306,
                    gust: 14.54,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-10 00:00:00",
            },
            {
                dt: 1768014000,
                main: {
                    temp: 2.25,
                    feels_like: -3.02,
                    temp_min: 2.25,
                    temp_max: 2.25,
                    pressure: 1002,
                    sea_level: 1002,
                    grnd_level: 997,
                    humidity: 79,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 804,
                        main: "Clouds",
                        description: "overcast clouds",
                        icon: "04n",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 6.99,
                    deg: 312,
                    gust: 13.67,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-10 03:00:00",
            },
            {
                dt: 1768024800,
                main: {
                    temp: 1.56,
                    feels_like: -3.96,
                    temp_min: 1.56,
                    temp_max: 1.56,
                    pressure: 1004,
                    sea_level: 1004,
                    grnd_level: 1000,
                    humidity: 93,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 600,
                        main: "Snow",
                        description: "light snow",
                        icon: "13n",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 7.12,
                    deg: 319,
                    gust: 15.23,
                },
                visibility: 10000,
                pop: 0.2,
                snow: {
                    "3h": 0.29,
                },
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-10 06:00:00",
            },
            {
                dt: 1768035600,
                main: {
                    temp: 2.33,
                    feels_like: -2.96,
                    temp_min: 2.33,
                    temp_max: 2.33,
                    pressure: 1008,
                    sea_level: 1008,
                    grnd_level: 1003,
                    humidity: 88,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 600,
                        main: "Snow",
                        description: "light snow",
                        icon: "13d",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 7.09,
                    deg: 331,
                    gust: 14.77,
                },
                visibility: 10000,
                pop: 0.32,
                snow: {
                    "3h": 0.2,
                },
                sys: {
                    pod: "d",
                },
                dt_txt: "2026-01-10 09:00:00",
            },
            {
                dt: 1768046400,
                main: {
                    temp: 2.92,
                    feels_like: -2.15,
                    temp_min: 2.92,
                    temp_max: 2.92,
                    pressure: 1011,
                    sea_level: 1011,
                    grnd_level: 1006,
                    humidity: 84,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 804,
                        main: "Clouds",
                        description: "overcast clouds",
                        icon: "04d",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 6.97,
                    deg: 337,
                    gust: 13.63,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "d",
                },
                dt_txt: "2026-01-10 12:00:00",
            },
            {
                dt: 1768057200,
                main: {
                    temp: 3.03,
                    feels_like: -1.79,
                    temp_min: 3.03,
                    temp_max: 3.03,
                    pressure: 1014,
                    sea_level: 1014,
                    grnd_level: 1010,
                    humidity: 78,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 804,
                        main: "Clouds",
                        description: "overcast clouds",
                        icon: "04d",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 6.43,
                    deg: 347,
                    gust: 11.71,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "d",
                },
                dt_txt: "2026-01-10 15:00:00",
            },
            {
                dt: 1768068000,
                main: {
                    temp: 3.08,
                    feels_like: -0.94,
                    temp_min: 3.08,
                    temp_max: 3.08,
                    pressure: 1017,
                    sea_level: 1017,
                    grnd_level: 1013,
                    humidity: 77,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 804,
                        main: "Clouds",
                        description: "overcast clouds",
                        icon: "04n",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 4.76,
                    deg: 343,
                    gust: 8.88,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-10 18:00:00",
            },
            {
                dt: 1768078800,
                main: {
                    temp: 2.11,
                    feels_like: -1.49,
                    temp_min: 2.11,
                    temp_max: 2.11,
                    pressure: 1019,
                    sea_level: 1019,
                    grnd_level: 1015,
                    humidity: 83,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 804,
                        main: "Clouds",
                        description: "overcast clouds",
                        icon: "04n",
                    },
                ],
                clouds: {
                    all: 97,
                },
                wind: {
                    speed: 3.7,
                    deg: 347,
                    gust: 7.94,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-10 21:00:00",
            },
            {
                dt: 1768089600,
                main: {
                    temp: 1.38,
                    feels_like: -0.99,
                    temp_min: 1.38,
                    temp_max: 1.38,
                    pressure: 1021,
                    sea_level: 1021,
                    grnd_level: 1016,
                    humidity: 87,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 803,
                        main: "Clouds",
                        description: "broken clouds",
                        icon: "04n",
                    },
                ],
                clouds: {
                    all: 83,
                },
                wind: {
                    speed: 2.12,
                    deg: 346,
                    gust: 5.53,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-11 00:00:00",
            },
            {
                dt: 1768100400,
                main: {
                    temp: 0.04,
                    feels_like: -1.68,
                    temp_min: 0.04,
                    temp_max: 0.04,
                    pressure: 1021,
                    sea_level: 1021,
                    grnd_level: 1016,
                    humidity: 95,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 803,
                        main: "Clouds",
                        description: "broken clouds",
                        icon: "04n",
                    },
                ],
                clouds: {
                    all: 64,
                },
                wind: {
                    speed: 1.48,
                    deg: 12,
                    gust: 2.92,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-11 03:00:00",
            },
            {
                dt: 1768111200,
                main: {
                    temp: 0.13,
                    feels_like: -1.95,
                    temp_min: 0.13,
                    temp_max: 0.13,
                    pressure: 1020,
                    sea_level: 1020,
                    grnd_level: 1015,
                    humidity: 89,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 803,
                        main: "Clouds",
                        description: "broken clouds",
                        icon: "04n",
                    },
                ],
                clouds: {
                    all: 82,
                },
                wind: {
                    speed: 1.73,
                    deg: 92,
                    gust: 2.38,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-11 06:00:00",
            },
            {
                dt: 1768122000,
                main: {
                    temp: 0.34,
                    feels_like: -2.74,
                    temp_min: 0.34,
                    temp_max: 0.34,
                    pressure: 1019,
                    sea_level: 1019,
                    grnd_level: 1014,
                    humidity: 86,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 804,
                        main: "Clouds",
                        description: "overcast clouds",
                        icon: "04d",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 2.62,
                    deg: 118,
                    gust: 6.03,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "d",
                },
                dt_txt: "2026-01-11 09:00:00",
            },
            {
                dt: 1768132800,
                main: {
                    temp: 3.14,
                    feels_like: -0.68,
                    temp_min: 3.14,
                    temp_max: 3.14,
                    pressure: 1016,
                    sea_level: 1016,
                    grnd_level: 1012,
                    humidity: 71,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 804,
                        main: "Clouds",
                        description: "overcast clouds",
                        icon: "04d",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 4.43,
                    deg: 144,
                    gust: 8.22,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "d",
                },
                dt_txt: "2026-01-11 12:00:00",
            },
            {
                dt: 1768143600,
                main: {
                    temp: 2.53,
                    feels_like: -2.03,
                    temp_min: 2.53,
                    temp_max: 2.53,
                    pressure: 1013,
                    sea_level: 1013,
                    grnd_level: 1009,
                    humidity: 63,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 804,
                        main: "Clouds",
                        description: "overcast clouds",
                        icon: "04d",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 5.55,
                    deg: 140,
                    gust: 10.87,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "d",
                },
                dt_txt: "2026-01-11 15:00:00",
            },
            {
                dt: 1768154400,
                main: {
                    temp: 1.81,
                    feels_like: -3.2,
                    temp_min: 1.81,
                    temp_max: 1.81,
                    pressure: 1011,
                    sea_level: 1011,
                    grnd_level: 1007,
                    humidity: 62,
                    temp_kf: 0,
                },
                weather: [
                    {
                        id: 804,
                        main: "Clouds",
                        description: "overcast clouds",
                        icon: "04n",
                    },
                ],
                clouds: {
                    all: 100,
                },
                wind: {
                    speed: 6.11,
                    deg: 131,
                    gust: 12.47,
                },
                visibility: 10000,
                pop: 0,
                sys: {
                    pod: "n",
                },
                dt_txt: "2026-01-11 18:00:00",
            },
        ],
        city: {
            id: 2643743,
            name: "London",
            coord: {
                lat: 51.5085,
                lon: -0.1257,
            },
            country: "GB",
            population: 1000000,
            timezone: 0,
            sunrise: 1767686697,
            sunset: 1767715630,
        },
    };
    console.log(data);
    return data;
}

function updateWeatherDisplay(weatherLocation, forecastDays) {
    // Assign data to a variable
    let weatherData = callWeatherAPI(weatherLocation, forecastDays);
    forecastDays =
        parseInt(document.getElementById("forecastDays").value, 10) || 1;
    // Update forecast based on user input

    console.log(forecastDays); // Number of days to fetch

    //Main current weather display
    document.getElementById("current-location").textContent =
        weatherData.city.name;
    document.getElementById("temp-display").textContent =
        weatherData.list[0].main.temp;
    document.getElementById("feels-like").textContent =
        weatherData.list[0].main.feels_like;
    document.getElementById("weather-type").textContent =
        weatherData.list[0].weather[0].main;

    //Adjust number of forecast cards
    while (container.querySelectorAll(".forecast-card").length < forecastDays) {
        addCard();
    }
    while (container.querySelectorAll(".forecast-card").length > forecastDays) {
        removeCard();
    }
    //Future Forecast display
    for (let i = 0; i < forecastDays; i++) {
        //Get data for each forecast day
        let forecast = weatherData.list[i];

        console.log(i);

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
        //Add null check for each element to allow filters to remove elements
        if (dayElements[i]) dayElements[i].textContent = forecast.dt_txt;
        if (tempElements[i]) tempElements[i].textContent = forecast.main.temp;
        if (feelsLikeElements[i])
            feelsLikeElements[i].textContent = forecast.main.feels_like;
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

        console.log(forecast);
    }
}

/* Function to handle submit button click, save user input as a variable and then run call to API */
function handleSubmitButtonClick(event) {
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
    updateWeatherDisplay(weatherLocation, forecastDays);
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
//Add a new forecast card to container
function addCard() {
    const firstCard = container.querySelector(".forecast-card");
    if (firstCard) {
        const newCard = firstCard.cloneNode(true);
        container.appendChild(newCard);
    }
}

//Remove last forecast card from container
function removeCard() {
    if (container.children.length > 0) {
        let lastCard = container.lastElementChild;
        container.removeChild(lastCard);
    }
}
