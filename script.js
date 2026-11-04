const weatherApiBase = "https://api.open-meteo.com/v1/forecast";
const geocodingApiBase = "https://geocoding-api.open-meteo.com/v1/search";
const airQualityApiBase = "https://air-quality-api.open-meteo.com/v1/air-quality";

const weatherCodeMap = {
  0: { label: "Clear sky", icon: "☀️", theme: "weather-clear" },
  1: { label: "Mostly clear", icon: "🌤️", theme: "weather-clear" },
  2: { label: "Partly cloudy", icon: "⛅", theme: "weather-cloudy" },
  3: { label: "Overcast", icon: "☁️", theme: "weather-cloudy" },
  45: { label: "Foggy", icon: "🌫️", theme: "weather-fog" },
  48: { label: "Rime fog", icon: "🌫️", theme: "weather-fog" },
  51: { label: "Light drizzle", icon: "🌦️", theme: "weather-rain" },
  53: { label: "Drizzle", icon: "🌦️", theme: "weather-rain" },
  55: { label: "Heavy drizzle", icon: "🌧️", theme: "weather-rain" },
  56: { label: "Freezing drizzle", icon: "🌧️", theme: "weather-rain" },
  57: { label: "Heavy freezing drizzle", icon: "🌧️", theme: "weather-rain" },
  61: { label: "Light rain", icon: "🌦️", theme: "weather-rain" },
  63: { label: "Rain", icon: "🌧️", theme: "weather-rain" },
  65: { label: "Heavy rain", icon: "🌧️", theme: "weather-rain" },
  66: { label: "Freezing rain", icon: "🌧️", theme: "weather-rain" },
  67: { label: "Heavy freezing rain", icon: "🌧️", theme: "weather-rain" },
  71: { label: "Light snow", icon: "🌨️", theme: "weather-snow" },
  73: { label: "Snow", icon: "❄️", theme: "weather-snow" },
  75: { label: "Heavy snow", icon: "❄️", theme: "weather-snow" },
  77: { label: "Snow grains", icon: "❄️", theme: "weather-snow" },
  80: { label: "Light showers", icon: "🌦️", theme: "weather-rain" },
  81: { label: "Showers", icon: "🌧️", theme: "weather-rain" },
  82: { label: "Heavy showers", icon: "🌧️", theme: "weather-rain" },
  85: { label: "Light snow showers", icon: "🌨️", theme: "weather-snow" },
  86: { label: "Heavy snow showers", icon: "🌨️", theme: "weather-snow" },
  95: { label: "Thunderstorm", icon: "⛈️", theme: "weather-storm" },
  96: { label: "Thunderstorm with hail", icon: "⛈️", theme: "weather-storm" },
  99: { label: "Heavy hailstorm", icon: "⛈️", theme: "weather-storm" },
};

const elements = {
  cityName: document.getElementById("city-name"),
  weatherIcon: document.getElementById("weather-icon"),
  currentTemp: document.getElementById("current-temp"),
  weatherCondition: document.getElementById("weather-condition"),
  humidity: document.getElementById("humidity"),
  humidityCard: document.getElementById("humidity-card"),
  windSpeed: document.getElementById("wind-speed"),
  windCard: document.getElementById("wind-card"),
  feelsLike: document.getElementById("feels-like"),
  airQuality: document.getElementById("air-quality"),
  sunrise: document.getElementById("sunrise"),
  sunset: document.getElementById("sunset"),
  lastUpdated: document.getElementById("last-updated"),
  liveTime: document.getElementById("live-time"),
  hourlyForecast: document.getElementById("hourly-forecast"),
  dailyForecast: document.getElementById("daily-forecast"),
  precipitation: document.getElementById("precipitation"),
  uvIndex: document.getElementById("uv-index"),
  uvCard: document.getElementById("uv-card"),
  pressure: document.getElementById("pressure"),
  pressureCard: document.getElementById("pressure-card"),
  visibility: document.getElementById("visibility"),
  visibilityCard: document.getElementById("visibility-card"),
  windDirection: document.getElementById("wind-direction"),
  cloudCover: document.getElementById("cloud-cover"),
  dewPoint: document.getElementById("dew-point"),
  precipitationProbability: document.getElementById("precipitation-probability"),
  aqBar: document.getElementById("aq-bar"),
  summaryFeels: document.getElementById("summary-feels"),
  summaryHumidity: document.getElementById("summary-humidity"),
  summaryWind: document.getElementById("summary-wind"),
  summaryClouds: document.getElementById("summary-clouds"),
  summaryRain: document.getElementById("summary-rain"),
  summaryUv: document.getElementById("summary-uv"),
  tempChart: document.getElementById("temp-chart"),
  regionTag: document.getElementById("region-tag"),
  weatherRadar: document.getElementById("weather-radar"),
  earthGlobe: document.getElementById("earth-globe"),
  radarStatus: document.getElementById("radar-status"),
  aiAssistantSummary: document.getElementById("ai-assistant-summary"),
  aiAssistantTips: document.getElementById("ai-assistant-tips"),
  comparisonList: document.getElementById("comparison-list"),
  compareCityInput: document.getElementById("compare-city-input"),
  addCompareCity: document.getElementById("add-compare-city"),
  searchForm: document.getElementById("search-form"),
  cityInput: document.getElementById("city-input"),
  locateBtn: document.getElementById("locate-btn"),
  favoriteBtn: document.getElementById("favorite-btn"),
  favorites: document.getElementById("favorites"),
  suggestions: document.getElementById("search-suggestions"),
  aiStatus: document.getElementById("ai-status"),
  aiSummary: document.getElementById("ai-summary"),
  aiChecks: document.getElementById("ai-checks"),
  sidebarToggle: document.getElementById("sidebar-toggle"),
  sidebarClose: document.getElementById("sidebar-close"),
  sidebarTabs: [...document.querySelectorAll(".sidebar-tab")],
  sidebarPanels: [...document.querySelectorAll(".sidebar-panel-section")],
  sidebar: document.getElementById("app-sidebar"),
  unitButtons: [...document.querySelectorAll(".unit-btn")],
  themeButtons: [...document.querySelectorAll(".theme-btn")],
  settingButtons: [...document.querySelectorAll(".setting-toggle")],
};

