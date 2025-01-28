const apiKey = '5762244361a75dfaed35d733e8eaf36a'; // Replace with your OpenWeatherMap API key
const weatherInfo = document.getElementById('weatherInfo');
const forecast = document.getElementById('forecast');
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');

searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        getWeather(city);
        getForecast(city);
    }
});

cityInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value;
        if (city) {
            getWeather(city);
            getForecast(city);
        }
    }
});

async function getWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        weatherInfo.innerHTML = '<p class="text-red-500">Failed to fetch weather data. Please try again.</p>';
    }
}

async function getForecast(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        forecast.innerHTML = '<p class="text-red-500">Failed to fetch forecast data. Please try again.</p>';
    }
}

function displayWeather(data) {
    const { name, main, weather } = data;
    const html = `
        <h2 class="text-3xl font-semibold mb-4">${name}</h2>
        <div class="flex items-center justify-between">
            <div>
                <p class="text-5xl font-bold">${Math.round(main.temp)}°C</p>
                <p class="text-xl">${weather[0].description}</p>
            </div>
            <img src="http://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}" class="w-24 h-24">
        </div>
        <div class="mt-4 grid grid-cols-2 gap-4">
            <p>Feels like: ${Math.round(main.feels_like)}°C</p>
            <p>Humidity: ${main.humidity}%</p>
            <p>Min temp: ${Math.round(main.temp_min)}°C</p>
            <p>Max temp: ${Math.round(main.temp_max)}°C</p>
        </div>
    `;
    weatherInfo.innerHTML = html;
}

function displayForecast(data) {
    const dailyData = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    let html = '';
    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        html += `
            <div class="bg-white bg-opacity-20 rounded-xl p-4 text-center">
                <p class="font-semibold">${dayName}</p>
                <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}" class="w-16 h-16 mx-auto">
                <p class="text-lg font-bold">${Math.round(day.main.temp)}°C</p>
                <p class="text-sm">${day.weather[0].description}</p>
            </div>
        `;
    });
    forecast.innerHTML = html;
}

// Initial weather fetch for a default city
getWeather('London');
getForecast('London');