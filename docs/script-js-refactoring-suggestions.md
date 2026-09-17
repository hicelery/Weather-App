# Suggested `script.js` Refactoring

This document outlines incremental, behavior-preserving improvements for [`static/js/script.js`](../static/js/script.js). The goal is clearer separation of concerns: data preparation, network access, DOM rendering, and event orchestration should be understandable and testable independently.

The recommendations do not require an immediate rewrite or a new framework. The first steps can be made inside the existing file with clearly named sections and functions. Once the boundaries are stable, the code can be split into modules if that would improve maintainability.

## Current Responsibility Groups

`script.js` currently contains several distinct responsibilities:

- Application startup and geolocation.
- Weather API requests and error handling.
- Current-weather DOM updates.
- Forecast aggregation and forecast-card rendering.
- Chart.js configuration and rendering.
- Filter-form state and visibility changes.
- Favourite-location API requests, validation, modal handling, card creation, and card hydration.
- Event-listener registration and application orchestration.

These responsibilities are all valid parts of the application, but several functions currently coordinate too many of them at once.

## High-Priority Candidate: `updateWeatherDisplay`

### Current issue

`updateWeatherDisplay` is the largest coordination point in the file. It currently:

1. Reads the forecast-day setting from the DOM.
2. Updates current location, temperature, feels-like temperature, weather type, icon, wind, and humidity.
3. Renders the temperature chart.
4. Creates or removes forecast cards to match the selected number of days.
5. Groups forecast data through `buildDailyForecasts`.
6. Updates each forecast card.
7. Rescales the current-location text.

A change to one display area requires reading through unrelated DOM and data logic. The function also makes many assumptions about specific element IDs and class names.

### Suggested separation

Keep `updateWeatherDisplay` as a small coordinator and move each responsibility into a focused function:

```js
function updateWeatherDisplay() {
    if (!isValidWeatherData(weatherData)) return;

    const settings = readForecastSettings();
    renderCurrentConditions(weatherData);
    renderTempTrend(weatherData.list);
    syncForecastCardCount(settings.forecastDays);
    renderDailyForecastCards(weatherData.list, settings.forecastDays);
    scaleCurrentLocationText();
}
```

Possible boundaries:

- `isValidWeatherData(data)` validates the minimum data shape needed by the display.
- `readForecastSettings()` reads and normalizes `forecastDays`.
- `renderCurrentConditions(data)` updates the current location and today’s weather details.
- `syncForecastCardCount(count)` adds or removes cards without deciding what their content means.
- `renderDailyForecastCards(list, count)` prepares daily forecasts and delegates each card update.
- `renderForecastCard(card, forecast)` updates one card from one forecast object.
- `setElementText(selector, value)` or a similar small helper can reduce repeated null checks, if it remains readable.

### Benefits

- Each display area can be tested without constructing the entire weather page.
- DOM coupling is localized instead of spread through one long function.
- Forecast-card lifecycle and forecast-card content become separate concerns.
- Current-condition changes cannot accidentally alter forecast-card behavior.
- The top-level rendering flow becomes easy to scan and debug.

## High-Priority Candidate: Favourite-Location Workflow

### Current issue

`addFavouriteLocation`, `removeFavouriteLocation`, `loadFavouriteLocations`, `confirmModal`, and `addCard` combine several layers:

- Favourite API requests.
- CSRF headers and response handling.
- Empty-location and three-location-limit validation.
- Bootstrap modal coordination.
- Favourite-card creation.
- Weather requests for each favourite.
- Updating card title, icon, temperature, and weather type.

There is also duplicated card-population logic. The add flow updates elements by page-level IDs such as `favourite-title`, while the load flow correctly searches within the individual card. This makes the add flow more fragile when multiple cards exist.

### Suggested separation

Separate the workflow into API, rules, modal, and rendering functions:

```js
function addFavouriteLocation(event) {
    event.preventDefault();

    const location = getDisplayedLocation();
    if (!canAddFavourite(location)) return;

    addFavourite(location)
        .then(() => loadFavouriteLocations())
        .catch(handleFavouriteError);
}
```

Possible boundaries:

- `addFavourite(location)` performs only the POST request.
- `removeFavourite(location)` performs only the remove request.
- `getFavouriteLocations()` retrieves and validates the favourites response.
- `canAddFavourite(location)` contains the empty-location and maximum-count rules.
- `createFavouriteCard(container)` creates a card and attaches its event behavior.
- `populateFavouriteCard(card, weatherData)` updates one card using scoped selectors.
- `loadFavouriteLocations()` retrieves locations, creates cards, fetches weather, and calls `populateFavouriteCard`.
- `showDeleteConfirmation(card)` owns Bootstrap modal setup and state.
- `updateFavouriteLimitMessage()` owns the maximum-favourites message.

The add flow should reload or hydrate the newly added card through the same `populateFavouriteCard` path used by the load flow. This avoids maintaining two subtly different rendering implementations.

### Benefits

