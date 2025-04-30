// Initialize the map
let map;
let featureGroups = {};
let currentTask = null;
let sidebarCollapsed = false;

document.addEventListener('DOMContentLoaded', function() {
    initMap();
    setupEventListeners();
    setupSidebarToggle();
});

function initMap() {
    // Create map centered on Sweden
    map = L.map('map', {
        zoomControl: false,  // We'll add zoom control manually to position it better
        minZoom: 5,
        maxZoom: 18
    }).setView([59.3293, 18.0686], 6); // Stockholm coordinates

    // Add tile layer (base map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Add zoom control to bottom right
    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);

    // Initialize feature groups for different tasks
    featureGroups = {
        task1: L.featureGroup().addTo(map),
        task2: L.featureGroup().addTo(map),
        task3: L.featureGroup().addTo(map),
        task4: L.featureGroup().addTo(map),
        task5: L.layerGroup().addTo(map),
        task6: L.featureGroup().addTo(map),
        task7: L.featureGroup().addTo(map)
    };

    // Hide all feature groups initially
    resetMap();
}

function setupEventListeners() {
    // Task buttons click handlers
    document.getElementById('task1Btn').addEventListener('click', function() {
        resetActiveTasks();
        showFeatureGroup('task1');
        highlightActiveButton('task1Btn');
        currentTask = 'task1';
        initTask1();
        if (window.innerWidth <= 768 && !sidebarCollapsed) {
            toggleSidebar();
        }
    });

    document.getElementById('task2Btn').addEventListener('click', function() {
        resetActiveTasks();
        showFeatureGroup('task2');
        highlightActiveButton('task2Btn');
        currentTask = 'task2';
        initTask2();
    });

    document.getElementById('task3Btn').addEventListener('click', function() {
        resetActiveTasks();
        showFeatureGroup('task3');
        highlightActiveButton('task3Btn');
        currentTask = 'task3';
        initTask3();
    });

    document.getElementById('task4Btn').addEventListener('click', function() {
        resetActiveTasks();
        showFeatureGroup('task4');
        highlightActiveButton('task4Btn');
        currentTask = 'task4';
        initTask4();
    });

    document.getElementById('task5Btn').addEventListener('click', function() {
        resetActiveTasks();
        showFeatureGroup('task5');
        highlightActiveButton('task5Btn');
        currentTask = 'task5';
        initTask5();
    });

    document.getElementById('task6Btn').addEventListener('click', function() {
        resetActiveTasks();
        showFeatureGroup('task6');
        highlightActiveButton('task6Btn');
        currentTask = 'task6';
        initTask6();
    });

    document.getElementById('task7Btn').addEventListener('click', function() {
        resetActiveTasks();
        showFeatureGroup('task7');
        highlightActiveButton('task7Btn');
        currentTask = 'task7';
        initTask7();
    });

    document.getElementById('resetBtn').addEventListener('click', function() {
        resetMap();
        removeActiveButtonHighlight();
    });
    
    // Handle map resize when window is resized
    window.addEventListener('resize', function() {
        map.invalidateSize();
    });
}

function setupSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const togglerContainer = document.getElementById('toggler');
    
    sidebarToggle.addEventListener('click', function() {
        toggleSidebar();
    });
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const togglerContainer = document.getElementById('toggler');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    sidebarCollapsed = !sidebarCollapsed;
    
    if (sidebarCollapsed) {
        sidebar.classList.add('collapsed');
        sidebarToggle.innerHTML = '<i class="fas fa-chevron-right"></i>';
        togglerContainer.style.left = '0';
    } else {
        sidebar.classList.remove('collapsed');
        sidebarToggle.innerHTML = '<i class="fas fa-chevron-left"></i>';
        togglerContainer.style.left = sidebar.offsetWidth + 'px';
    }
    
    // Fix map display after sidebar toggle
    setTimeout(function() {
        map.invalidateSize();
    }, 300);
}

function highlightActiveButton(buttonId) {
    // Remove highlight from all buttons
    removeActiveButtonHighlight();
    
    // Highlight the active button
    const button = document.getElementById(buttonId);
    if (button) {
        button.classList.add('active');
        button.style.backgroundColor = '#1a73e8';
    }
}

function removeActiveButtonHighlight() {
    const buttons = document.querySelectorAll('.task-buttons button');
    buttons.forEach(button => {
        button.classList.remove('active');
        button.style.backgroundColor = '';
    });
}

function resetActiveTasks() {
    // Clean up task-specific resources (like drawing controls/listeners for Task 1)
    if (currentTask === 'task1' && typeof cleanupTask1 === 'function') {
        cleanupTask1();
    }
    // Cancel drawing if active (alternative way, requires cancelTask1Drawing to be global)
    // if (typeof window.cancelTask1Drawing === 'function') {
    //    window.cancelTask1Drawing();
    // }

    // Hide all feature groups
    Object.keys(featureGroups).forEach(key => {
        featureGroups[key].clearLayers();
        map.removeLayer(featureGroups[key]);
    });

    // Hide info panels
    document.getElementById('poiInfo').style.display = 'none';
    document.getElementById('weatherInfo').style.display = 'none';

    // Remove polyline measure if it exists
    if (map.polylineMeasure) {
        map.removeControl(map.polylineMeasure);
        map.polylineMeasure = null;
        // Ensure PolylineMeasure listeners are also cleaned up if necessary
        // (Might need specific cleanup method from the plugin if problems occur)
    }
    
    // Remove any custom controls added by tasks (like legends, opacity controls, etc.)
    removeCustomControls();
}

function removeCustomControls() {
    // Function to clean up any custom controls that might be added by tasks
    Object.keys(featureGroups).forEach(key => {
        const group = featureGroups[key];
        
        // Remove legend if it exists
        if (group.legend) {
            map.removeControl(group.legend);
            group.legend = null;
        }
        
        // Remove opacity control if it exists
        if (group.opacityControl) {
            map.removeControl(group.opacityControl);
            group.opacityControl = null;
        }
        
        // Remove cluster info if it exists
        if (group.clusterInfo) {
            map.removeControl(group.clusterInfo);
            group.clusterInfo = null;
        }

        // Remove drawing control if it exists (added in task1.js)
        if (group.drawingControl) {
            map.removeControl(group.drawingControl);
            group.drawingControl = null;
        }
    });
}

function showFeatureGroup(groupName) {
    if (featureGroups[groupName]) {
        map.addLayer(featureGroups[groupName]);
    }
}

function resetMap() {
    resetActiveTasks();
    removeActiveButtonHighlight();
    currentTask = null;
    
    // Reset view to Sweden
    map.setView([59.3293, 18.0686], 6);
} 