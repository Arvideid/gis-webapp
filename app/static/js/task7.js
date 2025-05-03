/**
 * Task 7: K-means Clustering of Schools
 * 
 * This task demonstrates the use of K-means clustering to group schools in Stockholm
 * based on their geographical locations. The clustering is performed on the backend
 * using scikit-learn, and the results are visualized on the map.
 */

// Color palette for clusters
const CLUSTER_COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

/**
 * Initializes Task 7 by:
 * 1. Clearing existing features
 * 2. Centering the map on Stockholm
 * 3. Loading school data from CSV
 * 4. Sending data to backend for clustering
 * 5. Visualizing the results
 */
function initTask7() {
    console.log('Initializing Task 7: K-means Clustering');
    
    // Clear existing features and center map
    featureGroups.task7.clearLayers();
    map.setView([59.3293, 18.0686], 11); // Center on Stockholm
    
    // Load school data from CSV
    fetch('/static/data/school_locations.csv')
        .then(response => response.text())
        .then(csvText => {
            // Parse CSV data
            const schools = parseCSV(csvText);
            console.log(`Loaded ${schools.length} schools from CSV`);
            
            // Send data to backend for clustering
            return fetch('/api/cluster-schools', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    k: 4,  // Number of clusters
                    schools: schools
                })
            });
        })
        .then(response => {
            console.log('API Response status:', response.status);
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log(`Received ${data.schools.length} schools and ${data.clusters.centers.length} clusters`);
                
                // Visualize the clustering results
                visualizeClusteringResults(data.schools, data.clusters);
            } else {
                console.error('Clustering failed:', data.error);
            }
        })
        .catch(error => {
            console.error('Error performing clustering:', error);
        });
}

/**
 * Parses CSV text into an array of school objects
 */
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1)
        .filter(line => line.trim()) // Skip empty lines
        .map(line => {
            const values = line.split(',');
            return {
                name: values[0],
                latitude: parseFloat(values[1]),
                longitude: parseFloat(values[2]),
                type: values[3]
            };
        });
}

/**
 * Visualizes the clustering results by:
 * 1. Adding school markers with cluster colors
 * 2. Adding cluster center markers
 * 3. Adding an information panel
 */
function visualizeClusteringResults(schools, clusters) {
    addSchoolMarkers(schools, clusters.assignments);
    addClusterCenters(clusters.centers, clusters.assignments, clusters.inertia);
    addClusterInfoPanel(clusters.centers, clusters.assignments, clusters.inertia);
}

/**
 * Adds markers for each school, colored according to their cluster assignment
 */
function addSchoolMarkers(schools, assignments) {
    console.log('Adding school markers to map...');
    
    schools.forEach((school, index) => {
        const clusterIndex = assignments[index];
        const color = CLUSTER_COLORS[clusterIndex % CLUSTER_COLORS.length];
        
        // Create and style the marker
        const marker = L.circleMarker([school.latitude, school.longitude], {
            radius: 8,
            fillColor: color,
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });
        
        // Add popup with school information
        marker.bindPopup(`
            <b>${school.name}</b><br>
            Type: ${school.type}<br>
            Cluster: ${clusterIndex + 1}
        `);
        
        // Add to feature group
        marker.addTo(featureGroups.task7);
    });
    
    console.log('Finished adding school markers');
}

/**
 * Adds markers for cluster centers
 */
function addClusterCenters(centers, assignments, inertia) {
    console.log('Adding cluster centers to map...');
    
    centers.forEach((center, index) => {
        const color = CLUSTER_COLORS[index % CLUSTER_COLORS.length];
        const clusterSize = assignments.filter(a => a === index).length;
        
        // Create and style the center marker
        const marker = L.circleMarker([center[0], center[1]], {
            radius: 12,
            fillColor: color,
            color: '#000',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        });
        
        // Add popup with cluster information
        marker.bindPopup(`
            <b>Cluster ${index + 1}</b><br>
            Center: (${center[0].toFixed(4)}, ${center[1].toFixed(4)})<br>
            Schools: ${clusterSize}<br>
            Inertia: ${inertia.toFixed(2)}
        `);
        
        // Add to feature group
        marker.addTo(featureGroups.task7);
    });
    
    console.log('Finished adding cluster centers');
}

/**
 * Adds an information panel showing cluster statistics
 */
function addClusterInfoPanel(centers, assignments, inertia) {
    console.log('Adding cluster information panel...');
    
    const infoPanel = L.control({position: 'bottomright'});
    
    infoPanel.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'info');
        div.style.backgroundColor = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';
        div.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
        
        // Build the information HTML
        let html = '<h4>K-means Clustering Results</h4>';
        html += `<p>Total Schools: ${assignments.length}</p>`;
        html += `<p>Number of Clusters: ${centers.length}</p>`;
        html += `<p>Total Inertia: ${inertia.toFixed(2)}</p>`;
        html += '<h5>Cluster Sizes:</h5>';
        
        centers.forEach((_, index) => {
            const size = assignments.filter(a => a === index).length;
            html += `<p>Cluster ${index + 1}: ${size} schools</p>`;
        });
        
        div.innerHTML = html;
        return div;
    };
    
    // Add to feature group
    infoPanel.addTo(featureGroups.task7);
    console.log('Finished adding information panel');
}

function distance(point1, point2) {
    // Calculate Euclidean distance between two points
    const dx = point1[0] - point2[0];
    const dy = point1[1] - point2[1];
    return Math.sqrt(dx * dx + dy * dy);
} 