- API behavior can be mocked and tested without a DOM.
- Card rendering can be tested with one card at a time.
- Scoped selectors prevent one favourite from overwriting another.
- The maximum-favourites rule has one source of truth.
- Modal behavior is isolated from deletion and API error handling.
- Reloading favourites after a successful mutation gives the UI one predictable synchronization path.
- The workflow becomes easier to extend with loading states or retry feedback.

## Location and Loading Orchestration

### Candidates

`initializeApp`, `getCurrentLocation`, and `getCurrentLocationWeather` all participate in selecting a location and loading weather data. They currently mix geolocation access, global state updates, fallback selection, API calls, and display refreshes.

### Suggested separation

Create a small location helper and keep the application-level functions responsible for orchestration:

```js
function getCurrentLocation() {
    return readBrowserLocation().then((location) => location || "London");
}

function loadWeatherForLocation(location) {
    return callWeatherAPI(location).then((data) => {
        weatherData = data;
        updateWeatherDisplay();
        return data;
    });
}
```

The existing fallback behavior should remain unchanged: use the browser coordinates when available and use `London` when the initial location cannot be determined. The current-location button should continue preferring a newly acquired browser location, then the stored location, then the currently displayed weather location.

### Benefits

- Browser geolocation can be tested independently from weather loading.
- The initial-load and current-location-button flows can share one weather-loading function.
- Loading, empty, and error states can be added in one place later.
- Global state changes become easier to identify and control.
- Promise chains are shorter and less likely to diverge between entry points.

## Weather API Data Access: `callWeatherAPI`

### Current issue

`callWeatherAPI` constructs the endpoint, calls `fetch`, validates the HTTP status, parses JSON, logs errors, and converts failures to `null`. This is a reasonable boundary already, but it is still directly coupled to the UI file and does not distinguish request errors from invalid response data.

### Suggested separation

Keep a single weather data-access function, but make its stages explicit:

- `buildWeatherEndpoint(location)` encodes the location and builds the endpoint.
- `fetchJson(url, options)` handles HTTP status and JSON parsing consistently.
- `getWeather(location)` calls the backend and returns the weather response.
- The UI orchestration decides whether a failure should leave the old display, show an error, or display an empty state.

Whether these become separate modules or remain named helpers in `script.js` can be decided later.

### Benefits

- Network behavior can be mocked without importing DOM code.
- Response validation is consistent across weather and favourites requests.
- UI functions no longer need to know endpoint construction details.
- Error policy becomes an explicit application decision instead of an implicit `null` convention.

The endpoint path and query parameter must remain `/weather/api/weather/?q=...` unless the backend contract changes.

## Filter Handling: `handleFormFilters`

### Current issue

`handleFormFilters` reads checkbox values, reads the forecast-day input, changes classes on every matching element, and triggers a complete weather display refresh. It therefore combines form-state collection, state mutation, visibility rendering, and application refresh.

### Suggested separation

Use three focused steps:

```js
function handleFormFilters(event) {
    event.preventDefault();
    const filters = readForecastFilters();
    applyForecastVisibility(filters);
    forecastDays = filters.forecastDays;
    updateWeatherDisplay();
}
```

Possible boundaries:

- `readForecastFilters()` returns `{ showWind, showTemp, showHumidity, forecastDays }` with normalized defaults.
- `applyForecastVisibility(filters)` toggles the relevant classes.
- `refreshForecastFromSettings(filters)` coordinates state and display refresh.

### Benefits

- Filter defaults and parsing can be tested without a browser.
- Visibility behavior is isolated from form-event handling.
- Additional filters can be added without making the event handler longer.
- It becomes clearer whether a filter affects existing cards, newly created cards, or both.

## Smaller Candidate: `renderTempTrend`

`renderTempTrend` prepares chart labels and temperatures, destroys the previous chart, constructs the Chart.js configuration, and draws custom point labels. Separate the data preparation from Chart.js rendering:

- `getTrendSamples(forecastList)` returns the selected samples.
- `buildTrendDataset(samples)` returns labels and rounded temperatures.
- `renderTempTrendChart(chartElement, dataset)` owns Chart.js lifecycle and configuration.

### Benefits

- Temperature sampling and rounding can be tested deterministically.
- Chart.js can be replaced or reconfigured without changing forecast calculations.
- Chart cleanup remains in one clearly defined place.
- A missing chart library or element is handled at the rendering boundary.

## Smaller Candidate: `buildDailyForecasts`

`buildDailyForecasts` is already close to a pure data function. Preserve that direction and make its contract explicit:

```js
function buildDailyForecasts(forecastList) {
    // Returns one object per calendar date with minTemp and maxTemp.
}
```

It should remain independent of the DOM, global state, and Chart.js. If the input format needs validation, perform that at the data boundary rather than inside card rendering.

### Benefits

- Grouping, minimum, and maximum calculations can be tested with small fixture arrays.
- Forecast rendering does not need to understand five-day API data grouping.
- Date-grouping behavior is easier to change without touching the page.
- This is a low-risk first extraction because it has no side effects.

