// Task 1: Create point, line, and polygon features
let drawingMode = null;
let drawingPoints = [];
let activeDrawButton = null; // Keep track of the active button element
let temporaryLayer = null; // Store the temporary line/polygon layer
const FINISH_THRESHOLD = 20; // Pixel distance threshold to finish drawing (Increased from 10)

function initTask1() {
    // Clear existing features
    featureGroups.task1.clearLayers();
    
    // Set map view to a nice area in Sweden (Stockholm)
    map.setView([59.3293, 18.0686], 12);
    
    // Add drawing controls to the map
    addDrawingControls();
}

function addDrawingControls() {
    // Create a custom control for drawing
    const drawingControl = L.control({position: 'topright'});
    
    drawingControl.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'leaflet-control leaflet-bar draw-controls'); // Added class for styling
        div.style.backgroundColor = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '4px';
        div.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)';
        
        // Prevent clicks inside the control from propagating to the map
        L.DomEvent.disableClickPropagation(div);
        L.DomEvent.on(div, 'mousedown', L.DomEvent.stopPropagation); // Also stop mousedown

        div.innerHTML = `
            <h4 style="margin-top: 0; margin-bottom: 10px;">Draw Features</h4>
            <button id="drawPointBtn" class="draw-btn" style="margin-bottom: 5px; width: 100%;">Draw Point</button>
            <button id="drawLineBtn" class="draw-btn" style="margin-bottom: 5px; width: 100%;">Draw Line</button>
            <button id="drawPolygonBtn" class="draw-btn" style="margin-bottom: 5px; width: 100%;">Draw Polygon</button>
            <div id="drawStatus" style="margin-top: 8px; font-size: 0.9em; color: #555;"></div> 
        `; // Removed cancel button, added status div
        
        return div;
    };
    
    drawingControl.addTo(map);
    
    // Add event listeners for the drawing buttons AFTER the control is added
    setTimeout(() => { // Use setTimeout to ensure elements exist
        const drawPointBtn = document.getElementById('drawPointBtn');
        const drawLineBtn = document.getElementById('drawLineBtn');
        const drawPolygonBtn = document.getElementById('drawPolygonBtn');

        if (drawPointBtn) {
            drawPointBtn.addEventListener('click', function(event) {
                // event.stopPropagation(); // Handled by L.DomEvent.disableClickPropagation
                startDrawing('point', this); // Pass button element
            });
        }
        if (drawLineBtn) {
            drawLineBtn.addEventListener('click', function(event) {
                // event.stopPropagation();
                startDrawing('line', this);
            });
        }
        if (drawPolygonBtn) {
            drawPolygonBtn.addEventListener('click', function(event) {
                // event.stopPropagation();
                startDrawing('polygon', this);
            });
        }
        
        // Add click event listener to the map for drawing
        // Make sure this listener isn't added multiple times if initTask1 runs again
        map.off('click', onMapClick).on('click', onMapClick); 
    }, 0);

    // Store the control to potentially remove it later if needed
    featureGroups.task1.drawingControl = drawingControl;
}

function updateDrawStatus(message) {
    const statusDiv = document.getElementById('drawStatus');
    if (statusDiv) {
        statusDiv.textContent = message;
    }
}

function startDrawing(mode, buttonElement) {
    // If a mode is already active, cancel it first
    if (drawingMode) {
        cancelDrawing(false); // Don't reset status message yet
    }

    drawingMode = mode;
    drawingPoints = [];
    activeDrawButton = buttonElement; // Store the clicked button
    temporaryLayer = null; // Reset temporary layer

    // Highlight the active button
    if (activeDrawButton) {
        activeDrawButton.style.backgroundColor = '#dcdcdc'; // Simple highlight
        activeDrawButton.style.fontWeight = 'bold';
    }
    
    // Change cursor style
    L.DomUtil.addClass(map._container, 'leaflet-crosshair'); // Use Leaflet's class

    // Add mouse move listener for rubber-banding (only for line/polygon)
    if (mode === 'line' || mode === 'polygon') {
        map.on('mousemove', onMapMouseMove);
    }

    // Update status message
    let message = '';
    switch (mode) {
        case 'point':
            message = 'Click map to place point.';
            break;
        case 'line':
            message = 'Click map to add vertex. Click near last point to finish.';
            break;
        case 'polygon':
            // For polygon, finishing requires clicking the *first* point usually,
            // but clicking last is simpler to implement for now.
            message = 'Click map to add vertex. Click near last point to finish.'; 
            break;
    }
    updateDrawStatus(message);
}

