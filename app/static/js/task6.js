// Task 6: Weather API
const cities = [
    { name: "Stockholm", coordinates: [59.3293, 18.0686] },
    { name: "Gothenburg", coordinates: [57.7089, 11.9746] },
    { name: "Malmö", coordinates: [55.6050, 13.0038] },
    { name: "Uppsala", coordinates: [59.8586, 17.6389] },
    { name: "Västerås", coordinates: [59.6099, 16.5448] }
];

function initTask6() {
    // Clear existing features
    featureGroups.task6.clearLayers();
    
    // Center map on Sweden
    map.setView([62.1282, 15.6435], 5);
    
    // Add weather markers for each city
    cities.forEach(city => {
        addWeatherMarker(city);
    });
    
    // Show weather info panel
    document.getElementById('weatherInfo').style.display = 'block';
    
    // Create sidebar content with city weather list
    createWeatherSidebar();
}

function addWeatherMarker(city) {
    // Create marker for city
    const marker = L.marker(city.coordinates, {
        title: city.name,
        icon: L.divIcon({
            className: 'weather-marker',
            html: `<div style="background-color: #3498db; color: white; width: 30px; height: 30px; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white;">
                <i class="fas fa-cloud"></i>
            </div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        })
    }).addTo(featureGroups.task6);
    
    // Show a loading popup initially
    marker.bindPopup(`
        <div style="text-align: center; padding: 10px;">
            <h3>${city.name}</h3>
            <div class="loading" style="display: inline-block;"></div>
            <p>Loading weather data...</p>
        </div>
    `).openPopup();
    
    // Fetch weather data for the city
    fetchWeatherData(city.name, city.coordinates)
        .then(weatherData => {
            // Store weather data in the marker
            marker.weatherData = weatherData;
            
            // Update marker popup with weather data
            marker.setPopupContent(createWeatherPopup(city.name, weatherData));
        })
        .catch(error => {
            console.error(`Error fetching weather data for ${city.name}:`, error);
            marker.setPopupContent(`
                <div>
                    <h3>${city.name}</h3>
                    <p><i class="fas fa-exclamation-circle" style="color: #e74c3c;"></i> Weather data not available.</p>
                </div>
            `);
        });
}

function fetchWeatherData(cityName, coordinates) {
    // In a real application, you would make an API call to a weather service
    // For this example, we'll simulate the API response with mock data
    
    return new Promise((resolve) => {
        // Simulate API delay
        setTimeout(() => {
            // Generate random weather data for the city
            const currentTemp = Math.floor(Math.random() * 25) - 5; // -5 to 20°C
            const conditions = ['Clear', 'Partly Cloudy', 'Cloudy', 'Rain', 'Snow'];
            const currentCondition = conditions[Math.floor(Math.random() * conditions.length)];
            const windSpeed = Math.floor(Math.random() * 30); // 0-30 km/h
            const humidity = Math.floor(Math.random() * 60) + 40; // 40-100%
            
            // Generate forecast for next 3 days
            const forecast = [];
            const today = new Date();
            
            for (let i = 1; i <= 3; i++) {
                const forecastDate = new Date(today);
                forecastDate.setDate(today.getDate() + i);
                
                forecast.push({
                    date: forecastDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                    temp: Math.floor(Math.random() * 25) - 5,
                    condition: conditions[Math.floor(Math.random() * conditions.length)]
                });
            }
            
            resolve({
                current: {
                    temp: currentTemp,
                    condition: currentCondition,
                    windSpeed: windSpeed,
                    humidity: humidity,
                    icon: getWeatherIcon(currentCondition)
                },
                forecast: forecast
            });
        }, 500);
    });
}

function getWeatherIcon(condition) {
    // Map condition to weather icon (using Font Awesome)
    switch (condition.toLowerCase()) {
        case 'clear':
            return 'fas fa-sun';
        case 'partly cloudy':
            return 'fas fa-cloud-sun';
        case 'cloudy':
            return 'fas fa-cloud';
        case 'rain':
            return 'fas fa-cloud-rain';
        case 'snow':
            return 'fas fa-snowflake';
        default:
            return 'fas fa-cloud';
    }
}

function createWeatherPopup(cityName, weatherData) {
    // Format the weather data for the popup
    const current = weatherData.current;
    
    // Create HTML content for the popup
    let html = `
        <div>
            <h3>${cityName} Weather</h3>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <i class="${current.icon}" style="font-size: 2rem; margin-right: 10px;"></i>
                <div>
                    <div style="font-size: 1.2rem; font-weight: bold;">${current.temp}°C</div>
                    <div>${current.condition}</div>
                </div>
            </div>
            <div>
                <p><strong>Wind:</strong> ${current.windSpeed} km/h</p>
                <p><strong>Humidity:</strong> ${current.humidity}%</p>
            </div>
            <h4 style="margin-top: 10px;">3-Day Forecast</h4>
            <div style="display: flex; justify-content: space-between;">
    `;
    
    // Add forecast items
    weatherData.forecast.forEach(day => {
        html += `
            <div style="text-align: center; padding: 5px;">
                <div>${day.date}</div>
                <div><i class="${getWeatherIcon(day.condition)}" style="font-size: 1.2rem;"></i></div>
                <div style="font-weight: bold;">${day.temp}°C</div>
            </div>
        `;
    });
    
    html += `
            </div>
            <p style="margin-top: 10px; font-size: 0.8rem; color: #666;">Click for detailed weather</p>
        </div>
    `;
    
    return html;
}

function createWeatherSidebar() {
    // Create HTML for the sidebar with all cities
    let html = '<h3>Weather Information</h3>';
    
    // Add items for each city
    cities.forEach((city, index) => {
        html += `
            <div class="weather-city" id="weather-city-${index}">
                <h3>${city.name}</h3>
                <div id="weather-loading-${index}">
                    <div class="loading"></div> Loading weather data...
                </div>
            </div>
        `;
    });
    
    // Update the weather details element
    document.getElementById('weatherDetails').innerHTML = html;
    
    // Fetch weather data for all cities
    cities.forEach((city, index) => {
        fetchWeatherData(city.name, city.coordinates)
            .then(weatherData => {
                updateCityWeatherInSidebar(city.name, weatherData, index);
            })
            .catch(error => {
                console.error(`Error fetching weather data for ${city.name}:`, error);
                document.getElementById(`weather-loading-${index}`).innerHTML = '<i class="fas fa-exclamation-circle" style="color: #e74c3c;"></i> Weather data not available.';
            });
    });
}

function updateCityWeatherInSidebar(cityName, weatherData, index) {
    // Format the weather data for the sidebar
    const current = weatherData.current;
    
    // Create HTML content for the city's weather
    let html = `
        <div class="weather-current">
            <i class="${current.icon}" style="font-size: 2rem; margin-right: 10px;"></i>
            <div>
                <div style="font-size: 1.2rem; font-weight: bold;">${current.temp}°C</div>
                <div>${current.condition}</div>
            </div>
        </div>
        <div>
            <p><strong>Wind:</strong> ${current.windSpeed} km/h</p>
            <p><strong>Humidity:</strong> ${current.humidity}%</p>
        </div>
        <h4 style="margin-top: 10px; margin-bottom: 5px;">3-Day Forecast</h4>
        <div style="display: flex; flex-wrap: wrap;">
    `;
    
    // Add forecast items
    weatherData.forecast.forEach(day => {
        html += `
            <div class="forecast-item">
                <div>${day.date}</div>
                <div><i class="${getWeatherIcon(day.condition)}" style="font-size: 1.2rem;"></i></div>
                <div style="font-weight: bold;">${day.temp}°C</div>
            </div>
        `;
    });
    
    html += `
        </div>
        <button onclick="panToCity(${cities[index].coordinates[0]}, ${cities[index].coordinates[1]})" style="margin-top: 10px;">Show on Map</button>
    `;
    
    // Update the city's weather element
    document.getElementById(`weather-loading-${index}`).innerHTML = html;
}

// Function to pan to a city (used in the sidebar)
function panToCity(lat, lng) {
    map.setView([lat, lng], 10);
    
    // Find and open the popup for this city
    featureGroups.task6.eachLayer(function(layer) {
        if (layer.getLatLng().lat === lat && layer.getLatLng().lng === lng) {
            layer.openPopup();
        }
    });
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