const state = {
  latitude: 40.7128,
  longitude: -74.006,
  cityLabel: "New York",
  countryLabel: "United States",
  timezone: "UTC",
  unit: "C",
  theme: "default",
  favorites: JSON.parse(localStorage.getItem("weather-favorites") || "[]"),
  selectedForecastIndex: 0,
  lastWeatherFetched: null,
  currentWeather: null,
  aiLastFixAt: 0,
  compareCities: ["Tokyo", "London"],
  comparisonData: [],
  appSettings: {
    autoRefresh: true,
    detailMode: true,
    compactView: false,
  },
  refreshInFlight: false,
  weatherAbortController: null,
};

const mapState = {
  map: null,
  marker: null,
};

const weatherCache = new Map();

function createLocationKey(latitude, longitude) {
  return `${Number(latitude).toFixed(4)}:${Number(longitude).toFixed(4)}`;
}

function convertTemp(value) {
  return state.unit === "C" ? value : (value * 9) / 5 + 32;
}

function formatTemp(value) {
  return `${Math.round(convertTemp(value))}°${state.unit}`;
}

function formatWind(value) {
  if (state.unit === "F") {
    return `${Math.round(value * 0.621371)} mph`;
  }
  return `${Math.round(value)} km/h`;
}

function applyWeatherTheme(theme) {
  document.body.classList.remove(
    "theme-default",
    "theme-night",
    "theme-aurora",
    "weather-clear",
    "weather-cloudy",
    "weather-rain",
    "weather-snow",
    "weather-storm",
    "weather-fog"
  );

  if (theme) {
    document.body.classList.add(theme);
  }
}

function setTheme(theme) {
  state.theme = theme;
  applyWeatherTheme(`theme-${theme}`);
  elements.themeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.theme === theme);
  });
}

function setUnit(unit) {
  state.unit = unit;
  elements.unitButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.unit === unit);
  });

  const lastCityName = localStorage.getItem("weather-last-city");
  if (lastCityName) {
    searchCity(lastCityName).catch(() => loadDefaultWeather());
  } else {
    loadDefaultWeather();
  }
}

function updateAppSettings() {
  document.body.classList.toggle("compact-view", state.appSettings.compactView);
  document.body.classList.toggle("detail-mode-off", !state.appSettings.detailMode);

  elements.settingButtons.forEach((button) => {
    const key = button.dataset.setting;
    const active = !!state.appSettings[key];
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function toggleSetting(key) {
  state.appSettings[key] = !state.appSettings[key];
  updateAppSettings();
}

function openSidebar(panelName = "settings") {
  if (!elements.sidebar) return;
  elements.sidebar.classList.add("open");
  elements.sidebar.setAttribute("aria-hidden", "false");

  if (panelName) {
    elements.sidebarTabs.forEach((button) => {
      button.classList.toggle("active", button.dataset.panel === panelName);
    });
    elements.sidebarPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === `panel-${panelName}`);
    });
  }
}

function closeSidebar() {
  if (!elements.sidebar) return;
  elements.sidebar.classList.remove("open");
  elements.sidebar.setAttribute("aria-hidden", "true");
}

function formatHour(timestamp, timezone) {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    timeZone: timezone,
  }).format(date);
}

function formatDay(timestamp, timezone) {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: timezone,
  }).format(date);
}

function formatClock(timestamp, timezone) {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(date);
}

function getWeatherMeta(code) {
  return weatherCodeMap[code] || { label: "Weather", icon: "🌤️", theme: "weather-cloudy" };
}

function setAirQualityLabel(value) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return { label: "N/A", value: null };
  }

  if (value <= 50) return { label: "Good", value: Math.round(value) };
  if (value <= 100) return { label: "Moderate", value: Math.round(value) };
  if (value <= 150) return { label: "Unhealthy for sensitive groups", value: Math.round(value) };
  if (value <= 200) return { label: "Unhealthy", value: Math.round(value) };
  if (value <= 300) return { label: "Very unhealthy", value: Math.round(value) };
  return { label: "Hazardous", value: Math.round(value) };
}

function getCompassDirection(degrees) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(((degrees % 360) / 45)) % 8;
  return directions[index];
}

