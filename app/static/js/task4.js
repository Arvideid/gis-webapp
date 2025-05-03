// Task 4: Image overlay
function initTask4() {
    // Clear existing features
    featureGroups.task4.clearLayers();
    
    // Center map on Stockholm Old Town (Gamla Stan)
    map.setView([59.3255, 18.0732], 16);
    
    // Create image overlay for Old Town area
    createImageOverlay();
    
    // Add information marker
    addInformationMarker();
}

function createImageOverlay() {
    // Define the source projection (EPSG:3857)
    const proj3857 = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs';

    // Define corner coordinates in EPSG:3857 (Meters)
    // Bottom-Left: X = 2010416.1453, Y = 8250153.2543
    // Top-Right:   X = 2012376.9754, Y = 8251711.8471
    const bottomLeftMeters = [2010416.1453, 8250153.2543];
    const topRightMeters = [2012376.9754, 8251711.8471];

    // Define the target projection (EPSG:4326 - Lat/Lon)
    // proj4js uses 'WGS84' as the alias for EPSG:4326
    const proj4326 = 'WGS84';

    // Convert coordinates
    // proj4(fromProj, toProj, [longitude, latitude]) -> [longitude, latitude]
    const bottomLeftLatLng = proj4(proj3857, proj4326, bottomLeftMeters);
    const topRightLatLng = proj4(proj3857, proj4326, topRightMeters);

    // Create Leaflet LatLngBounds (requires [Latitude, Longitude] format)
    const bounds = L.latLngBounds(
        [bottomLeftLatLng[1], bottomLeftLatLng[0]], // Southwest corner (Lat, Lon)
        [topRightLatLng[1], topRightLatLng[0]]  // Northeast corner (Lat, Lon)
    );

    // Image URL
    const imageUrl = '/static/img/image2.png'; // Use the path to your warped image
    
    // Create an image overlay
    const overlay = L.imageOverlay(imageUrl, bounds, {
        opacity: 0.7,
        interactive: true
    }).addTo(featureGroups.task4);
    
    // Add a popup to the overlay
    overlay.bindPopup(`
        <div>
            <h3>Gamla Stan (Old Town)</h3>
            <p>Historic center of Stockholm dating back to the 13th century.</p>
            <p>This overlay shows a topographic map of the Old Town.</p>
        </div>
    `);
    
    // Add controls to adjust opacity
    addOpacityControl(overlay);
}

function addOpacityControl(overlay) {
    // Create a custom control for opacity adjustment
    const opacityControl = L.control({position: 'topright'});
    
    opacityControl.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'opacity-control');
        div.style.backgroundColor = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '4px';
        div.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)';
        
        div.innerHTML = `
            <h4 style="margin-top: 0; margin-bottom: 10px;">Image Overlay Controls</h4>
            <div style="margin-bottom: 10px;">
                <label for="opacitySlider">Opacity: <span id="opacityValue">70%</span></label>
                <input type="range" id="opacitySlider" min="0" max="100" value="70" style="width: 100%;">
            </div>
        `;
        
        // Prevent map panning when interacting with the control
        L.DomEvent.disableClickPropagation(div);
        L.DomEvent.disableScrollPropagation(div); // Also good for touch devices
        
        return div;
    };
    
    opacityControl.addTo(map);
    
    // Store the control to remove it later
    featureGroups.task4.opacityControl = opacityControl;
    
    // Add event listeners for the opacity slider
    setTimeout(() => {
        const slider = document.getElementById('opacitySlider');
        const opacityValue = document.getElementById('opacityValue');
        
        if (slider && opacityValue) {
            slider.addEventListener('input', function() {
                const opacity = this.value / 100;
                overlay.setOpacity(opacity);
                opacityValue.textContent = this.value + '%';
            });
        }
    }, 100);
    
    // Override the clearLayers method to also remove the control
    const originalClearLayers = featureGroups.task4.clearLayers;
    featureGroups.task4.clearLayers = function() {
        if (featureGroups.task4.opacityControl) {
            map.removeControl(featureGroups.task4.opacityControl);
            featureGroups.task4.opacityControl = null;
        }
        return originalClearLayers.call(this);
    };
}

function addInformationMarker() {
    // Add a marker with information about Gamla Stan
    const marker = L.marker([59.3255, 18.0732]).addTo(featureGroups.task4);
    
    // Add popup with information
    marker.bindPopup(`
        <div>
            <h3>Gamla Stan (Old Town)</h3>
            <p>The Old Town in Stockholm dates back to the 13th century and consists of medieval alleyways, cobbled streets, and archaic architecture.</p>
            <p>Highlights include:</p>
            <ul>
                <li>Stockholm Cathedral</li>
                <li>The Royal Palace</li>
                <li>Stortorget (The Great Square)</li>
                <li>The Nobel Museum</li>
            </ul>
        </div>
    `, { maxWidth: 300 });
} 