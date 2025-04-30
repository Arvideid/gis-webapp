// Task 2: Points of Interest with distance measurement
const poisData = [
    {
        name: "Vasa Museum",
        location: [59.3280, 18.0914],
        description: "Maritime museum with a preserved 17th-century ship",
        category: "Museum",
        website: "https://www.vasamuseet.se/en",
        imageUrl: "https://www.visitstockholm.com/media/images/Vasa-Museum-exterior-front.width-1280.jpg"
    },
    {
        name: "Stockholm City Hall",
        location: [59.3274, 18.0543],
        description: "The venue of the Nobel Prize banquet",
        category: "Landmark",
        website: "https://international.stockholm.se/the-city-hall/",
        imageUrl: "https://www.visitstockholm.com/media/images/5a6c2f74356a4957847c2811_20Gamla202.width-1280.jpg"
    },
    {
        name: "Royal Palace",
        location: [59.3265, 18.0718],
        description: "The official residence of the Swedish monarch",
        category: "Landmark",
        website: "https://www.kungligaslotten.se/english/royal-palaces-and-sites/the-royal-palace.html",
        imageUrl: "https://www.kungligaslotten.se/images/18.2f752b7163a2af3a9e83e7/1527582756771/KS_BB_2010-066_600x400.jpg"
    },
    {
        name: "Fotografiska",
        location: [59.3178, 18.0859],
        description: "Contemporary photography museum",
        category: "Museum",
        website: "https://www.fotografiska.com/sto/",
        imageUrl: "https://www.fotografiska.com/app/uploads/2019/09/fotografiska-stockholm-museum-photography-contemporary-art-day-view.jpg"
    },
    {
        name: "Stockholm Public Library",
        location: [59.3434, 18.0548],
        description: "Distinctive cylindrical library designed by Gunnar Asplund",
        category: "Library",
        website: "https://biblioteket.stockholm.se/",
        imageUrl: "https://www.visitstockholm.com/media/images/Stadsbiblioteket_Ingrid-Forsstro.width-1280.jpg"
    }
];

function initTask2() {
    // Clear existing features
    featureGroups.task2.clearLayers();
    
    // Center map on Stockholm
    map.setView([59.3293, 18.0686], 13);
    
    // Add PolylineMeasure control
    if (!map.polylineMeasure) {
        map.polylineMeasure = L.control.polylineMeasure({
            position: 'topleft',
            unit: 'kilometres',
            showBearings: true,
            clearMeasurementsOnStop: false,
            showClearControl: true,
            showUnitControl: true
        }).addTo(map);
    }
    
    // Add points of interest to the map
    addPointsOfInterest();
    
    // Show POI info panel
    document.getElementById('poiInfo').style.display = 'block';
    document.getElementById('poiDetails').innerHTML = '<p>Click on a location in the sidebar to see details.</p>';
    
    // Create sidebar content with POI list
    createPoiSidebar();
}

function addPointsOfInterest() {
    // Add markers for each POI
    poisData.forEach((poi, index) => {
        // Create marker
        const marker = L.marker(poi.location, {
            title: poi.name,
            icon: createColoredMarker(index)
        }).addTo(featureGroups.task2);
        
        // Add popup
        marker.bindPopup(`
            <div>
                <h3>${poi.name}</h3>
                <p>${poi.description}</p>
                <p><strong>Category:</strong> ${poi.category}</p>
                <p><a href="${poi.website}" target="_blank">Visit Website</a></p>
                <img src="${poi.imageUrl}" alt="${poi.name}">
            </div>
        `);
        
        // Store the poi data in the marker
        marker.poi = poi;
        marker.poiIndex = index;
    });
}

function createColoredMarker(index) {
    // Create a colored marker based on the index
    const colors = ['red', 'blue', 'green', 'orange', 'purple'];
    const color = colors[index % colors.length];
    
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 12px; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);">${index + 1}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
}