function renderTrendChart(data) {
  const temps = data.hourly.temperature_2m.slice(0, 12).map((value) => convertTemp(value));
  const svg = elements.tempChart;
  if (!svg || temps.length === 0) return;

  const width = 420;
  const height = 170;
  const padding = 20;
  const minTemp = Math.min(...temps) - 2;
  const maxTemp = Math.max(...temps) + 2;
  const range = maxTemp - minTemp || 1;

  const coords = temps.map((temp, index) => {
    const x = padding + (index * (width - padding * 2)) / (temps.length - 1 || 1);
    const y = height - padding - ((temp - minTemp) / range) * (height - padding * 2);
    return { x, y, temp };
  });

  const linePath = coords
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height - padding} L ${coords[0].x} ${height - padding} Z`;

  svg.innerHTML = `
    <defs>
      <linearGradient id="temp-fill" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="rgba(255,255,255,0.72)" />
        <stop offset="100%" stop-color="rgba(255,255,255,0.04)" />
      </linearGradient>
    </defs>
    <path d="${areaPath}" fill="url(#temp-fill)"></path>
    <path d="${linePath}" fill="none" stroke="rgba(255,255,255,0.94)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>
    ${coords
      .map(
        (point) => `
        <g>
          <circle cx="${point.x}" cy="${point.y}" r="3.5" fill="rgba(255,255,255,0.96)">
            <title>${Math.round(point.temp)}°${state.unit}</title>
          </circle>
          <text x="${point.x}" y="${height - 8}" fill="rgba(255,255,255,0.64)" font-size="9" text-anchor="middle">${Math.round(point.temp)}°</text>
        </g>
      `
      )
      .join("")}
  `;
}

function renderForecasts(data) {
  const hourly = data.hourly;
  const daily = data.daily;
  const timezone = data.timezone || "UTC";

  const startIndex = new Date().getHours();
  const hourlyItems = [];

  for (let i = 0; i < 7; i += 1) {
    const timeValue = hourly.time[startIndex + i];
    const tempValue = hourly.temperature_2m[startIndex + i];
    const codeValue = hourly.weather_code[startIndex + i];
    const meta = getWeatherMeta(codeValue);

    if (!timeValue || tempValue === undefined) continue;

    const selectedClass = i === state.selectedForecastIndex ? "selected" : "";
    const temperatureText = formatTemp(tempValue);

    hourlyItems.push(`
      <div class="hourly-item ${selectedClass}" data-index="${i}" data-kind="hourly">
        <div class="forecast-icon">${meta.icon}</div>
        <div>
          <div class="forecast-time">${formatHour(timeValue, timezone)}</div>
          <div class="daily-condition">${meta.label}</div>
        </div>
        <div class="forecast-temp">${temperatureText}</div>
      </div>
    `);
  }

  elements.hourlyForecast.innerHTML = hourlyItems.join("");

  const dailyItems = daily.time.slice(0, 5).map((day, index) => {
    const maxTemp = daily.temperature_2m_max[index];
    const minTemp = daily.temperature_2m_min[index];
    const codeValue = daily.weather_code[index];
    const meta = getWeatherMeta(codeValue);

    return `
      <div class="daily-item" data-index="${index}" data-kind="daily">
        <div>
          <div class="daily-day">${index === 0 ? "Today" : formatDay(day, timezone)}</div>
          <div class="daily-condition">${meta.label}</div>
        </div>
        <div class="forecast-icon">${meta.icon}</div>
        <div class="daily-temp">${formatTemp(maxTemp)} / ${formatTemp(minTemp)}</div>
      </div>
    `;
  });

  elements.dailyForecast.innerHTML = dailyItems.join("");
  renderTrendChart(data);
}

function updateLiveClock() {
  const clock = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());

  if (elements.liveTime) {
    elements.liveTime.textContent = clock;
  }
}

function updateCurrentWeather(weatherData, airData) {
  const current = weatherData.current;
  const daily = weatherData.daily;
  const timezone = weatherData.timezone || "UTC";
  const weatherMeta = getWeatherMeta(current.weather_code);
  const airflowValue = airData?.current?.us_aqi ?? null;
  const airQualityInfo = setAirQualityLabel(airflowValue);

  state.timezone = timezone;
  updateLiveClock();
  elements.cityName.textContent = state.cityLabel;
  elements.weatherIcon.textContent = weatherMeta.icon;
  elements.currentTemp.textContent = formatTemp(current.temperature_2m);
  elements.weatherCondition.textContent = weatherMeta.label;
  elements.humidity.textContent = `${Math.round(current.relative_humidity_2m)}%`;
  elements.humidityCard.textContent = `${Math.round(current.relative_humidity_2m)}%`;
  const rainChance = Math.round(daily.precipitation_probability_max?.[0] ?? current.precipitation ?? 0);
  const windDirection = Math.round(current.wind_direction_10m ?? 0);
  const cloudCover = Math.round(current.cloud_cover ?? 0);

  elements.windSpeed.textContent = formatWind(current.wind_speed_10m);
  elements.windCard.textContent = formatWind(current.wind_speed_10m);
  elements.feelsLike.textContent = formatTemp(current.apparent_temperature);
  elements.airQuality.textContent = airQualityInfo.value === null ? "N/A" : `${airQualityInfo.label} (${airQualityInfo.value})`;
  elements.sunrise.textContent = formatClock(daily.sunrise[0], timezone);
  elements.sunset.textContent = formatClock(daily.sunset[0], timezone);
  elements.precipitation.textContent = `${Math.round(current.precipitation ?? 0)} mm`;
  elements.uvIndex.textContent = `${Math.round(daily.uv_index_max?.[0] ?? current.uv_index ?? 0)}`;
  elements.uvCard.textContent = `${Math.round(daily.uv_index_max?.[0] ?? current.uv_index ?? 0)}`;
  elements.pressure.textContent = `${Math.round(current.pressure_msl ?? 0)} hPa`;
  elements.pressureCard.textContent = `${Math.round(current.pressure_msl ?? 0)} hPa`;
  elements.visibility.textContent = `${Math.round((current.visibility ?? 0) / 1000)} km`;
  elements.visibilityCard.textContent = `${Math.round((current.visibility ?? 0) / 1000)} km`;
  elements.windDirection.textContent = `${windDirection}° ${getCompassDirection(windDirection)}`;
  elements.cloudCover.textContent = `${cloudCover}%`;
  elements.dewPoint.textContent = formatTemp(current.dew_point_2m ?? current.temperature_2m);
  elements.precipitationProbability.textContent = `${rainChance}%`;
  elements.aqBar.style.width = `${Math.min((airflowValue ?? 0) / 3, 100)}%`;
  elements.summaryFeels.textContent = formatTemp(current.apparent_temperature);
  elements.summaryHumidity.textContent = `${Math.round(current.relative_humidity_2m)}%`;
  elements.summaryWind.textContent = formatWind(current.wind_speed_10m);
  elements.summaryClouds.textContent = `${cloudCover}%`;
  elements.summaryRain.textContent = `${rainChance}%`;
  elements.summaryUv.textContent = `${Math.round(daily.uv_index_max?.[0] ?? current.uv_index ?? 0)}`;
  elements.regionTag.textContent = state.cityLabel.includes(",") ? "Local" : "Regional";

  const updatedAt = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date());
  elements.lastUpdated.textContent = `Updated ${updatedAt}`;

  applyWeatherTheme(weatherMeta.theme);
  syncFavoriteButton();
  updateMapLocation();
  updateRadarStatus(weatherData);
  updateGlobeVisuals();
  renderAiAssistant(weatherData, airData);
}

function updateGlobeVisuals() {
  if (!elements.earthGlobe) {
    return;
  }

  const current = state.currentWeather;
  const baseGlow = current && current.temperature_2m !== undefined ? Math.min(Math.max(current.temperature_2m, 0), 40) : 24;
  const glow = Math.round(165 + baseGlow * 2.5);
  const hue = Math.min(205, 200 + baseGlow * 0.8);

  elements.earthGlobe.style.setProperty("--globe-hue", `${hue}`);
  elements.earthGlobe.style.setProperty("--globe-glow", `rgba(${Math.round(glow)}, ${Math.round(170 + baseGlow)}, 255, 0.6)`);
  elements.earthGlobe.style.setProperty("--globe-sheen", `${Math.min(90, 35 + baseGlow * 1.8)}deg`);
}

function bindEarthGlobeInteractions() {
  if (!elements.earthGlobe) {
    return;
  }

  const handleMove = (event) => {
    const rect = elements.earthGlobe.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    elements.earthGlobe.style.setProperty("--rotate-x", `${(-y * 18).toFixed(2)}deg`);
    elements.earthGlobe.style.setProperty("--rotate-y", `${(x * 24).toFixed(2)}deg`);
  };

  elements.earthGlobe.addEventListener("pointermove", handleMove);
  elements.earthGlobe.addEventListener("pointerleave", () => {
    elements.earthGlobe.style.setProperty("--rotate-x", "0deg");
    elements.earthGlobe.style.setProperty("--rotate-y", "0deg");
  });
}

function renderAiReport(checks) {
  if (!elements.aiStatus || !elements.aiSummary || !elements.aiChecks) {
    return;
  }

  const level = checks.some((item) => item.level === "critical")
    ? "Critical"
    : checks.some((item) => item.level === "warning")
      ? "Warning"
      : "Healthy";

  elements.aiStatus.textContent = level;
  elements.aiStatus.style.color = level === "Critical" ? "#ffb4b4" : level === "Warning" ? "#ffd88a" : "#9fe9c8";

  if (!checks.length) {
    elements.aiSummary.textContent = "All systems nominal. Forecast data, map, and app state are healthy.";
    elements.aiChecks.innerHTML = "<li>Weather data verified</li><li>Map state synced</li><li>Auto-retry enabled</li>";
    return;
  }

  elements.aiSummary.textContent = level === "Healthy"
    ? "Minor checks are running normally. Auto-recovery is standing by."
    : "AI detected a live issue and has initiated safe recovery checks.";

  elements.aiChecks.innerHTML = checks
    .map((item) => `<li class="${item.level}">${item.message}</li>`)
    .join("");
}

function generateAiWeatherTips(weatherData, airData) {
  if (!weatherData || !weatherData.current) {
    return {
      summary: "Weather AI is waiting for fresh conditions.",
      tips: ["Checking live forecast data…"],
    };
  }

  const current = weatherData.current;
  const daily = weatherData.daily || {};
  const rainChance = Math.round(daily.precipitation_probability_max?.[0] ?? current.precipitation ?? 0);
  const temperature = current.temperature_2m;
  const humidity = current.relative_humidity_2m ?? 0;
  const wind = current.wind_speed_10m ?? 0;
  const aqi = airData?.current?.us_aqi ?? null;
  const weatherMeta = getWeatherMeta(current.weather_code);

  const tips = [];

  if (rainChance >= 70) {
    tips.push("Bring an umbrella — rain risk is elevated this period.");
  } else if (rainChance >= 40) {
    tips.push("Light rain may appear later; a compact layer is a good idea.");
  } else {
    tips.push("Dry conditions look likely, so outdoor plans are looking good.");
  }

  if (temperature < 10) {
    tips.push("It is cool outside, so a heavier jacket will feel comfortable.");
  } else if (temperature > 28) {
    tips.push("Warm conditions are in play, so sunscreen and hydration matter today.");
  } else {
    tips.push("The temperature is comfortable for most daily plans.");
  }

  if (wind > 30) {
    tips.push("Wind is noticeably strong, so keep an eye on exposed areas and loose items.");
  }

  if (humidity > 75) {
    tips.push("Humidity is high, so the air may feel heavier than the temperature suggests.");
  }

  if (aqi !== null && aqi > 100) {
    tips.push("Air quality is reduced today, so consider shorter outdoor sessions if you are sensitive.");
  } else if (aqi !== null && aqi <= 50) {
    tips.push("Air quality is in a clean range, which is great for active outdoor time.");
  }

  const summary = `The current outlook is ${weatherMeta.label.toLowerCase()} with ${Math.round(temperature)}°${state.unit} and a ${rainChance}% rain chance. This is the best time to plan around ${rainChance >= 50 ? "an umbrella and a light layer" : "outdoor time and easy movement"}.`;

  return {
    summary,
    tips: tips.slice(0, 4),
  };
}

function renderAiAssistant(weatherData, airData) {
  if (!elements.aiAssistantSummary || !elements.aiAssistantTips) {
    return;
  }

  const { summary, tips } = generateAiWeatherTips(weatherData, airData);
  elements.aiAssistantSummary.textContent = summary;
  elements.aiAssistantTips.innerHTML = tips
    .map((tip) => `<div class="assistant-tip">${tip}</div>`)
    .join("");
}

function updateRadarStatus(weatherData) {
  if (!elements.radarStatus || !elements.weatherRadar) {
    return;
  }

  const current = weatherData?.current;
  const rainChance = weatherData?.daily?.precipitation_probability_max?.[0] ?? 0;
  const label = rainChance >= 60 ? "Storm watch" : rainChance >= 35 ? "Tracking rain" : "Stable";
  elements.radarStatus.textContent = label;
  elements.weatherRadar.setAttribute("data-state", label.toLowerCase().replace(/\s+/g, "-"));
}

function runAiAssistant() {
  const checks = [];

  if (!state.currentWeather || !state.currentWeather.temperature_2m) {
    checks.push({ level: "warning", message: "Weather feed is still loading or returned incomplete data." });
  }

  if (state.lastWeatherFetched && Date.now() - state.lastWeatherFetched > 60000) {
    checks.push({ level: "warning", message: "Weather feed is stale. Auto-refresh is checking for newer data." });
  }

  if (!state.cityLabel || state.cityLabel.trim().length < 2) {
    checks.push({ level: "critical", message: "Location is missing or invalid. Falling back to a safe default city." });
  }

  if (!Number.isFinite(state.latitude) || !Number.isFinite(state.longitude) || Math.abs(state.latitude) > 90 || Math.abs(state.longitude) > 180) {
    checks.push({ level: "critical", message: "Coordinate values are invalid. Resetting location to a valid weather region." });
  }

  if (document.getElementById("earth-map") && !window.L) {
    checks.push({ level: "warning", message: "Map library is not ready yet. Waiting for the map to initialize." });
  }

  if (state.currentWeather && (Number.isNaN(state.currentWeather.temperature_2m) || Number.isNaN(state.currentWeather.relative_humidity_2m))) {
    checks.push({ level: "critical", message: "Live weather values are invalid. Re-fetching clean data." });
  }

  if (checks.length) {
    renderAiReport(checks);
  } else {
    renderAiReport([]);
  }

  if (state.currentWeather && state.lastWeatherFetched) {
    renderAiAssistant({ current: state.currentWeather, daily: state.currentWeather?.daily || {} }, null);
  }

  const now = Date.now();
  if (checks.some((item) => item.level === "critical") && now - state.aiLastFixAt > 2000) {
    state.aiLastFixAt = now;
    if (!Number.isFinite(state.latitude) || !Number.isFinite(state.longitude) || Math.abs(state.latitude) > 90 || Math.abs(state.longitude) > 180) {
      loadDefaultWeather().catch(() => useUserLocation());
    } else if (!state.cityLabel || state.cityLabel.trim().length < 2) {
      loadDefaultWeather();
    } else {
      loadWeather();
    }
  }

  if (checks.some((item) => item.message.includes("stale")) && now - state.aiLastFixAt > 2000) {
    state.aiLastFixAt = now;
    loadWeather();
  }
}

function initMap() {
  if (!window.L || !document.getElementById("earth-map")) {
    return;
  }

  if (!mapState.map) {
    mapState.map = window.L.map("earth-map", {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
    }).setView([state.latitude, state.longitude], 4);

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapState.map);

    mapState.marker = window.L.marker([state.latitude, state.longitude]).addTo(mapState.map);
  }

  updateMapLocation();
}

function updateMapLocation() {
  if (!mapState.map) {
    return;
  }

  const cityName = state.cityLabel || "Current location";
  const mapPosition = [state.latitude, state.longitude];

  mapState.map.flyTo(mapPosition, 4, {
    animate: true,
    duration: 1.2,
  });

  if (mapState.marker) {
    mapState.marker.setLatLng(mapPosition);
    mapState.marker.bindPopup(`<strong>${cityName}</strong><br>${state.latitude.toFixed(2)}, ${state.longitude.toFixed(2)}`);
  }
}

async function fetchWeather(latitude, longitude, signal = null) {
  const params = new URLSearchParams({
    latitude: latitude,
    longitude: longitude,
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "dew_point_2m",
      "is_day",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
      "cloud_cover",
      "precipitation",
      "pressure_msl",
      "visibility",
      "uv_index",
    ].join(","),
    hourly: ["temperature_2m", "weather_code", "precipitation_probability"].join(","),
    daily: ["weather_code", "temperature_2m_max", "temperature_2m_min", "sunrise", "sunset", "precipitation_probability_max", "uv_index_max"].join(","),
    timezone: "auto",
    forecast_days: 5,
  });

  const response = await fetch(`${weatherApiBase}?${params.toString()}`, signal ? { signal } : undefined);
  if (!response.ok) {
    throw new Error("Weather request failed");
  }

  return response.json();
}

async function fetchAirQuality(latitude, longitude, signal = null) {
  const params = new URLSearchParams({
    latitude: latitude,
    longitude: longitude,
    current: "us_aqi",
    timezone: "auto",
  });

  const response = await fetch(`${airQualityApiBase}?${params.toString()}`, signal ? { signal } : undefined);
  if (!response.ok) {
    return null;
  }

  return response.json();
}

async function fetchSuggestions(query) {
  const trimmed = query.trim();
  if (!trimmed) {
    hideSuggestions();
    return;
  }

  const params = new URLSearchParams({
    name: trimmed,
    count: 5,
    language: "en",
    format: "json",
  });

  try {
    const response = await fetch(`${geocodingApiBase}?${params.toString()}`);
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const cities = data.results || [];

    if (!cities.length) {
      hideSuggestions();
      return;
    }

    elements.suggestions.innerHTML = cities
      .map(
        (city) => `
          <button class="suggestion-item" type="button" data-city="${city.name}" data-lat="${city.latitude}" data-lon="${city.longitude}">
            ${city.name}${city.country ? `, ${city.country}` : ""}
          </button>
        `
      )
      .join("");
    elements.suggestions.classList.remove("hidden");
  } catch (error) {
    hideSuggestions();
  }
}

function hideSuggestions() {
  elements.suggestions.classList.add("hidden");
  elements.suggestions.innerHTML = "";
}

async function searchCity(cityName) {
  const trimmedName = cityName.trim();
  if (!trimmedName) {
    return;
  }

  const params = new URLSearchParams({
    name: trimmedName,
    count: 1,
    language: "en",
    format: "json",
  });

  const response = await fetch(`${geocodingApiBase}?${params.toString()}`);
  if (!response.ok) {
    throw new Error("City lookup failed");
  }

  const data = await response.json();
  const location = data.results?.[0];

  if (!location) {
    throw new Error("City not found");
  }

  state.latitude = location.latitude;
  state.longitude = location.longitude;
  state.cityLabel = `${location.name}, ${location.country}`;
  state.countryLabel = location.country;

  localStorage.setItem("weather-last-city", trimmedName);
  return loadWeather();
}

function getFavorites() {
  return JSON.parse(localStorage.getItem("weather-favorites") || "[]");
}

function saveFavorites() {
  localStorage.setItem("weather-favorites", JSON.stringify(state.favorites));
}

function syncFavoriteButton() {
  const cityKey = state.cityLabel.split(",")[0].trim();
  const isFavorite = state.favorites.includes(cityKey);
  elements.favoriteBtn.textContent = isFavorite ? "★ Favorite" : "☆ Favorite";
  elements.favoriteBtn.classList.toggle("active", isFavorite);
}

function renderFavorites() {
  const favorites = getFavorites();
  state.favorites = favorites;

  if (!favorites.length) {
    elements.favorites.innerHTML = '<span class="favorite-empty">Saved cities</span>';
    return;
  }

  elements.favorites.innerHTML = favorites
    .map(
      (city) => `
        <button class="favorite-chip" type="button" data-city="${city}">${city}</button>
      `
    )
    .join("");
}

function toggleFavorite() {
  const cityKey = state.cityLabel.split(",")[0].trim();
  if (!cityKey || cityKey === "Your location") {
    return;
  }

  const favorites = [...new Set(getFavorites())];
  const index = favorites.indexOf(cityKey);
  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push(cityKey);
  }

  state.favorites = favorites;
  saveFavorites();
  renderFavorites();
  syncFavoriteButton();
}

async function fetchCityWeatherSnapshot(cityName) {
  const params = new URLSearchParams({
    name: cityName,
    count: 1,
    language: "en",
    format: "json",
  });

  const geocodeResponse = await fetch(`${geocodingApiBase}?${params.toString()}`);
  if (!geocodeResponse.ok) {
    throw new Error("City lookup failed");
  }

  const geocodeData = await geocodeResponse.json();
  const location = geocodeData.results?.[0];
  if (!location) {
    throw new Error("City not found");
  }

  const [weatherData, airData] = await Promise.all([
    fetchWeather(location.latitude, location.longitude),
    fetchAirQuality(location.latitude, location.longitude),
  ]);

  const current = weatherData.current;
  const daily = weatherData.daily || {};
  const rainChance = Math.round(daily.precipitation_probability_max?.[0] ?? current.precipitation ?? 0);
  const temp = convertTemp(current.temperature_2m);

  return {
    city: location.name,
    country: location.country || "",
    temperature: Math.round(temp),
    condition: getWeatherMeta(current.weather_code).label,
    rainChance,
    wind: Math.round(current.wind_speed_10m ?? 0),
    aqi: airData?.current?.us_aqi ?? null,
  };
}

async function refreshComparisonPanel() {
  if (!elements.comparisonList) {
    return;
  }

  try {
    const results = await Promise.all(
      state.compareCities.map(async (cityName) => {
        const snapshot = await fetchCityWeatherSnapshot(cityName);
        return snapshot;
      })
    );

    state.comparisonData = results;
    const currentTemp = state.currentWeather ? convertTemp(state.currentWeather.temperature_2m) : null;

    elements.comparisonList.innerHTML = results
      .map((city) => {
        const delta = currentTemp !== null ? city.temperature - Math.round(currentTemp) : 0;
        const deltaText = currentTemp !== null ? `${Math.abs(delta)}° ${delta >= 0 ? "warmer" : "cooler"}` : "Live compare";
        return `
          <div class="comparison-item">
            <div class="compare-header">
              <strong>${city.city}</strong>
              <span>${city.temperature}°${state.unit}</span>
            </div>
            <div class="compare-subtitle">${city.condition}</div>
            <div class="compare-metrics">
              <span>Rain ${city.rainChance}%</span>
              <span>Wind ${city.wind} km/h</span>
              <span>Air ${city.aqi !== null ? city.aqi : "N/A"}</span>
            </div>
            <div class="compare-delta">${deltaText}</div>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    elements.comparisonList.innerHTML = '<div class="compare-empty">Add a city to compare conditions.</div>';
  }
}

