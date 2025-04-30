// Task 6: Weather information display
const cities = [
    {
        name: "Stockholm",
        location: [59.3293, 18.0686],
        municipality: "Stockholm"
    },
    {
        name: "Göteborg",
        location: [57.7089, 11.9746],
        municipality: "Göteborg"
    },
    {
        name: "Malmö",
        location: [55.6049, 13.0038],
        municipality: "Malmö"
    },
    {
        name: "Uppsala",
        location: [59.8586, 17.6389],
        municipality: "Uppsala"
    },
    {
        name: "Västerås",
        location: [59.6090, 16.5448],
        municipality: "Västerås"
    }
];

let weatherMarkers = [];
let weatherData = {};

function initTask6() {
    // Clear existing features
    featureGroups.task6.clearLayers();
    
    // Set map view to show all cities
    map.setView([59.3293, 18.0686], 6);
    
    // Create markers for each city
    createCityMarkers();
    
    // Fetch initial weather data
    fetchWeatherData();
    
    // Set up periodic updates (every 30 minutes)
    setInterval(fetchWeatherData, 30 * 60 * 1000);
    
    // Show weather info panel
    document.getElementById('weatherInfo').style.display = 'block';
    document.getElementById('weatherDetails').innerHTML = '<p>Click on a city to see weather details.</p>';
}

function createCityMarkers() {
    weatherMarkers = cities.map(city => {
        const marker = L.marker(city.location, {
            title: city.name
        }).addTo(featureGroups.task6);
        
        // Add click handler
        marker.on('click', function() {
            showWeatherDetails(city.name);
        });
        
        return marker;
    });
}