function createPoiSidebar() {
    // Create HTML for the sidebar with all POIs
    let html = '<h3>Stockholm Points of Interest</h3>';
    
    // Add items for each POI
    poisData.forEach((poi, index) => {
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
        const color = colors[index % colors.length];
        
        html += `
            <div class="poi-item" onclick="showPoiDetails(${index})">
                <div style="display: flex; align-items: center;">
                    <div style="background-color: ${color}; color: white; width: 24px; height: 24px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 8px; font-weight: bold;">${index + 1}</div>
                    <div>
                        <strong>${poi.name}</strong>
                        <div style="font-size: 12px; color: #666;">${poi.category}</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    // Add button to show all distances
    html += `
        <button onclick="showAllDistances()" style="margin-top: 15px;">
            <i class="fas fa-ruler"></i> Show All Distances
        </button>
    `;
    
    // Update the POI details element
    document.getElementById('poiDetails').innerHTML = html;
}

function showPoiDetails(index) {
    // Get the POI data
    const poi = poisData[index];
    
    // Create HTML for the details
    let html = `
        <div style="position: relative;">
            <button onclick="createPoiSidebar()" style="position: absolute; top: 0; right: 0; width: auto; padding: 4px 8px; background-color: transparent; color: #666;">
                <i class="fas fa-arrow-left"></i> Back
            </button>
            
            <h3>${poi.name}</h3>
            <p style="margin-bottom: 10px;">${poi.description}</p>
            
            <div style="background-color: #f5f5f5; padding: 8px; border-radius: 4px; margin-bottom: 12px;">
                <p><strong>Category:</strong> ${poi.category}</p>
                <p><a href="${poi.website}" target="_blank" style="color: #3a86ff; text-decoration: none;"><i class="fas fa-external-link-alt"></i> Visit Website</a></p>
            </div>
            
            <img src="${poi.imageUrl}" alt="${poi.name}" style="max-width: 100%; border-radius: 4px; margin: 10px 0; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
            
            <h4 style="margin: 15px 0 10px 0; display: flex; align-items: center;">
                <i class="fas fa-route" style="margin-right: 8px;"></i> Distances to other locations:
            </h4>
            <ul style="list-style-type: none; padding: 0;">
    `;
    
    // Calculate distances to other POIs
    poisData.forEach((otherPoi, otherIndex) => {
        if (otherIndex !== index) {
            const distance = calculateDistance(poi.location, otherPoi.location);
            html += `
                <li style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #eee;">
                    <div style="display: flex; justify-content: space-between;">
                        <span>${otherPoi.name}</span>
                        <strong>${distance.toFixed(2)} km</strong>
                    </div>
                </li>
            `;
        }
    });
    
    html += `</ul>`;
    
    // Update the POI details element
    document.getElementById('poiDetails').innerHTML = html;
    
    // Pan to the POI
    map.panTo(poi.location);
    
    // Find and open the popup
    featureGroups.task2.eachLayer(function(layer) {
        if (layer.poiIndex === index) {
            layer.openPopup();
        }
    });
}

function calculateDistance(point1, point2) {
    // Calculate distance between two points in kilometers
    const lat1 = point1[0];
    const lon1 = point1[1];
    const lat2 = point2[0];
    const lon2 = point2[1];
    
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    
    return distance;
}

function showAllDistances() {
    // Create a polyline for each pair of POIs
    for (let i = 0; i < poisData.length; i++) {
        for (let j = i + 1; j < poisData.length; j++) {
            // Create a polyline between the two POIs
            const line = L.polyline([poisData[i].location, poisData[j].location], {
                color: 'gray',
                weight: 2,
                opacity: 0.6,
                dashArray: '5, 10'
            }).addTo(featureGroups.task2);
            
            // Calculate the distance
            const distance = calculateDistance(poisData[i].location, poisData[j].location);
            
            // Add a tooltip with the distance
            line.bindTooltip(`${distance.toFixed(2)} km`, {
                permanent: true,
                direction: 'center',
                className: 'distance-label'
            });
        }
    }
    
    // Add CSS for the distance labels
    const style = document.createElement('style');
    style.textContent = `
        .distance-label {
            background-color: white;
            border: none;
            box-shadow: none;
            font-size: 10px;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
    
    // Disable the button
    document.querySelector('button[onclick="showAllDistances()"]').disabled = true;
} 