async function refreshLiveDashboard() {
  const [weatherData, airData] = await Promise.all([
    fetchWeather(state.latitude, state.longitude),
    fetchAirQuality(state.latitude, state.longitude),
  ]);

  state.lastWeatherFetched = Date.now();
  state.currentWeather = weatherData.current;
  renderForecasts(weatherData);
  updateCurrentWeather(weatherData, airData);
  await refreshComparisonPanel();

  if (elements.cityInput && !elements.cityInput.value.trim()) {
    elements.cityInput.value = state.cityLabel.split(",")[0];
  }

  syncFavoriteButton();
  return { weatherData, airData };
}

async function refreshLiveDashboard(force = false) {
  if (state.refreshInFlight && !force) {
    return state.refreshInFlight;
  }

  const locationKey = createLocationKey(state.latitude, state.longitude);
  const cachedEntry = !force ? weatherCache.get(locationKey) : null;

  if (cachedEntry && Date.now() - cachedEntry.timestamp < 60000) {
    const { weatherData, airData } = cachedEntry.payload;
    state.lastWeatherFetched = Date.now();
    state.currentWeather = weatherData.current;
    renderForecasts(weatherData);
    updateCurrentWeather(weatherData, airData);
    await refreshComparisonPanel();
    elements.cityInput.value = state.cityLabel.split(",")[0];
    syncFavoriteButton();
    return { weatherData, airData };
  }

  if (state.weatherAbortController) {
    state.weatherAbortController.abort();
  }

  const controller = new AbortController();
  state.weatherAbortController = controller;
  state.refreshInFlight = (async () => {
    try {
      const [weatherData, airData] = await Promise.all([
        fetchWeather(state.latitude, state.longitude, controller.signal),
        fetchAirQuality(state.latitude, state.longitude, controller.signal),
      ]);

      if (controller.signal.aborted) {
        return null;
      }

      weatherCache.set(locationKey, {
        payload: { weatherData, airData },
        timestamp: Date.now(),
      });

      state.lastWeatherFetched = Date.now();
      state.currentWeather = weatherData.current;
      renderForecasts(weatherData);
      updateCurrentWeather(weatherData, airData);
      await refreshComparisonPanel();
      elements.cityInput.value = state.cityLabel.split(",")[0];
      syncFavoriteButton();
      return { weatherData, airData };
    } catch (error) {
      if (error.name === "AbortError") {
        return null;
      }
      throw error;
    } finally {
      if (state.weatherAbortController === controller) {
        state.weatherAbortController = null;
      }
      state.refreshInFlight = false;
    }
  })();

  return state.refreshInFlight;
}

