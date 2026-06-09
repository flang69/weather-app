/* ============================================================
   ATMOS WEATHER APP — script.js
   APIs: Open-Meteo (weather) + Nominatim (geocoding)
   Features: Search, Geolocation, History, Forecast, °C/°F,
             Themes, Particles, Cursor, Clock, Mood messages
   ============================================================ */

'use strict';

// ─── 1. ELEMENT REFERENCES ──────────────────────────────────────
const $ = id => document.getElementById(id);

const UI = {
  body:            document.body,
  cursor:          $('cursorGlow'),
  blob1:           $('blob1'),
  blob2:           $('blob2'),
  blob3:           $('blob3'),
  particles:       $('particles'),
  // Clock
  clockTime:       $('clockTime'),
  clockDate:       $('clockDate'),
  // Unit toggle
  unitToggle:      $('unitToggle'),
  labelC:          $('labelC'),
  labelF:          $('labelF'),
  // Search
  cityInput:       $('cityInput'),
  searchBtn:       $('searchBtn'),
  locateBtn:       $('locateBtn'),
  historyStrip:    $('historyStrip'),
  historyChips:    $('historyChips'),
  // States
  skeletonWrapper: $('skeletonWrapper'),
  errorPopup:      $('errorPopup'),
  errorMsg:        $('errorMsg'),
  errorClose:      $('errorClose'),
  weatherDashboard:$('weatherDashboard'),
  welcomeState:    $('welcomeState'),
  // Weather card
  cityName:        $('cityName'),
  cityMeta:        $('cityMeta'),
  conditionText:   $('conditionText'),
  weatherIconMain: $('weatherIconMain'),
  tempValue:       $('tempValue'),
  tempUnit:        $('tempUnit'),
  feelsLike:       $('feelsLike'),
  moodText:        $('moodText'),
  humidity:        $('humidity'),
  windSpeed:       $('windSpeed'),
  sunrise:         $('sunrise'),
  sunset:          $('sunset'),
  // Forecast
  forecastList:    $('forecastList'),
};

// ─── 2. APP STATE ────────────────────────────────────────────────
const state = {
  isCelsius: true,           // temperature unit
  currentWeatherData: null,  // raw weather data cache
  currentCity: '',           // last fetched city name
  searchHistory: [],         // recent searches array
  errorTimer: null,          // auto-dismiss timer reference
  particlesInit: false,      // particles created flag
};

// ─── 3. WEATHER CODE MAPPINGS ───────────────────────────────────
/**
 * WMO Weather Interpretation Codes
 * Maps numeric codes from Open-Meteo to human-readable info
 */
const WEATHER_CODES = {
  0:  { label: 'Clear Sky',        icon: '☀️',  theme: 'sunny'  },
  1:  { label: 'Mainly Clear',     icon: '🌤️',  theme: 'sunny'  },
  2:  { label: 'Partly Cloudy',    icon: '⛅',  theme: 'cloudy' },
  3:  { label: 'Overcast',         icon: '☁️',  theme: 'cloudy' },
  45: { label: 'Foggy',            icon: '🌫️',  theme: 'cloudy' },
  48: { label: 'Icy Fog',          icon: '🌫️',  theme: 'cloudy' },
  51: { label: 'Light Drizzle',    icon: '🌦️',  theme: 'rainy'  },
  53: { label: 'Drizzle',          icon: '🌧️',  theme: 'rainy'  },
  55: { label: 'Heavy Drizzle',    icon: '🌧️',  theme: 'rainy'  },
  61: { label: 'Light Rain',       icon: '🌧️',  theme: 'rainy'  },
  63: { label: 'Moderate Rain',    icon: '🌧️',  theme: 'rainy'  },
  65: { label: 'Heavy Rain',       icon: '🌧️',  theme: 'rainy'  },
  71: { label: 'Light Snow',       icon: '🌨️',  theme: 'snowy'  },
  73: { label: 'Moderate Snow',    icon: '❄️',  theme: 'snowy'  },
  75: { label: 'Heavy Snow',       icon: '❄️',  theme: 'snowy'  },
  77: { label: 'Snow Grains',      icon: '🌨️',  theme: 'snowy'  },
  80: { label: 'Light Showers',    icon: '🌦️',  theme: 'rainy'  },
  81: { label: 'Showers',          icon: '🌧️',  theme: 'rainy'  },
  82: { label: 'Heavy Showers',    icon: '⛈️',  theme: 'stormy' },
  85: { label: 'Snow Showers',     icon: '🌨️',  theme: 'snowy'  },
  86: { label: 'Heavy Snow Shower',icon: '❄️',  theme: 'snowy'  },
  95: { label: 'Thunderstorm',     icon: '⛈️',  theme: 'stormy' },
  96: { label: 'Hail Thunderstorm',icon: '⛈️',  theme: 'stormy' },
  99: { label: 'Severe Storm',     icon: '🌪️',  theme: 'stormy' },
};