## Suggested Target Structure

The first version can remain one file with sections in this order:

```text
script.js
  constants and state
  DOM references and event registration
  pure weather/forecast helpers
  API helpers
  location and loading orchestration
  current-weather renderers
  forecast-card renderers
  chart renderer
  favourite API and rules
  favourite-card renderers
  event handlers
```

After the boundaries are stable, the code could be split into modules such as:

```text
static/js/
  script.js                 application wiring
  weather-api.js            weather and favourite requests
  weather-data.js           forecast grouping and chart data preparation
  weather-renderer.js       current and forecast DOM rendering
  favourites-renderer.js    favourite-card and modal rendering
```

Module splitting is optional. It should follow clear responsibility boundaries rather than precede them.

## Recommended Migration Order

1. Extract and test pure helpers, especially `buildDailyForecasts`, forecast settings parsing, and chart-data preparation.
2. Extract `renderCurrentConditions` and `renderForecastCard` from `updateWeatherDisplay`.
3. Extract forecast-card count synchronization and make `updateWeatherDisplay` a coordinator.
4. Centralize weather and favourites request helpers while preserving endpoint paths and CSRF handling.
5. Share one favourite-card hydration function between add and load flows.
6. Separate filter-state collection from visibility application.
7. Simplify startup and geolocation orchestration after the shared loading path is established.
8. Consider module files only after the in-file boundaries are working and tested.

This order starts with low-side-effect code and postpones event and global-state changes until the rendering contracts are clearer.

## Behavior to Preserve

Any refactoring should explicitly preserve:

- The weather endpoint and encoded location query.
- CSRF handling for favourite mutations.
- The current-location fallback to `London` during initial load.
- The current-location button fallback order.
- Forecast-day selection and the existing forecast-card indexing behavior.
- The maximum of three favourite locations.
- Bootstrap confirmation-modal behavior.
- Chart replacement and temperature point labels.
- Existing DOM IDs and classes, unless templates and JavaScript are updated together.
- The backend cache behavior, which is intentionally hidden behind the API call.

## Verification Checklist

After each small refactoring step, manually exercise:

- Initial page load with and without geolocation permission.
- Search for a new location and display of current conditions.
- Current-location button behavior.
- Changing forecast days and visibility filters.
- Temperature chart rendering and refresh after a new search.
- Loading existing favourites.
- Adding a favourite up to the three-location limit.
- Attempting to add an empty or fourth favourite.
- Removing a favourite through the confirmation modal.
- Weather API failure and non-JSON favourites responses.

The repository currently does not define JavaScript formatting or test scripts in [`package.json`](../package.json). Future extraction should add focused JavaScript tests if the frontend gains a test runner. The existing Django test suite under [`weather/tests`](../weather/tests) can continue to provide broader backend and integration regression coverage, but it does not replace focused tests for DOM and data helpers.

## Recommended Implementation Approach

Splitting `script.js` into several JavaScript files is appropriate, but the application does not need to be converted into a class-based object-oriented design. Use ES modules organized by responsibility rather than creating one file per function:

```text
static/js/
    script.js              application wiring and event handlers
    weather-api.js         weather requests
    favourites-api.js      favourite-location endpoints
    weather-data.js        forecast grouping and data transformations
    weather-renderer.js    current conditions and forecast cards
    chart-renderer.js      Chart.js-specific code
```

The entry file should coordinate the application while the other modules expose focused functions:

```js
import { getWeather } from "./weather-api.js";
import { renderWeather } from "./weather-renderer.js";

async function loadWeather(location) {
    const data = await getWeather(location);
    renderWeather(data);
}
```

The important distinction is:

- **Modules** separate responsibilities.
- **Functions** perform focused operations.
- **Objects** represent data when useful.
- **Classes** are reserved for persistent state, lifecycle behavior, or multiple instances.

For this application, classes such as `WeatherApp`, `WeatherService`, or `FavouriteManager` would likely add ceremony without much benefit. There is one main weather display and one favourites collection, so plain modules and functions provide separation and testability with less complexity.

Avoid creating files such as `renderTemperature.js`, `renderHumidity.js`, and `renderWind.js`. A file should represent a meaningful responsibility, not merely a single function. Keep related rendering behavior together in `weather-renderer.js`.

### Suggested extraction order

1. Keep `script.js` working as the application entry point.
2. Extract pure functions such as `buildDailyForecasts` and chart-data preparation.
3. Extract API functions such as `callWeatherAPI`.
4. Extract renderers such as `renderCurrentConditions` and `renderForecastCard`.
5. Leave event handlers and startup orchestration in `script.js` initially.
6. Add module imports after the responsibility boundaries are stable.

If the templates are changed to use modules, load the entry file with:

```html
<script type="module" src="{% static 'js/script.js' %}"></script>
```

This approach is best described as **functional modularity**, not full object-oriented programming. It provides clearer dependencies, smaller testable units, and a simpler migration path without introducing abstractions the current page does not need.