async function loadWeather() {
  try {
    await refreshLiveDashboard();
  } catch (error) {
    state.currentWeather = null;
    elements.weatherCondition.textContent = "Unable to load weather";
    elements.lastUpdated.textContent = "Live weather unavailable";
    console.error(error);
  }
}

function loadDefaultWeather() {
  state.latitude = 40.7128;
  state.longitude = -74.006;
  state.cityLabel = "New York";
  elements.cityInput.value = "New York";
  return loadWeather();
}

function useUserLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported in this browser.");
    return loadDefaultWeather();
  }

  elements.locateBtn.disabled = true;
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      state.latitude = position.coords.latitude;
      state.longitude = position.coords.longitude;
      state.cityLabel = "Your location";
      elements.cityInput.value = "";
      await loadWeather();
      elements.locateBtn.disabled = false;
    },
    async () => {
      elements.locateBtn.disabled = false;
      await loadDefaultWeather();
    }
  );
}

function handleForecastSelection(target) {
  const item = target.closest(".hourly-item");
  if (!item) return;

  state.selectedForecastIndex = Number(item.dataset.index || 0);
  document.querySelectorAll(".hourly-item").forEach((card) => {
    card.classList.toggle("selected", Number(card.dataset.index) === state.selectedForecastIndex);
  });
}

