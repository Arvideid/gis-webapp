// Task 7: K-means clustering of schools
function initTask7() {
    // Clear existing features
    featureGroups.task7.clearLayers();
    
    // Center map on Stockholm
    map.setView([59.3293, 18.0686], 10);
    
    // Load the CSV data
    fetch('/static/data/school_locations.csv')
        .then(response => response.text())
        .then(data => {
            // Parse CSV
            const schools = parseCSV(data);
            
            // Perform k-means clustering
            const k = 4; // Number of clusters
            const clusters = kMeansClustering(schools, k);
            
            // Add clustered schools to the map
            addClusteredSchools(schools, clusters);
            
            // Add cluster information
            addClusterInfo(schools, clusters);
        })
        .catch(error => console.error('Error loading school data:', error));
}

function parseCSV(csvData) {
    // Parse CSV data into an array of school objects
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    
    const schools = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const values = line.split(',');
            const school = {
                name: values[0],
                lat: parseFloat(values[1]),
                lng: parseFloat(values[2]),
                type: values[3]
            };
            schools.push(school);
        }
    }
    
    return schools;
}

function kMeansClustering(schools, k) {
    // Perform k-means clustering on the school locations
    
    // Extract coordinates
    const points = schools.map(school => [school.lat, school.lng]);
    
    // Initialize centroids randomly
    let centroids = [];
    for (let i = 0; i < k; i++) {
        const randomIndex = Math.floor(Math.random() * points.length);
        centroids.push([...points[randomIndex]]);
    }
    
    // Maximum iterations
    const maxIterations = 20;
    let iterations = 0;
    let previousCentroids = [];
    
    // Run k-means algorithm
    while (iterations < maxIterations) {
        // Assign points to nearest centroid
        const clusters = Array(k).fill().map(() => []);
        
        points.forEach((point, index) => {
            const distances = centroids.map(centroid => 
                distance(point, centroid)
            );
            const closestCentroidIndex = distances.indexOf(Math.min(...distances));
            clusters[closestCentroidIndex].push(index);
        });
        
        // Store previous centroids
        previousCentroids = [...centroids];
        
        // Update centroids
        for (let i = 0; i < k; i++) {
            if (clusters[i].length > 0) {
                const clusterPoints = clusters[i].map(index => points[index]);
                centroids[i] = clusterPoints.reduce((acc, point) => [
                    acc[0] + point[0] / clusterPoints.length,
                    acc[1] + point[1] / clusterPoints.length
                ], [0, 0]);
            }
        }
        
        // Check for convergence
        const centroidsEqual = centroids.every((centroid, i) => 
            distance(centroid, previousCentroids[i]) < 0.0001
        );
        
        if (centroidsEqual) {
            break;
        }
        
        iterations++;
    }
    
    // Assign each school to a cluster
    const schoolClusters = schools.map(school => {
        const distances = centroids.map(centroid => 
            distance([school.lat, school.lng], centroid)
        );
        return distances.indexOf(Math.min(...distances));
    });
    
    return {
        assignments: schoolClusters,
        centroids: centroids
    };
}

function distance(point1, point2) {
    // Calculate Euclidean distance between two points
    // Note: This is a simplification and doesn't account for Earth's curvature
    return Math.sqrt(
        Math.pow(point1[0] - point2[0], 2) + 
        Math.pow(point1[1] - point2[1], 2)
    );
}

