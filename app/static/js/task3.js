// Task 3: Supermarket buffer analysis
function initTask3() {
    // Clear existing features
    featureGroups.task3.clearLayers();
    
    // Center map on Stockholm
    map.setView([59.3293, 18.0686], 12);
    
    // Add loading indicator to the map
    const loadingControl = L.control({position: 'bottomleft'});
    loadingControl.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'loading-control');
        div.innerHTML = `
            <div style="background-color: white; padding: 10px; border-radius: 4px; box-shadow: 0 1px 5px rgba(0,0,0,0.4); display: flex; align-items: center;">
                <div class="loading"></div>
                <span>Loading supermarket data...</span>
            </div>
        `;
        return div;
    };
    loadingControl.addTo(map);
    
    // Load the GeoJSON data
    fetch('/static/data/supermarket.geojson')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Remove loading indicator
            map.removeControl(loadingControl);
            
            // Add supermarkets to the map
            const supermarkets = L.geoJSON(data, {
                pointToLayer: function(feature, latlng) {
                    return L.marker(latlng, {
                        title: feature.properties.name,
                        icon: L.divIcon({
                            className: 'custom-marker',
                            html: `<div style="background-color: #3498db; color: white; width: 24px; height: 24px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white;">S</div>`,
                            iconSize: [24, 24],
                            iconAnchor: [12, 12]
                        })
                    });
                },
                onEachFeature: function(feature, layer) {
                    // Add popup with supermarket name
                    layer.bindPopup(`
                        <div>
                            <h3>${feature.properties.name}</h3>
                            <p><i class="fas fa-map-marker-alt"></i> ${feature.properties.address}</p>
                        </div>
                    `);
                }
            }).addTo(featureGroups.task3);
            
            // Create buffers around supermarkets
            createBuffers(data.features);
        })
        .catch(error => {
            console.error('Error loading supermarket data:', error);
            map.removeControl(loadingControl);
            
            // Show error message
            const errorControl = L.control({position: 'bottomleft'});
            errorControl.onAdd = function(map) {
                const div = L.DomUtil.create('div', 'error-control');
                div.innerHTML = `
                    <div style="background-color: white; padding: 10px; border-radius: 4px; box-shadow: 0 1px 5px rgba(0,0,0,0.4); color: #e74c3c;">
                        <i class="fas fa-exclamation-circle"></i> Error loading supermarket data
                    </div>
                `;
                return div;
            };
            errorControl.addTo(map);
            
            // Store the error control to remove it later
            featureGroups.task3.errorControl = errorControl;
        });
}

function createBuffers(supermarkets) {
    // Create buffers for each supermarket
    const buffers = [];
    const bufferRadius = 1; // Buffer radius in kilometers
    
    supermarkets.forEach((supermarket, index) => {
        // Get coordinates
        const lng = supermarket.geometry.coordinates[0];
        const lat = supermarket.geometry.coordinates[1];
        
        // Create buffer circle (1 km radius)
        const buffer = L.circle([lat, lng], {
            radius: bufferRadius * 1000, // Convert km to meters
            color: 'blue',
            fillColor: 'blue',
            fillOpacity: 0.2,
            weight: 1
        }).addTo(featureGroups.task3);
        
        // Store supermarket info in buffer
        buffer.supermarket = supermarket;
        buffer.supermarketIndex = index;
        buffers.push(buffer);
    });
    
    // Find supermarkets that don't overlap with others
    findNonOverlappingSupermarkets(buffers);
}

function findNonOverlappingSupermarkets(buffers) {
    // Create a list of non-overlapping supermarkets
    const nonOverlapping = [];
    
    // Check each buffer against all others
    buffers.forEach((buffer1, index1) => {
        let isOverlapping = false;
        
        // Check against all other buffers
        buffers.forEach((buffer2, index2) => {
            if (index1 !== index2) {
                if (buffersOverlap(buffer1, buffer2)) {
                    isOverlapping = true;
                }
            }
        });
        
        // If this buffer doesn't overlap with any other, mark it
        if (!isOverlapping) {
            nonOverlapping.push(buffer1);
            
            // Highlight the non-overlapping buffer
            buffer1.setStyle({
                color: 'green',
                fillColor: 'green',
                fillOpacity: 0.3,
                weight: 2
            });
            
            // Update the popup to indicate non-overlapping
            const supermarket = buffer1.supermarket;
            const latlng = [supermarket.geometry.coordinates[1], supermarket.geometry.coordinates[0]];
            
            // Create a new marker with custom icon
            const marker = L.marker(latlng, {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color: green; color: white; width: 24px; height: 24px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white;">S</div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            }).addTo(featureGroups.task3);
            
            // Add popup
            marker.bindPopup(`
                <div>
                    <h3>${supermarket.properties.name}</h3>
                    <p>${supermarket.properties.address}</p>
                    <p><strong>Status:</strong> Non-overlapping with other supermarkets</p>
                </div>
            `);
        }
    });
    
    // Add a legend to explain the colors
    addBufferLegend(nonOverlapping.length);
}

function buffersOverlap(buffer1, buffer2) {
    // Get the center points of the circles
    const center1 = buffer1.getLatLng();
    const center2 = buffer2.getLatLng();
    
    // Get the radius of each circle in meters
    const radius1 = buffer1.getRadius();
    const radius2 = buffer2.getRadius();
    
    // Calculate the distance between the centers
    const distance = center1.distanceTo(center2);
    
    // If the distance is less than the sum of the radii, the circles overlap
    return distance < (radius1 + radius2);
}

function addBufferLegend(nonOverlappingCount) {
    // Create a legend control
    const legend = L.control({position: 'bottomright'});
    
    legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.backgroundColor = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';
        div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
        
        div.innerHTML = `
            <h4 style="margin-top: 0; margin-bottom: 10px;">Supermarket Buffers (1 km)</h4>
            <div style="margin-bottom: 5px;">
                <span style="display: inline-block; width: 20px; height: 20px; background-color: blue; opacity: 0.2; border: 1px solid blue; border-radius: 50%; margin-right: 5px;"></span>
                Regular supermarket buffer
            </div>
            <div>
                <span style="display: inline-block; width: 20px; height: 20px; background-color: green; opacity: 0.3; border: 1px solid green; border-radius: 50%; margin-right: 5px;"></span>
                Non-overlapping supermarket (${nonOverlappingCount} found)
            </div>
        `;
        
        return div;
    };
    
    legend.addTo(map);
    
    // Store the legend to remove it later
    featureGroups.task3.legend = legend;
    
    // Override the clearLayers method to also remove the legend
    const originalClearLayers = featureGroups.task3.clearLayers;
    featureGroups.task3.clearLayers = function() {
        if (featureGroups.task3.legend) {
            map.removeControl(featureGroups.task3.legend);
            featureGroups.task3.legend = null;
        }
        return originalClearLayers.call(this);
    };
} 