const DEFAULT_CODE = { label: 'Unknown', icon: '🌡️', theme: 'night' };

// Mood messages keyed by theme
const MOODS = {
  sunny:  ['Perfect day for productivity ☀️', 'Chase the sun today! ✨', 'Good vibes only 🌞', 'Step outside, the world awaits ☀️'],
  rainy:  ['Stay cozy and hydrated 🌧️', 'Perfect weather for a book ☕', 'Rain is liquid sunshine 💙', 'Cosy day vibes 🌂'],
  cloudy: ['A moody sky has its charm 🌥️', 'Good day for deep thoughts 💭', 'Soft light, soft mood ☁️'],
  snowy:  ['A winter wonderland awaits ❄️', 'Hot cocoa weather is HERE 🍫', 'Bundle up, stay warm 🧣'],
  stormy: ['Stay safe and stay indoors ⚡', 'Nature is putting on a show 🌩️', 'Charge like the storm ⛈️'],
  night:  ['The night sky is calling 🌙', 'Good evening, star gazer ✨', 'Peaceful night ahead 🌌'],
};

// Abbreviated day names
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── 4. REAL-TIME CLOCK ─────────────────────────────────────────
/**
 * Updates the clock display every second
 */
function startClock() {
  function tick() {
    const now = new Date();
    // Format time HH:MM:SS
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    UI.clockTime.textContent = `${h}:${m}:${s}`;

    // Format date: Mon 01, 2025
    UI.clockDate.textContent = now.toLocaleDateString('en-US', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
    });
  }
  tick();
  setInterval(tick, 1000);
}

// ─── 5. CUSTOM CURSOR ───────────────────────────────────────────
/**
 * Makes a glowing dot follow the mouse cursor
 */
function initCursor() {
  document.addEventListener('mousemove', e => {
    UI.cursor.style.left = e.clientX + 'px';
    UI.cursor.style.top  = e.clientY + 'px';
  });

  // Enlarge cursor on interactive elements
  document.querySelectorAll('button, input, a, .history-chip').forEach(el => {
    el.addEventListener('mouseenter', () => UI.cursor.classList.add('active'));
    el.addEventListener('mouseleave', () => UI.cursor.classList.remove('active'));
  });

  // Interactive background parallax on mouse move
  document.addEventListener('mousemove', e => {
    const xPct = (e.clientX / window.innerWidth - 0.5) * 20;
    const yPct = (e.clientY / window.innerHeight - 0.5) * 20;
    UI.blob1.style.transform = `translate(${xPct * 0.5}px, ${yPct * 0.5}px)`;
    UI.blob2.style.transform = `translate(${-xPct * 0.4}px, ${-yPct * 0.4}px)`;
    UI.blob3.style.transform = `translate(${xPct * 0.7}px, ${yPct * 0.3}px)`;
  });
}

// ─── 6. FLOATING PARTICLES ──────────────────────────────────────
/**
 * Creates floating dot particles in the background for ambience
 */
function createParticles() {
  if (state.particlesInit) return;
  state.particlesInit = true;

  const count = window.innerWidth < 600 ? 12 : 24;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size    = Math.random() * 3 + 1;
    const left    = Math.random() * 100;
    const delay   = Math.random() * 20;
    const duration = Math.random() * 15 + 12;
    const opacity = Math.random() * 0.5 + 0.2;

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      bottom: -${size}px;
      opacity: ${opacity};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;
    UI.particles.appendChild(p);
  }
}

// ─── 7. THEME SWITCHER ───────────────────────────────────────────
const THEMES = ['sunny', 'rainy', 'cloudy', 'snowy', 'stormy', 'night'];

/**
 * Removes all theme classes and applies the new one
 * @param {string} theme - one of the THEMES keys
 */
function applyTheme(theme) {
  THEMES.forEach(t => UI.body.classList.remove(`theme-${t}`));
  if (theme) UI.body.classList.add(`theme-${theme}`);
}

// ─── 8. SEARCH HISTORY ──────────────────────────────────────────
/**
 * Loads search history from localStorage and renders chips
 */
function loadHistory() {
  try {
    state.searchHistory = JSON.parse(localStorage.getItem('atmos_history') || '[]');
  } catch {
    state.searchHistory = [];
  }
  renderHistory();
}

/**
 * Adds a city to history (max 6 entries, no duplicates)
 * @param {string} city - city name to save
 */