function cancelDrawing(resetStatus = true) { 
    // Remove highlight from the active button
    if (activeDrawButton) {
        activeDrawButton.style.backgroundColor = ''; 
        activeDrawButton.style.fontWeight = '';
    }

    // Remove temporary features if any
    removeTemporaryFeature();

    // Remove mouse move listener
    map.off('mousemove', onMapMouseMove);

    drawingMode = null;
    drawingPoints = [];
    activeDrawButton = null;
    temporaryLayer = null;
    
    // Reset cursor style
    L.DomUtil.removeClass(map._container, 'leaflet-crosshair');
    
    // Clear status message if requested
    if (resetStatus) {
        updateDrawStatus('');
    }
}

function onMapMouseMove(e) {
    if (!drawingMode || drawingPoints.length === 0) return;

    const currentLatLng = e.latlng;
    let previewPoints = [...drawingPoints, currentLatLng];

    // Remove existing temporary feature first
    removeTemporaryFeature();

    // Create temporary feature based on current drawing mode
    if (drawingMode === 'line' && previewPoints.length >= 2) {
        temporaryLayer = L.polyline(previewPoints, {
            color: 'blue',
            weight: 3,
            opacity: 0.7,
            dashArray: '5, 5', // Dashed line for temporary
            interactive: false // Make temporary layer non-interactive
        }).addTo(featureGroups.task1);
    } else if (drawingMode === 'polygon' && previewPoints.length >= 3) {
        temporaryLayer = L.polygon(previewPoints, {
            color: 'green',
            fillColor: 'green',
            fillOpacity: 0.3,
            weight: 2,
            dashArray: '5, 5', // Dashed line for temporary
            interactive: false // Make temporary layer non-interactive
        }).addTo(featureGroups.task1);
    }
}

function onMapClick(e) {
    if (!drawingMode) return;
    
    const clickedLatLng = e.latlng;

    if (drawingMode === 'point') {
        createPointFeature(clickedLatLng);
        cancelDrawing(); // Reset drawing mode after placing point
        return; // Exit early for point mode
    }

    // --- Check for finishing click (line/polygon) ---
    if (drawingPoints.length > 0) {
        const lastPoint = drawingPoints[drawingPoints.length - 1];
        const dist = map.latLngToContainerPoint(lastPoint).distanceTo(map.latLngToContainerPoint(clickedLatLng));

        if (dist < FINISH_THRESHOLD) {
            // Finish drawing if click is close to the last point
            if (drawingMode === 'line' && drawingPoints.length >= 2) {
                createLineFeature(drawingPoints);
            } else if (drawingMode === 'polygon' && drawingPoints.length >= 3) {
                createPolygonFeature(drawingPoints);
            }
            cancelDrawing();
            return; // Finished, exit
        }
    }
    
    // --- Add vertex ---
    drawingPoints.push(clickedLatLng);
    
    // Update temporary feature visualization (snapped to clicks, mousemove handles rubber-band)
    updateTemporaryFeatureOnClick(); 
}

function updateTemporaryFeatureOnClick() {
    removeTemporaryFeature(); // Clear previous temporary layer (including rubber-band)

    if (drawingMode === 'line' && drawingPoints.length >= 2) {
        temporaryLayer = L.polyline(drawingPoints, {
            color: 'blue', weight: 3, opacity: 0.7, dashArray: '5, 5', interactive: false
        }).addTo(featureGroups.task1);
    } else if (drawingMode === 'polygon' && drawingPoints.length >= 3) {
        temporaryLayer = L.polygon(drawingPoints, {
            color: 'green', fillColor: 'green', fillOpacity: 0.3, weight: 2, dashArray: '5, 5', interactive: false
        }).addTo(featureGroups.task1);
    }
    // Immediately trigger mousemove to show rubber-banding from the new point
    // This might need adjustment if a 'mouseidle' or similar event is better
    // map.fire('mousemove', { latlng: drawingPoints[drawingPoints.length - 1] }); 
}