async function fetchWeatherData() {
    try {
        // Fetch weather data for each city
        for (const city of cities) {
            // First get the forecast point ID for the city's coordinates
            const pointResponse = await fetch(`https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${city.location[1]}/lat/${city.location[0]}/data.json`);
            const pointData = await pointResponse.json();
            
            // Store the weather data
            weatherData[city.name] = pointData;
            
            // Update the marker popup
            updateMarkerPopup(city.name);
        }
        
        // Update the sidebar
        updateWeatherSidebar();
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

function getCurrentWeather(data) {
    if (!data || !data.timeSeries || data.timeSeries.length === 0) {
        return null;
    }

    // Get the most recent forecast
    const currentForecast = data.timeSeries[0];
    const parameters = currentForecast.parameters;

    // Extract relevant weather data
    const temperature = parameters.find(p => p.name === 't')?.values[0];
    const weatherSymbol = parameters.find(p => p.name === 'Wsymb2')?.values[0];
    const windSpeed = parameters.find(p => p.name === 'ws')?.values[0];
    const humidity = parameters.find(p => p.name === 'r')?.values[0];

    return {
        temperature: temperature,
        weatherSymbol: weatherSymbol,
        windSpeed: windSpeed,
        humidity: humidity,
        validTime: currentForecast.validTime
    };
}

function getWeatherIcon(weatherSymbol) {
    // Map SMHI weather symbols to Font Awesome icons
    const iconMap = {
        1: 'fas fa-sun',           // Clear sky
        2: 'fas fa-cloud-sun',     // Nearly clear sky
        3: 'fas fa-cloud',         // Variable cloudiness
        4: 'fas fa-cloud',         // Halfclear sky
        5: 'fas fa-cloud',         // Cloudy sky
        6: 'fas fa-cloud',         // Overcast
        7: 'fas fa-fog',           // Fog
        8: 'fas fa-cloud-rain',    // Light rain showers
        9: 'fas fa-cloud-rain',    // Moderate rain showers
        10: 'fas fa-cloud-rain',   // Heavy rain showers
        11: 'fas fa-bolt',         // Thunderstorm
        12: 'fas fa-cloud-sun-rain', // Light sleet showers
        13: 'fas fa-cloud-sun-rain', // Moderate sleet showers
        14: 'fas fa-cloud-sun-rain', // Heavy sleet showers
        15: 'fas fa-snowflake',    // Light snow showers
        16: 'fas fa-snowflake',    // Moderate snow showers
        17: 'fas fa-snowflake',    // Heavy snow showers
        18: 'fas fa-cloud-rain',   // Light rain
        19: 'fas fa-cloud-rain',   // Moderate rain
        20: 'fas fa-cloud-rain',   // Heavy rain
        21: 'fas fa-bolt',         // Thunder
        22: 'fas fa-cloud-sun-rain', // Light sleet
        23: 'fas fa-cloud-sun-rain', // Moderate sleet
        24: 'fas fa-cloud-sun-rain', // Heavy sleet
        25: 'fas fa-snowflake',    // Light snowfall
        26: 'fas fa-snowflake',    // Moderate snowfall
        27: 'fas fa-snowflake'     // Heavy snowfall
    };

    return iconMap[weatherSymbol] || 'fas fa-cloud';
}

function updateMarkerPopup(cityName) {
    const city = cities.find(c => c.name === cityName);
    const marker = weatherMarkers[cities.indexOf(city)];
    const data = weatherData[cityName];
    const currentWeather = getCurrentWeather(data);
    
    let popupContent = `<h3 style="margin: 0 0 10px 0; color: #2c3e50;">${cityName}</h3>`;
    
    if (currentWeather) {
        const icon = getWeatherIcon(currentWeather.weatherSymbol);
        popupContent += `
            <div class="weather-info" style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <i class="${icon}" style="font-size: 2.5rem; margin-right: 15px; color: #3498db;"></i>
                    <div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: #2c3e50;">${Math.round(currentWeather.temperature)}°C</div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div style="background-color: white; padding: 8px; border-radius: 6px; text-align: center;">
                        <i class="fas fa-wind" style="color: #7f8c8d;"></i>
                        <p style="margin: 5px 0 0 0; font-size: 0.9rem;">${Math.round(currentWeather.windSpeed)} m/s</p>
                    </div>
                    <div style="background-color: white; padding: 8px; border-radius: 6px; text-align: center;">
                        <i class="fas fa-tint" style="color: #3498db;"></i>
                        <p style="margin: 5px 0 0 0; font-size: 0.9rem;">${Math.round(currentWeather.humidity)}%</p>
                    </div>
                </div>
                <p style="font-size: 0.8rem; color: #7f8c8d; margin: 10px 0 0 0;">Updated: ${new Date(currentWeather.validTime).toLocaleString()}</p>
            </div>
        `;
    } else {
        popupContent += '<p style="color: #e74c3c;">Weather data not available</p>';
    }
    
    marker.bindPopup(popupContent);
}

function updateWeatherSidebar() {
    let html = '<h3 style="color: #2c3e50; margin-bottom: 15px;">Weather Information</h3>';
    
    cities.forEach(city => {
        const data = weatherData[city.name];
        const currentWeather = getCurrentWeather(data);
        
        html += `
            <div class="city-weather" onclick="showWeatherDetails('${city.name}')" 
                 style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 10px; cursor: pointer; transition: all 0.3s ease;"
                 onmouseover="this.style.backgroundColor='#e9ecef'" 
                 onmouseout="this.style.backgroundColor='#f8f9fa'">
                <h4 style="margin: 0 0 10px 0; color: #2c3e50;">${city.name}</h4>
                ${currentWeather ? `
                    <div style="display: flex; align-items: center;">
                        <i class="${getWeatherIcon(currentWeather.weatherSymbol)}" style="font-size: 1.5rem; margin-right: 15px; color: #3498db;"></i>
                        <div>
                            <p style="margin: 0; font-size: 1.2rem; font-weight: bold; color: #2c3e50;">${Math.round(currentWeather.temperature)}°C</p>
                            <div style="display: flex; gap: 15px; margin-top: 5px;">
                                <span style="color: #7f8c8d;"><i class="fas fa-wind"></i> ${Math.round(currentWeather.windSpeed)} m/s</span>
                                <span style="color: #7f8c8d;"><i class="fas fa-tint"></i> ${Math.round(currentWeather.humidity)}%</span>
                            </div>
                        </div>
                    </div>
                ` : '<p style="color: #e74c3c;">Weather data not available</p>'}
            </div>
        `;
    });
    
    document.getElementById('weatherDetails').innerHTML = html;
}

function showWeatherDetails(cityName) {
    const city = cities.find(c => c.name === cityName);
    const data = weatherData[cityName];
    const currentWeather = getCurrentWeather(data);
    
    let html = `
        <div style="position: relative;">
            <button onclick="updateWeatherSidebar()" 
                    style="background: none; border: none; color: #7f8c8d; cursor: pointer; padding: 5px; margin-bottom: 15px;"
                    onmouseover="this.style.color='#2c3e50'"
                    onmouseout="this.style.color='#7f8c8d'">
                <i class="fas fa-arrow-left"></i> Back to all cities
            </button>
            
            <h3 style="margin: 0 0 20px 0; color: #2c3e50;">${cityName}</h3>
    `;
    
    if (currentWeather) {
        const icon = getWeatherIcon(currentWeather.weatherSymbol);
        html += `
            <div class="weather-details" style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; margin-bottom: 25px;">
                    <i class="${icon}" style="font-size: 4rem; margin-right: 20px; color: #3498db;"></i>
                    <div style="font-size: 3rem; font-weight: bold; color: #2c3e50;">${Math.round(currentWeather.temperature)}°C</div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="background-color: white; padding: 15px; border-radius: 8px; text-align: center;">
                        <i class="fas fa-wind" style="font-size: 1.5rem; color: #7f8c8d;"></i>
                        <p style="margin: 10px 0 0 0; font-size: 1.2rem; color: #2c3e50;">${Math.round(currentWeather.windSpeed)} m/s</p>
                        <p style="margin: 5px 0 0 0; font-size: 0.9rem; color: #7f8c8d;">Wind Speed</p>
                    </div>
                    <div style="background-color: white; padding: 15px; border-radius: 8px; text-align: center;">
                        <i class="fas fa-tint" style="font-size: 1.5rem; color: #3498db;"></i>
                        <p style="margin: 10px 0 0 0; font-size: 1.2rem; color: #2c3e50;">${Math.round(currentWeather.humidity)}%</p>
                        <p style="margin: 5px 0 0 0; font-size: 0.9rem; color: #7f8c8d;">Humidity</p>
                    </div>
                </div>
                
                <div style="background-color: white; padding: 15px; border-radius: 8px; text-align: center;">
                    <i class="fas fa-clock" style="color: #7f8c8d;"></i>
                    <p style="margin: 10px 0 0 0; color: #2c3e50;">Last Updated: ${new Date(currentWeather.validTime).toLocaleString()}</p>
                </div>
            </div>
        `;
    } else {
        html += '<p style="color: #e74c3c;">Weather data not available</p>';
    }
    
    document.getElementById('weatherDetails').innerHTML = html;
    
    // Pan to the city
    map.panTo(city.location);
    
    // Open the popup
    const marker = weatherMarkers[cities.indexOf(city)];
    marker.openPopup();
}

// Add Font Awesome to the page (for weather icons)
document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('font-awesome')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.id = 'font-awesome';
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }
}); 