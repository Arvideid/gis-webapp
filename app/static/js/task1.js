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
    map.setView([59.32701516267492, 18.070441535091387], 15);
    
    // Add drawing controls to the map
    addDrawingControls();
    
    // Add example features
    addExampleFeatures();
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
    L.marker(latlng).addTo(featureGroups.task1);
}

function createLineFeature(points) {
    // Remove final temporary feature before creating permanent one
    removeTemporaryFeature(); 
    // Create a polyline with popup
    L.polyline(points, {
        color: 'blue',
        weight: 3
    }).addTo(featureGroups.task1);
}

function createPolygonFeature(points) {
    // Remove final temporary feature before creating permanent one
    removeTemporaryFeature();
    // Create a polygon with popup
    L.polygon(points, {
        color: 'green',
        fillColor: 'green',
        fillOpacity: 0.3,
        weight: 2    }).addTo(featureGroups.task1);
}

function addExampleFeatures() {
    // Add example point
    const pointMarker = L.marker([
      59.327257006591935, 18.056057195180514,
    ]).addTo(featureGroups.task1);
    pointMarker.bindPopup(`
        <div>
            <h3>Stockholm City Hall</h3>
            <p>The Stockholm City Hall is the building of the Municipal Council for the City of Stockholm in Sweden.</p>
            <p><strong>Type:</strong> Point</p>
            <img src="/static/img/stockholm-townhall.jpg" alt="Stockholm City Hall">
        </div>
    `);
    pointMarker.feature = {
        properties: {
            name: "Stockholm City Hall",
            description: "The Stockholm City Hall is the building of the Municipal Council for the City of Stockholm in Sweden.",
            featureType: "point",
            imageUrl: "/static/img/stockholm-townhall.jpg"
        }
    };
    
    // Add example line (road)
    const linePath = [
      [59.32797967774246, 18.078080427656552],
      [59.326752959515694, 18.080096888166718]
    ];
    const line = L.polyline(linePath, {
        color: 'blue',
        weight: 3
    }).addTo(featureGroups.task1);
    line.bindPopup(`
        <div>
            <h3>Skeppsholmsbron</h3>
            <p>A prestigious bridge in central Stockholm, Sweden.</p>
            <p><strong>Type:</strong> Line</p>
            <img src="/static/img/skeppsholmsbron.jpg" alt="Skeppsholmsbron">
        </div>
    `);
    line.feature = {
      properties: {
        name: "Skeppsholmsbron",
        description: "A prestigious bridge in central Stockholm, Sweden.",
        featureType: "line",
        imageUrl: "/static/img/skeppsholmsbron.jpg",
      },
    };
    
    // Add example polygon (park)
    const polygonCoords = [
      [59.33257509653534, 18.06997487467091],
      [59.33265471616599, 18.071613930793067],
      [59.329725728336214, 18.073219536857412],
      [59.32954372464613, 18.07177003144326],
    ];
    const polygon = L.polygon(polygonCoords, {
        color: 'green',
        fillColor: 'green',
        fillOpacity: 0.3,
        weight: 2
    }).addTo(featureGroups.task1);
    polygon.bindPopup(`
        <div>
            <h3>Kungsträdgården</h3>
            <p>A park in central Stockholm, Sweden.</p>
            <p><strong>Type:</strong> Polygon</p>
            <img src="/static/img/kungsträdgården.jpg" alt="Kungsträdgården">
        </div>
    `);
    polygon.feature = {
      properties: {
        name: "Kungsträdgården",
        description: "A park in central Stockholm, Sweden.",
        featureType: "polygon",
        imageUrl: "/static/img/kungsträdgården.jpg",
      },
    };
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