function addToHistory(city) {
  const normalised = city.trim();
  state.searchHistory = [
    normalised,
    ...state.searchHistory.filter(c => c.toLowerCase() !== normalised.toLowerCase())
  ].slice(0, 6);

  try {
    localStorage.setItem('atmos_history', JSON.stringify(state.searchHistory));
  } catch {
    // localStorage might be unavailable in some environments
  }
  renderHistory();
}

/**
 * Renders the history chips strip from state.searchHistory
 */
function renderHistory() {
  UI.historyChips.innerHTML = '';
  UI.historyStrip.style.display = state.searchHistory.length ? 'flex' : 'none';

  state.searchHistory.forEach(city => {
    const btn = document.createElement('button');
    btn.className = 'history-chip';
    btn.textContent = city;
    btn.setAttribute('aria-label', `Search ${city} again`);
    btn.addEventListener('click', () => {
      UI.cityInput.value = city;
      fetchWeatherByCity(city);
    });
    UI.historyChips.appendChild(btn);
  });
}

// ─── 9. ERROR HANDLING ──────────────────────────────────────────
/**
 * Shows the animated error popup, auto-dismisses after 4s
 * @param {string} msg - error message to display
 */
function showError(msg) {
  UI.errorMsg.textContent = msg;
  UI.errorPopup.classList.add('show');

  clearTimeout(state.errorTimer);
  state.errorTimer = setTimeout(hideError, 4000);
}

function hideError() {
  UI.errorPopup.classList.remove('show');
}

// ─── 10. LOADING STATE ──────────────────────────────────────────
/**
 * Shows or hides the loading skeleton animation
 * @param {boolean} visible
 */
function setLoading(visible) {
  if (visible) {
    UI.skeletonWrapper.hidden  = false;
    UI.weatherDashboard.hidden = true;
    UI.welcomeState.hidden     = true;
  } else {
    UI.skeletonWrapper.hidden = true;
  }
}

// ─── 11. GEOCODING — CITY → COORDINATES ─────────────────────────
/**
 * Converts a city name to lat/lon using Nominatim (OpenStreetMap)
 * @param {string} city - city name
 * @returns {Promise<{lat, lon, displayName, country}>}
 */
