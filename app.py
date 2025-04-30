from flask import Flask, render_template, jsonify, request
import os
import json
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans

app = Flask(__name__, static_folder='app/static', template_folder='app/templates')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/kmeans', methods=['POST'])
def perform_kmeans():
    try:
        # Get the CSV file path
        csv_path = os.path.join(app.static_folder, 'data', 'school_locations.csv')
        
        # Read the CSV file
        df = pd.read_csv(csv_path)
                # Get the number of clusters
        k = int(request.json.get('k', 4))
        
        # Extract coordinates for clustering
        X = df[['latitude', 'longitude']].values
        
        # Perform k-means clustering
        kmeans = KMeans(n_clusters=k, random_state=42)
        df['cluster'] = kmeans.fit_predict(X)
        
        # Get the cluster centers
        centers = kmeans.cluster_centers_.tolist()
        
        # Prepare the response
        result = {
            'schools': df.to_dict('records'),
            'centers': centers
        }
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 