# GIS Web Application

A responsive web application for performing basic GIS operations using Flask and Leaflet.

## Features

1. **Create Features**: Create point, line, and polygon features on the map
2. **Points of Interest**: Display locations of interest with information and distance measurements
3. **Buffer Analysis**: Load supermarket GeoJSON data and create 1km buffers, highlighting non-overlapping locations
4. **Image Overlay**: Add an image overlay to the map
5. **Marker Clusters**: Use marker clustering for fuel station locations
6. **Weather Information**: Display real-time and forecast weather data from SMHI API
7. **K-means Clustering**: Perform K-means clustering on school locations with server-side processing

## UI/UX Features

- **Clean, Minimal Design**: Modern and uncluttered interface
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Collapsible Sidebar**: Toggle sidebar visibility for more map viewing space
- **Loading Indicators**: Visual feedback during data loading operations
- **Interactive Controls**: Easy-to-use buttons and controls for all GIS operations
- **Consistent Styling**: Unified color scheme and design patterns
- **Mobile Optimization**: Adjusted layout and controls for smaller screens

## Setup

1. Clone the repository:
```
git clone <repository-url>
cd gis-webapp
```

2. Create and activate a virtual environment:
```
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```
pip install -r requirements.txt
```

4. Run the application:
```
python app.py
```

5. Open the application in your browser:
```
http://localhost:5000
```

## Project Structure

- `app.py`: Main Flask application
- `app/templates/`: HTML templates
- `app/static/`: Static files
  - `css/`: CSS stylesheets
  - `js/`: JavaScript files
  - `data/`: GeoJSON and CSV data files
  - `images/`: Image files

## Technologies Used

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript
- **Map Library**: Leaflet.js
- **Data Analysis**: scikit-learn (K-means clustering)
- **Icons**: Font Awesome

## Notes

- Weather data is fetched from the SMHI API for accurate real-time and forecast information
- K-means clustering is implemented server-side for efficient processing of school location data
- The application uses CDN-hosted libraries for Leaflet, Leaflet plugins, and Font Awesome 