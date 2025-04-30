// Task 5: Marker clustering for fuel stations
function initTask5() {
    // Clear existing features
    featureGroups.task5.clearLayers();
    
    // Center map on broader Stockholm area
    map.setView([59.3293, 18.0686], 11);
    
    // Load the GeoJSON data
    fetch('/static/data/fuel.geojson')
        .then(response => response.json())
        .then(data => {
            // Add marker cluster to the map
            createMarkerCluster(data);
        })
        .catch(error => console.error('Error loading fuel station data:', error));
}

function createMarkerCluster(data) {
    // Create a marker cluster group
    const markers = L.markerClusterGroup({
        disableClusteringAtZoom: 16,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        zoomToBoundsOnClick: true,
        maxClusterRadius: 80
    });
    
    // Add markers for each fuel station
    const geoJsonLayer = L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            return createFuelStationMarker(feature, latlng);
        }
    });
    
    // Add the GeoJSON layer to the marker cluster group
    markers.addLayer(geoJsonLayer);
    
    // Add the marker cluster group to the feature group
    featureGroups.task5.addLayer(markers);
    
    // Add a legend to explain the markers
    addClusterLegend(data.features.length);
}

function createFuelStationMarker(feature, latlng) {
    // Create a custom marker for fuel stations
    const marker = L.marker(latlng, {
        icon: L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: red; color: white; width: 24px; height: 24px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white;">F</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        })
    });
    
    // Add popup with fuel station information
    marker.bindPopup(`
        <div>
            <h3>${feature.properties.name}</h3>
            <p>${feature.properties.address}</p>
            <p><strong>Type:</strong> Fuel Station</p>
        </div>
    `);
    
    return marker;
}

function addClusterLegend(stationCount) {
    // Create a legend control
    const legend = L.control({position: 'bottomright'});
    
    legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.backgroundColor = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';
        div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
        
        div.innerHTML = `
            <h4 style="margin-top: 0; margin-bottom: 10px;">Fuel Stations</h4>
            <div style="margin-bottom: 5px;">
                <span style="display: inline-block; width: 24px; height: 24px; background-color: red; color: white; border-radius: 12px; border: 2px solid white; text-align: center; line-height: 24px; font-weight: bold; margin-right: 5px;">F</span>
                Fuel station
            </div>
            <div style="margin-bottom: 5px;">
                <span style="display: inline-block; width: 30px; height: 30px; background-color: rgba(110, 204, 57, 0.9); color: white; border-radius: 15px; text-align: center; line-height: 30px; font-weight: bold; margin-right: 5px;">5</span>
                Cluster (number indicates count)
            </div>
            <p>Total stations: ${stationCount}</p>
            <p>Zoom in to see individual stations</p>
        `;
        
        return div;
    };
    
    legend.addTo(map);
    
    // Store the legend to remove it later
    featureGroups.task5.legend = legend;
    
    // Override the clearLayers method to also remove the legend
    const originalClearLayers = featureGroups.task5.clearLayers;
    featureGroups.task5.clearLayers = function() {
        if (featureGroups.task5.legend) {
            map.removeControl(featureGroups.task5.legend);
            featureGroups.task5.legend = null;
        }
        return originalClearLayers.call(this);
    };
} 