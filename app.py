from flask import Flask, render_template, jsonify, request
import os
import json
import pandas as pd
import numpy as np

app = Flask(__name__, static_folder='app/static', template_folder='app/templates')

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True) 