function removeTemporaryFeature() {
    if (temporaryLayer) {
        featureGroups.task1.removeLayer(temporaryLayer);
        temporaryLayer = null;
    }
}

function createPointFeature(latlng) {
    // No temporary feature for points
    // Create a marker with popup
    const marker = L.marker(latlng).addTo(featureGroups.task1);
    
    // Add popup with form to add information
    marker.bindPopup(createFeaturePopupContent('point')).openPopup();
}

function createLineFeature(points) {
    // Remove final temporary feature before creating permanent one
    removeTemporaryFeature(); 
    // Create a polyline with popup
    const line = L.polyline(points, {
        color: 'blue',
        weight: 3
    }).addTo(featureGroups.task1);
    
    // Add popup with form to add information
    line.bindPopup(createFeaturePopupContent('line')).openPopup();
}

function createPolygonFeature(points) {
    // Remove final temporary feature before creating permanent one
    removeTemporaryFeature();
    // Create a polygon with popup
    const polygon = L.polygon(points, {
        color: 'green',
        fillColor: 'green',
        fillOpacity: 0.3,
        weight: 2
    }).addTo(featureGroups.task1);
    
    // Add popup with form to add information
    polygon.bindPopup(createFeaturePopupContent('polygon')).openPopup();
}

function createFeaturePopupContent(featureType) {
    // Create popup content with form to add information
    const content = `
        <h3>Add Information</h3>
        <form id="featureInfoForm">
            <div style="margin-bottom: 10px;">
                <label for="featureName">Name:</label>
                <input type="text" id="featureName" name="name" style="width: 100%;">
            </div>
            <div style="margin-bottom: 10px;">
                <label for="featureDescription">Description:</label>
                <textarea id="featureDescription" name="description" style="width: 100%; height: 60px;"></textarea>
            </div>
            <div style="margin-bottom: 10px;">
                <label for="featureImage">Image URL:</label>
                <input type="text" id="featureImage" name="image" style="width: 100%;" value="https://www.visitstockholm.com/media/images/5a6c2f74356a4957847c2811_20Gamla202.width-1280.jpg">
            </div>
            <button type="button" onclick="saveFeatureInfo('${featureType}', this)">Save</button>
        </form>
    `;
    
    return content;
}

function saveFeatureInfo(featureType, button) {
    // Get form data
    const name = document.getElementById('featureName').value || 'Unnamed Feature';
    const description = document.getElementById('featureDescription').value || 'No description provided.';
    const imageUrl = document.getElementById('featureImage').value || '';
    
    // Create content for the popup
    const content = `
        <div>
            <h3>${name}</h3>
            <p>${description}</p>
            <p><strong>Type:</strong> ${featureType.charAt(0).toUpperCase() + featureType.slice(1)}</p>
            ${imageUrl ? `<img src="${imageUrl}" alt="${name}">` : ''}
        </div>
    `;
    
    // Update popup content
    const popup = button.closest('.leaflet-popup');
    const leafletId = popup._source._leaflet_id;
    
    // Find the feature and update its popup
    featureGroups.task1.eachLayer(function(layer) {
        if (layer._leaflet_id === leafletId) {
            layer.setPopupContent(content);
            layer.feature = {
                properties: {
                    name: name,
                    description: description,
                    featureType: featureType,
                    imageUrl: imageUrl
                }
            };
        }
    });
    
    // Close the popup
    map.closePopup();
}

// Add a cleanup function for when task1 is deactivated
function cleanupTask1() {
    cancelDrawing(); // Cancel any active drawing
    map.off('click', onMapClick); // Remove map listeners
    map.off('mousemove', onMapMouseMove); // Remove mousemove listener

    // Remove the drawing control if it exists
    if (featureGroups.task1.drawingControl) {
        map.removeControl(featureGroups.task1.drawingControl);
        featureGroups.task1.drawingControl = null;
    }
    
    // Optional: Clear features drawn in this session? 
    // featureGroups.task1.clearLayers(); // Uncomment if desired
}

// --- Make cancelDrawing globally accessible (or provide a wrapper) ---
// This allows map.js to call it. A cleaner approach might be needed for larger apps.
window.cancelTask1Drawing = cancelDrawing; 