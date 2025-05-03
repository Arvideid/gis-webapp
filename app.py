from flask import Flask, render_template, jsonify, request
import os
import json
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
import logging

app = Flask(__name__, static_folder='app/static', template_folder='app/templates')

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/cluster-schools', methods=['POST'])
def cluster_schools():
    try:
        logger.info("Received clustering request")
        
        # Get the number of clusters and school data from the request
        data = request.json
        k = data.get('k', 4)  # Default to 4 clusters
        schools = data.get('schools', [])
        
        logger.debug(f"Number of clusters requested: {k}")
        logger.debug(f"Received {len(schools)} schools for clustering")
        
        if not schools:
            return jsonify({
                'success': False,
                'error': "No school data provided"
            }), 400
            
        # Extract coordinates from school data
        X = np.array([[school['latitude'], school['longitude']] for school in schools])
        logger.debug(f"Extracted coordinates: {X.shape}")
        
        # Perform K-means clustering
        kmeans = KMeans(
            n_clusters=k,
            init='k-means++',
            n_init=10,
            max_iter=300,
            random_state=42
        )
        
        # Fit the model and get cluster assignments
        labels = kmeans.fit_predict(X)
        logger.debug(f"Clustering completed with {kmeans.n_iter_} iterations")
        
        # Get cluster centers
        centers = kmeans.cluster_centers_
        
        # Calculate inertia (sum of squared distances)
        inertia = kmeans.inertia_
        
        # Prepare the response
        response = {
            'success': True,
            'clusters': {
                'assignments': labels.tolist(),
                'centers': centers.tolist(),
                'inertia': float(inertia),
                'iterations': int(kmeans.n_iter_)
            },
            'schools': schools  # Return the original school data
        }
        
        logger.info(f"Returning response with {len(schools)} schools and {k} clusters")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in clustering: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True) 