function handleSuggestionClick(event) {
  const target = event.target.closest(".suggestion-item");
  if (!target) return;

  const cityName = target.dataset.city;
  state.latitude = Number(target.dataset.lat);
  state.longitude = Number(target.dataset.lon);
  state.cityLabel = `${cityName}`;
  localStorage.setItem("weather-last-city", cityName);
  hideSuggestions();
  elements.cityInput.value = cityName;
  loadWeather();
}

function handleFavoriteChipClick(event) {
  const chip = event.target.closest(".favorite-chip");
  if (!chip) return;
  elements.cityInput.value = chip.dataset.city;
  searchCity(chip.dataset.city).catch(() => loadDefaultWeather());
}

elements.searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const searchText = elements.cityInput.value.trim();
  if (!searchText) {
    return;
  }

  try {
    await searchCity(searchText);
    hideSuggestions();
  } catch (error) {
    alert(error.message || "Please enter a valid city name.");
  }
});

elements.cityInput.addEventListener("input", () => {
  const value = elements.cityInput.value.trim();
  if (!value) {
    hideSuggestions();
    return;
  }
  window.clearTimeout(window.searchDebounceTimer);
  window.searchDebounceTimer = setTimeout(() => fetchSuggestions(value), 250);
});

elements.suggestions.addEventListener("click", handleSuggestionClick);
elements.hourlyForecast.addEventListener("click", (event) => handleForecastSelection(event.target));
elements.dailyForecast.addEventListener("click", (event) => {
  const item = event.target.closest(".daily-item");
  if (!item) return;
  document.querySelectorAll(".daily-item").forEach((card) => card.classList.toggle("selected", card === item));
});
elements.favorites.addEventListener("click", handleFavoriteChipClick);
elements.favoriteBtn.addEventListener("click", toggleFavorite);
elements.locateBtn.addEventListener("click", useUserLocation);
elements.unitButtons.forEach((button) => {
  button.addEventListener("click", () => setUnit(button.dataset.unit));
});
elements.themeButtons.forEach((button) => {
  button.addEventListener("click", () => setTheme(button.dataset.theme));
});
elements.settingButtons.forEach((button) => {
  button.addEventListener("click", () => toggleSetting(button.dataset.setting));
});
elements.sidebarToggle?.addEventListener("click", () => openSidebar("settings"));
elements.sidebarClose?.addEventListener("click", closeSidebar);
elements.sidebarTabs.forEach((button) => {
  button.addEventListener("click", () => {
    openSidebar(button.dataset.panel);
  });
});
elements.addCompareCity?.addEventListener("click", async () => {
  const value = elements.compareCityInput?.value.trim();
  if (!value) {
    return;
  }

  if (!state.compareCities.includes(value)) {
    state.compareCities.push(value);
  }

  elements.compareCityInput.value = "";
  refreshComparisonPanel();
});

