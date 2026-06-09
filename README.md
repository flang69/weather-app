# 🌐 Atmos — Weather Intelligence App

> A premium, futuristic weather application built with pure HTML, CSS & JavaScript.  
> Powered by [Open-Meteo API](https://open-meteo.com/) (free, no API key required) and [Nominatim](https://nominatim.openstreetmap.org/) for geocoding.

---

## 📁 Folder Structure

```
weather-app/
├── index.html       ← Semantic HTML structure
├── style.css        ← All styling: glassmorphism, animations, themes, responsive
└── script.js        ← All logic: API calls, rendering, interactions
```

No build tools, no frameworks, no dependencies. Just open `index.html` in a browser.

---

## ✨ Features At a Glance

### UI/UX
| Feature | Details |
|---|---|
| **Glassmorphism cards** | Frosted-glass backdrop-filter with layered borders |
| **Aurora background** | 3 morphing blobs that shift colour with the weather |
| **Dynamic themes** | Sunny → warm orange, Rainy → deep blue, Cloudy → grey, Stormy → amber, Snowy → ice, Night → indigo |
| **Custom cursor glow** | Cyan glow dot follows mouse; expands on interactive elements |
| **Parallax blobs** | Mouse movement subtly shifts background layers |
| **Floating particles** | 24 ambient particles float upward in the background |
| **Live clock** | Real-time HH:MM:SS + date display in the header |
| **Loading skeleton** | Shimmer animation while data is fetching |
| **Error popup** | Slides in from the bottom, auto-dismisses in 4 seconds |
| **Fade-in dashboard** | Weather panel animates in with spring easing |

### Functional
| Feature | Details |
|---|---|
| **City search** | Full geocoding via Nominatim OSM |
| **Auto-detect location** | Browser Geolocation API + reverse geocoding |
| **Search history** | Up to 6 recent cities stored in localStorage |
| **History chips** | Click any chip to instantly re-search |
| **°C / °F toggle** | Live unit conversion, no extra API call |
| **5-day forecast** | Proportional temperature bar, icon, min/max |
| **Weather details** | Humidity, wind speed, sunrise, sunset, feels-like |
| **Weather mood** | Contextual message based on weather condition |
| **Enter key support** | Works naturally with keyboard-only usage |
| **Responsive** | Tested from 320 px mobile to 4K desktop |

---

## 🚀 Getting Started

1. **Download or clone** the three files into one folder.
2. **Open** `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).
3. **Search** for any city or click the ◎ button to auto-detect your location.

> **No API key needed.** Open-Meteo and Nominatim are fully free and public.

---

## 🧠 Architecture & Code Walkthrough

### `index.html`
Uses semantic elements throughout: `<main>`, `<header>`, `<section>`, `<article>`, `<aside>`, `<footer>`. ARIA labels and roles are applied for screen reader compatibility. All interactive UI states are toggled with `hidden` attribute (not `display: none` in CSS).

### `style.css`
Organised into 22 numbered sections:
1. CSS custom properties (design tokens)
2. Reset & base
3. Custom cursor
4. Aurora background & blobs
5. Particles
6. Layout wrapper
7. Glassmorphism utility class
8. Header
9. Search section
10. History strip
11. Loading skeleton + shimmer keyframe
12. Error popup
13. Weather dashboard grid
14. Main weather card
15. Forecast panel
16. Welcome state
17. Footer
18. Dynamic weather themes (body class overrides)
19. Locate button loading state
20. Responsive – tablet (≤860 px)
21. Responsive – mobile (≤520 px)
22. Reduced motion media query

### `script.js`
Organised into 23 numbered sections using `async/await` throughout:

```
WEATHER_CODES   → WMO code → label, emoji, theme mapping
MOODS           → Theme → array of mood strings
startClock()    → setInterval every 1s
initCursor()    → mousemove listener + parallax
createParticles()→ Generates DOM particle elements
applyTheme()    → Toggles body class
loadHistory()   → localStorage read + renderHistory()
addToHistory()  → Dedup, trim to 6, save + re-render
renderHistory() → Build chip buttons
showError()     → Add .show class, set auto-dismiss timer
setLoading()    → Show/hide skeleton
geocodeCity()   → Nominatim fetch → {lat, lon, displayName, country}
reverseGeocode()→ Nominatim reverse → {displayName, country}
fetchOpenMeteo()→ Open-Meteo fetch with URLSearchParams
displayTemp()   → C or F based on state.isCelsius
formatTime()    → ISO string → "5:43 AM"
renderWeather() → Populates all card fields
renderForecast()→ Builds 5 forecast rows with bar widths
fetchWeatherByCity() → Main pipeline: geocode → API → render
detectLocation()→ navigator.geolocation → reverseGeocode → API
toggleUnit()    → Flip isCelsius, re-render temps & forecast
initEventListeners() → All click/keydown bindings
init()          → Boot: clock + cursor + particles + listeners + history
```

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#080c18` (deep space navy) |
| Cyan accent | `#00d4ff` |
| Violet accent | `#7c3aed` |
| Green accent | `#00ff88` |
| Amber accent | `#ffb347` |
| Display font | Outfit (Google Fonts) |
| Data/number font | JetBrains Mono (Google Fonts) |
| Glass surface | `rgba(255,255,255,0.06)` + `backdrop-filter: blur(20px)` |
| Border | `rgba(255,255,255,0.12)` |

---

## 🔮 Future Improvements

1. **Hourly forecast** — Open-Meteo supports `hourly` data; add a scrollable 24h strip.
2. **Air quality index** — Open-Meteo has an AQI endpoint; display PM2.5 / ozone.
3. **UV index** — Show UV level with a color-coded progress bar.
4. **Rain probability** — Add precipitation chance per forecast day.
5. **Multiple saved locations** — Let users pin favourite cities.
6. **Push notifications** — Service Worker + Notification API for weather alerts.
7. **PWA** — Add `manifest.json` + Service Worker for offline support and home screen install.
8. **Weather map overlay** — Embed an OpenStreetMap tile layer with rain radar.
9. **Animated weather illustrations** — Replace emoji with custom CSS/SVG animations per condition.
10. **Accessible colour contrast** — Verify all theme colour combos against WCAG AA.

---

## 💬 Commit Message Ideas

```
feat: initial weather app with Open-Meteo integration
feat: add glassmorphism UI and aurora background themes
feat: implement geolocation auto-detect with reverse geocoding
feat: add 5-day forecast with proportional temperature bars
feat: add search history with localStorage persistence
feat: implement °C/°F toggle with live re-render
feat: add custom cursor glow and parallax blob effect
feat: add loading skeleton and animated error popup
feat: implement dynamic weather themes (sunny/rainy/cloudy/snowy/stormy/night)
feat: add floating particles and real-time clock
style: improve mobile responsive layout for search and forecast
fix: handle geolocation permission denied gracefully
fix: deduplicate search history entries (case-insensitive)
refactor: organise script.js into 23 numbered sections with JSDoc
perf: skip particle creation on repeat renders
a11y: add ARIA labels and role attributes throughout
```

---

## 📜 API Reference

### Open-Meteo (no key needed)
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude=…
  &longitude=…
  &current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day
  &daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset
  &timezone=auto
  &forecast_days=6
```

### Nominatim Geocoding (no key needed)
```
GET https://nominatim.openstreetmap.org/search?q={city}&format=json&limit=1&addressdetails=1
GET https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json
```

> Nominatim requires a `User-Agent` header. This app sends `AtmosWeatherApp/1.0`.

---

## 📄 License

MIT — free for personal and commercial use. Attribution appreciated.

---

*Built with ♥ using pure HTML, CSS & JavaScript — no frameworks, no build tools.*
