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
    // Define the bounds of the image (Gamla Stan area in Stockholm)
    const bounds = L.latLngBounds(
        [59.3237, 18.0680], // Southwest corner
        [59.3275, 18.0775]  // Northeast corner
    );
    
    // Create an image overlay
    const imageUrl = 'https://media.istockphoto.com/id/901375406/vector/gamla-stan-old-town-in-stockholm-topographic-map.jpg?s=612x612&w=0&k=20&c=sPUtW8lqNG-GYVX_sTZAjGa38hg6bBRj5YOl7zplhMI=';
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
            <button id="toggleOverlayBtn">Toggle Overlay</button>
        `;
        
        return div;
    };
    
    opacityControl.addTo(map);
    
    // Store the control to remove it later
    featureGroups.task4.opacityControl = opacityControl;
    
    // Add event listeners for the opacity slider
    setTimeout(() => {
        const slider = document.getElementById('opacitySlider');
        const opacityValue = document.getElementById('opacityValue');
        const toggleBtn = document.getElementById('toggleOverlayBtn');
        
        if (slider && opacityValue && toggleBtn) {
            slider.addEventListener('input', function() {
                const opacity = this.value / 100;
                overlay.setOpacity(opacity);
                opacityValue.textContent = this.value + '%';
            });
            
            toggleBtn.addEventListener('click', function() {
                if (map.hasLayer(overlay)) {
                    map.removeLayer(overlay);
                    this.textContent = 'Show Overlay';
                } else {
                    overlay.addTo(featureGroups.task4);
                    this.textContent = 'Hide Overlay';
                }
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
            <img src="https://www.visitstockholm.com/media/images/5a6c2f74356a4957847c2811_20Gamla202.width-1280.jpg" alt="Gamla Stan" style="max-width: 100%;">
        </div>
    `, { maxWidth: 300 });
} 