elements.compareCityInput?.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    elements.addCompareCity.click();
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".suggestion-item") && !event.target.closest("#city-input")) {
    hideSuggestions();
  }
});

setTheme("default");
setUnit("C");
updateAppSettings();
bindEarthGlobeInteractions();
initMap();
renderFavorites();
renderAiReport([]);
window.setInterval(() => {
  updateLiveClock();
  if (Date.now() - (state.lastWeatherFetched || 0) > 20000) {
    runAiAssistant();
  }
}, 5000);
window.setInterval(() => {
  if (!state.appSettings.autoRefresh || document.visibilityState !== "visible") {
    return;
  }

  if (state.refreshInFlight) {
    return;
  }

  if (Date.now() - (state.lastWeatherFetched || 0) < 30000) {
    return;
  }

  const lastCityValue = localStorage.getItem("weather-last-city");
  if (lastCityValue && lastCityValue !== "Your location") {
    searchCity(lastCityValue).catch(() => loadDefaultWeather());
  } else {
    loadWeather();
  }
}, 30000);
const lastCity = localStorage.getItem("weather-last-city");
if (lastCity) {
  elements.cityInput.value = lastCity;
  searchCity(lastCity).catch(() => {
    loadDefaultWeather();
  });
} else {
  loadDefaultWeather().catch(() => {
    useUserLocation();
  });
}
