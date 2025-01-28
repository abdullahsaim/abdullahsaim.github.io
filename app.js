// app.js
const API_KEY = '5762244361a75dfaed35d733e8eaf36a';
let currentUnit = 'metric';

const elements = {
    cityInput: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    weatherCard: document.querySelector('.weather-card'),
    currentWeather: document.getElementById('currentWeather'),
    forecast: document.getElementById('forecast'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    temp: document.getElementById('temp'),
    unit: document.querySelector('.unit'),
    city: document.getElementById('city'),
    weatherCondition: document.getElementById('weatherCondition'),
    humidity: document.getElementById('humidity'),
    wind: document.getElementById('wind'),
    visibility: document.getElementById('visibility'),
    pressure: document.getElementById('pressure'),
    weatherIcon: document.getElementById('weatherIcon'),
    forecastItems: document.getElementById('forecastItems')
};

// Event Listeners
elements.searchBtn.addEventListener('click', getWeather);
elements.locationBtn.addEventListener('click', getLocationWeather);
elements.cityInput.addEventListener('keypress', (e) => e.key === 'Enter' && getWeather());

async function getWeather() {
    const city = elements.cityInput.value.trim();
    if (!city) return;

    toggleLoading(true);
    try {
        const current = await fetchData(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${currentUnit}&appid=${API_KEY}`);
        const forecast = await fetchData(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${currentUnit}&appid=${API_KEY}`);
        updateUI(current, forecast);
        updateBackground(current.weather[0].main, current.sys.sunset);
    } catch (error) {
        showError();
    }
}

async function getLocationWeather() {
    toggleLoading(true);
    try {
        const position = await getPosition();
        const current = await fetchData(`https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=${currentUnit}&appid=${API_KEY}`);
        const forecast = await fetchData(`https://api.openweathermap.org/data/2.5/forecast?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=${currentUnit}&appid=${API_KEY}`);
        updateUI(current, forecast);
        updateBackground(current.weather[0].main, current.sys.sunset);
    } catch (error) {
        showError();
    }
}

function updateUI(current, forecast) {
    // Current Weather
    elements.temp.textContent = Math.round(current.main.temp);
    elements.city.textContent = `${current.name}, ${current.sys.country}`;
    elements.weatherCondition.textContent = current.weather[0].description;
    elements.humidity.textContent = current.main.humidity;
    elements.wind.textContent = current.wind.speed;
    elements.visibility.textContent = (current.visibility / 1000).toFixed(1);
    elements.pressure.textContent = current.main.pressure;
    elements.weatherIcon.src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;

    // Forecast
    elements.forecastItems.innerHTML = forecast.list
        .filter((_, index) => index % 8 === 0)
        .slice(0, 5)
        .map(item => `
            <div class="forecast-item bg-white/10 p-3 rounded-lg flex items-center justify-between">
                <span>${new Date(item.dt * 1000).toLocaleDateString('en', {weekday: 'short'})}</span>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" class="w-10 h-10">
                <span>${Math.round(item.main.temp)}°</span>
            </div>
        `).join('');

    elements.currentWeather.classList.remove('hidden');
    elements.forecast.classList.remove('hidden');
    toggleLoading(false);
}

function updateBackground(weatherCondition, sunset) {
    const isNight = Date.now() / 1000 > sunset;
    elements.weatherCard.className = `weather-card max-w-lg w-full rounded-2xl shadow-xl overflow-hidden transition-all duration-500 ${isNight ? 'night' : weatherCondition.toLowerCase()}`;
}

// Helper Functions
async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('City not found');
    return response.json();
}

function getPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

function toggleLoading(state) {
    elements.loading.classList.toggle('hidden', !state);
    elements.currentWeather.classList.toggle('hidden', state);
    elements.forecast.classList.toggle('hidden', state);
    elements.error.classList.add('hidden');
}

function showError() {
    toggleLoading(false);
    elements.error.classList.remove('hidden');
}