async function geocodeCity(city) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1&addressdetails=1`;

  const response = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'AtmosWeatherApp/1.0' }
  });

  if (!response.ok) throw new Error('Geocoding request failed');

  const data = await response.json();
  if (!data.length) throw new Error(`City "${city}" not found. Check spelling.`);

  const place = data[0];
  return {
    lat: parseFloat(place.lat),
    lon: parseFloat(place.lon),
    displayName: place.address?.city
               || place.address?.town
               || place.address?.village
               || place.name,
    country: place.address?.country || '',
  };
}

// ─── 12. REVERSE GEOCODING — COORDINATES → CITY ─────────────────
/**
 * Converts lat/lon to a city name (used after geolocation)
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{displayName, country}>}
 */
async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
  const response = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'AtmosWeatherApp/1.0' }
  });
  if (!response.ok) throw new Error('Reverse geocoding failed');
  const data = await response.json();
  return {
    displayName: data.address?.city
              || data.address?.town
              || data.address?.village
              || data.address?.county
              || 'Your Location',
    country: data.address?.country || '',
  };
}

// ─── 13. OPEN-METEO API — FETCH WEATHER ─────────────────────────
/**
 * Fetches current weather + daily forecast from Open-Meteo
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Object>} - raw Open-Meteo response
 */
async function fetchOpenMeteo(lat, lon) {
  const params = new URLSearchParams({
    latitude:  lat,
    longitude: lon,
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'wind_speed_10m',
      'weather_code',
      'is_day',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
    ].join(','),
    timezone:        'auto',
    forecast_days:   6,
    wind_speed_unit: 'kmh',
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Weather data fetch failed. Try again.');

  return response.json();
}

// ─── 14. TEMPERATURE CONVERSION ─────────────────────────────────
/**
 * Converts Celsius to Fahrenheit
 * @param {number} c - temperature in Celsius
 * @returns {number}
 */
const toF = c => Math.round(c * 9 / 5 + 32);

/**
 * Returns display temperature based on current unit setting
 * @param {number} celsiusVal
 * @returns {string}
 */
function displayTemp(celsiusVal) {
  return state.isCelsius
    ? Math.round(celsiusVal)
    : toF(celsiusVal);
}

// ─── 15. TIME FORMATTING ────────────────────────────────────────
/**
 * Formats an ISO datetime string to HH:MM (12h format)
 * @param {string} isoString - e.g. "2025-06-01T05:43"
 * @returns {string} - e.g. "5:43 AM"
 */
function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// ─── 16. RENDER WEATHER UI ──────────────────────────────────────
/**
 * Takes raw API data + location info and populates the UI
 * @param {Object} data     - Open-Meteo response
 * @param {Object} location - { displayName, country }
 */
function renderWeather(data, location) {
  const curr  = data.current;
  const daily = data.daily;

  // Get weather info from code mapping
  const code      = curr.weather_code;
  const isDay     = curr.is_day === 1;
  const weatherInfo = WEATHER_CODES[code] || DEFAULT_CODE;

  // Override theme to night if it's dark
  const theme = !isDay ? 'night' : weatherInfo.theme;

  // ── Location ──
  UI.cityName.textContent    = location.displayName;
  UI.cityMeta.textContent    = location.country;
  UI.conditionText.textContent = weatherInfo.label;

  // ── Icon ──
  UI.weatherIconMain.textContent = weatherInfo.icon;

  // ── Temperature ──
  UI.tempValue.textContent   = displayTemp(curr.temperature_2m);
  UI.tempUnit.textContent    = state.isCelsius ? '°C' : '°F';
  UI.feelsLike.innerHTML     = `Feels like <strong>${displayTemp(curr.apparent_temperature)}${state.isCelsius ? '°C' : '°F'}</strong>`;

  // ── Details ──
  UI.humidity.textContent    = `${curr.relative_humidity_2m}%`;
  UI.windSpeed.textContent   = `${Math.round(curr.wind_speed_10m)} km/h`;
  UI.sunrise.textContent     = formatTime(daily.sunrise[0]);
  UI.sunset.textContent      = formatTime(daily.sunset[0]);

  // ── Mood message ──
  const moodPool = MOODS[theme] || MOODS['night'];
  UI.moodText.textContent = moodPool[Math.floor(Math.random() * moodPool.length)];

  // ── Apply background theme ──
  applyTheme(theme);

  // ── 5-day forecast (skip today = index 0) ──
  renderForecast(daily);

  // ── Show dashboard ──
  UI.weatherDashboard.hidden = false;
  UI.welcomeState.hidden = true;
}

// ─── 17. RENDER FORECAST ────────────────────────────────────────
/**
 * Renders the 5-day forecast strip
 * @param {Object} daily - Open-Meteo daily data block
 */
function renderForecast(daily) {
  UI.forecastList.innerHTML = '';

  // Compute temperature range for proportional bar widths
  const allMaxes = daily.temperature_2m_max.slice(1, 6);
  const allMins  = daily.temperature_2m_min.slice(1, 6);
  const globalMax = Math.max(...allMaxes);
  const globalMin = Math.min(...allMins);
  const range = globalMax - globalMin || 1;

  for (let i = 1; i <= 5; i++) {
    const date   = new Date(daily.time[i]);
    const code   = daily.weather_code[i];
    const maxC   = daily.temperature_2m_max[i];
    const minC   = daily.temperature_2m_min[i];
    const info   = WEATHER_CODES[code] || DEFAULT_CODE;

    const barW   = Math.round(((maxC - globalMin) / range) * 100);

    const row = document.createElement('div');
    row.className = 'forecast-row';
    row.style.animationDelay = `${(i - 1) * 80}ms`;
    row.setAttribute('role', 'listitem');

    row.innerHTML = `
      <span class="forecast-day">${DAYS[date.getDay()]}</span>
      <span class="forecast-icon" aria-hidden="true">${info.icon}</span>
      <div class="forecast-bar-wrap">
        <span class="forecast-temp-min">${displayTemp(minC)}°</span>
        <div class="forecast-bar-track">
          <div class="forecast-bar-fill" style="width: ${barW}%"></div>
        </div>
        <span class="forecast-temp-max">${displayTemp(maxC)}°</span>
      </div>
    `;
    UI.forecastList.appendChild(row);
  }
}

// ─── 18. MAIN FETCH ORCHESTRATOR ────────────────────────────────
/**
 * Full pipeline: geocode → fetch weather → render
 * @param {string} city - city name entered by user
 */
async function fetchWeatherByCity(city) {
  if (!city.trim()) {
    showError('Please enter a city name.');
    return;
  }

  setLoading(true);

  try {
    // Step 1: Get coordinates for the city
    const location = await geocodeCity(city);

    // Step 2: Fetch weather data from Open-Meteo
    const data = await fetchOpenMeteo(location.lat, location.lon);

    // Cache for unit toggle re-render
    state.currentWeatherData = data;
    state.currentCity = city;

    // Step 3: Render everything
    renderWeather(data, location);

    // Step 4: Save to search history
    addToHistory(location.displayName);

  } catch (err) {
    showError(err.message || 'Something went wrong. Please try again.');
    UI.welcomeState.hidden = false;
    UI.weatherDashboard.hidden = true;
  } finally {
    setLoading(false);
  }
}

// ─── 19. GEOLOCATION ────────────────────────────────────────────
/**
 * Uses browser's Geolocation API to detect user's city automatically
 */
async function detectLocation() {
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by your browser.');
    return;
  }

  UI.locateBtn.classList.add('loading');
  UI.locateBtn.disabled = true;
  setLoading(true);

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        const { lat, longitude: lon } = coords;
        const lonVal = coords.longitude;

        // Reverse geocode to get city name
        const location = await reverseGeocode(lat, lonVal);

        // Fetch weather
        const data = await fetchOpenMeteo(lat, lonVal);

        state.currentWeatherData = data;
        state.currentCity = location.displayName;

        renderWeather(data, location);
        addToHistory(location.displayName);
        UI.cityInput.value = location.displayName;

      } catch (err) {
        showError('Could not fetch weather for your location.');
        UI.welcomeState.hidden = false;
        UI.weatherDashboard.hidden = true;
      } finally {
        setLoading(false);
        UI.locateBtn.classList.remove('loading');
        UI.locateBtn.disabled = false;
      }
    },
    (err) => {
      const messages = {
        1: 'Location permission denied. Please allow access.',
        2: 'Location unavailable. Try searching manually.',
        3: 'Location request timed out.',
      };
      showError(messages[err.code] || 'Could not detect location.');
      setLoading(false);
      UI.locateBtn.classList.remove('loading');
      UI.locateBtn.disabled = false;
      UI.welcomeState.hidden = false;
    },
    { timeout: 10000, maximumAge: 60000 }
  );
}

// ─── 20. TEMPERATURE UNIT TOGGLE ────────────────────────────────
/**
 * Toggles between Celsius and Fahrenheit,
 * re-renders weather data if it exists
 */
function toggleUnit() {
  state.isCelsius = !state.isCelsius;

  UI.unitToggle.classList.toggle('fahrenheit', !state.isCelsius);
  UI.labelC.classList.toggle('active', state.isCelsius);
  UI.labelF.classList.toggle('active', !state.isCelsius);

  // Re-render temperature fields if data is available
  if (state.currentWeatherData) {
    const curr  = state.currentWeatherData.current;
    const daily = state.currentWeatherData.daily;

    UI.tempValue.textContent = displayTemp(curr.temperature_2m);
    UI.tempUnit.textContent  = state.isCelsius ? '°C' : '°F';
    UI.feelsLike.innerHTML   = `Feels like <strong>${displayTemp(curr.apparent_temperature)}${state.isCelsius ? '°C' : '°F'}</strong>`;

    renderForecast(daily);
  }
}

// ─── 21. SEARCH INPUT HELPERS ───────────────────────────────────
/**
 * Triggers a search from the input field's current value
 */
function triggerSearch() {
  const city = UI.cityInput.value.trim();
  if (city) fetchWeatherByCity(city);
  else showError('Please enter a city name.');
}

// ─── 22. EVENT LISTENERS ────────────────────────────────────────
function initEventListeners() {
  // Search button click
  UI.searchBtn.addEventListener('click', triggerSearch);

  // Enter key in input
  UI.cityInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') triggerSearch();
  });

  // Auto-focus search input on page load (desktop only)
  if (window.innerWidth > 600) UI.cityInput.focus();

  // Locate button
  UI.locateBtn.addEventListener('click', detectLocation);

  // Error popup close
  UI.errorClose.addEventListener('click', hideError);

  // Unit toggle
  UI.unitToggle.addEventListener('click', toggleUnit);

  // Close error on escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') hideError();
  });

  // Clear cursor when mouse leaves window
  document.addEventListener('mouseleave', () => {
    UI.cursor.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    UI.cursor.style.opacity = '1';
  });
}

// ─── 23. INITIAL LOAD / BOOT ────────────────────────────────────
/**
 * Application bootstrap: initialises all modules in order
 */
function init() {
  // Start real-time clock
  startClock();

  // Set up mouse cursor (only on non-touch devices)
  if (window.matchMedia('(hover: hover)').matches) {
    initCursor();
  }

  // Spawn background particles
  createParticles();

  // Wire up all event listeners
  initEventListeners();

  // Load and render search history from localStorage
  loadHistory();

  // Hide welcome state while visible by default
  // (shown after everything loads)
  UI.welcomeState.hidden = false;
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);