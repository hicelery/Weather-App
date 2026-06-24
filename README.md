# Weather-App

Live site: https://weather-now-26eb2cea9bf0.herokuapp.com/

## Quick start:

Connect DB, Cloudinary and OpenWeather API key in env variables.
Add heroku scheduler to run:
python manage.py clear_old_searches

(clears db saved search queries over 24hr old)

## Features:

- Rigourous implementation of external OpenWeatherMap API.
- Tiered caching of API calls to limit server-round trips.
- AJAX updates to invoke custom endpoints without client refresh/user-journey interruptions.