function addClusteredSchools(schools, clusters) {
    // Define colors for each cluster
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#e67e22'];
    
    // Add schools to the map with colors based on their cluster
    schools.forEach((school, index) => {
        const clusterIndex = clusters.assignments[index];
        const color = colors[clusterIndex % colors.length];
        
        // Create marker
        const marker = L.circleMarker([school.lat, school.lng], {
            radius: 8,
            fillColor: color,
            color: 'white',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(featureGroups.task7);
        
        // Add popup
        marker.bindPopup(`
            <div>
                <h3>${school.name}</h3>
                <p><strong>Type:</strong> ${school.type}</p>
                <p><strong>Cluster:</strong> ${clusterIndex + 1}</p>
            </div>
        `);
        
        // Store school data and cluster in marker
        marker.school = school;
        marker.clusterIndex = clusterIndex;
    });
    
    // Add cluster centroids to the map
    clusters.centroids.forEach((centroid, index) => {
        const color = colors[index % colors.length];
        
        // Create marker for centroid
        const marker = L.circleMarker([centroid[0], centroid[1]], {
            radius: 15,
            fillColor: color,
            color: 'black',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(featureGroups.task7);
        
        // Add popup
        marker.bindPopup(`
            <div>
                <h3>Cluster ${index + 1} Center</h3>
                <p><strong>Latitude:</strong> ${centroid[0].toFixed(4)}</p>
                <p><strong>Longitude:</strong> ${centroid[1].toFixed(4)}</p>
            </div>
        `);
    });
    
    // Add a legend
    addClusterLegend(colors, clusters);
}

function addClusterLegend(colors, clusters) {
    // Create a legend control
    const legend = L.control({position: 'bottomright'});
    
    legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.backgroundColor = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';
        div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
        
        div.innerHTML = `
            <h4 style="margin-top: 0; margin-bottom: 10px;">School Clusters (K=${clusters.centroids.length})</h4>
        `;
        
        // Add legend items for each cluster
        for (let i = 0; i < clusters.centroids.length; i++) {
            const color = colors[i % colors.length];
            div.innerHTML += `
                <div style="margin-bottom: 5px;">
                    <span style="display: inline-block; width: 20px; height: 20px; background-color: ${color}; border-radius: 50%; margin-right: 5px;"></span>
                    Cluster ${i + 1}
                </div>
            `;
        }
        
        div.innerHTML += `
            <p style="margin-top: 10px;">Click on schools for details</p>
        `;
        
        return div;
    };
    
    legend.addTo(map);
    
    // Store the legend to remove it later
    featureGroups.task7.legend = legend;
    
    // Override the clearLayers method to also remove the legend
    const originalClearLayers = featureGroups.task7.clearLayers;
    featureGroups.task7.clearLayers = function() {
        if (featureGroups.task7.legend) {
            map.removeControl(featureGroups.task7.legend);
            featureGroups.task7.legend = null;
        }
        return originalClearLayers.call(this);
    };
}

function addClusterInfo(schools, clusters) {
    // Create a custom control with cluster information
    const clusterInfo = L.control({position: 'topright'});
    
    clusterInfo.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'cluster-info');
        div.style.backgroundColor = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '4px';
        div.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)';
        div.style.maxHeight = '300px';
        div.style.overflowY = 'auto';
        div.style.width = '250px';
        
        // Count schools by type in each cluster
        const clusterStats = [];
        
        for (let i = 0; i < clusters.centroids.length; i++) {
            const clusterSchools = schools.filter((school, index) => 
                clusters.assignments[index] === i
            );
            
            const typeCount = {};
            clusterSchools.forEach(school => {
                typeCount[school.type] = (typeCount[school.type] || 0) + 1;
            });
            
            clusterStats.push({
                totalSchools: clusterSchools.length,
                types: typeCount
            });
        }
        
        div.innerHTML = `
            <h4 style="margin-top: 0; margin-bottom: 10px;">Cluster Analysis</h4>
        `;
        
        // Add stats for each cluster
        for (let i = 0; i < clusterStats.length; i++) {
            const stats = clusterStats[i];
            
            div.innerHTML += `
                <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                    <h5 style="margin-top: 0; margin-bottom: 5px;">Cluster ${i + 1}</h5>
                    <p><strong>Total schools:</strong> ${stats.totalSchools}</p>
                    <p><strong>School types:</strong></p>
                    <ul style="margin-top: 5px; padding-left: 20px;">
            `;
            
            // Add counts for each school type
            Object.keys(stats.types).forEach(type => {
                div.innerHTML += `
                    <li>${type}: ${stats.types[type]}</li>
                `;
            });
            
            div.innerHTML += `
                    </ul>
                </div>
            `;
        }
        
        return div;
    };
    
    clusterInfo.addTo(map);
    
    // Store the control to remove it later
    featureGroups.task7.clusterInfo = clusterInfo;
    
    // Override the clearLayers method to also remove the control
    const originalClearLayers = featureGroups.task7.clearLayers;
    featureGroups.task7.clearLayers = function() {
        if (featureGroups.task7.clusterInfo) {
            map.removeControl(featureGroups.task7.clusterInfo);
            featureGroups.task7.clusterInfo = null;
        }
        if (featureGroups.task7.legend) {
            map.removeControl(featureGroups.task7.legend);
            featureGroups.task7.legend = null;
        }
        return originalClearLayers.call(this);
    };
} 