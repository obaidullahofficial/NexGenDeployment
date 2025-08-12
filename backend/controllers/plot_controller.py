# Plot Controller Example
from utils.db import get_db
from models.plot import plot_collection
from flask import jsonify, request

# Example: Create Plot
def create_plot():
    db = get_db()
    data = request.json
    plot_col = plot_collection(db)
    plot_id = plot_col.insert_one(data).inserted_id
    return jsonify({'plot_id': str(plot_id)}), 201

# Example: Get All Plots
def get_all_plots():
    db = get_db()
    plot_col = plot_collection(db)
    plots = list(plot_col.find())
    for plot in plots:
        plot['_id'] = str(plot['_id'])
    return jsonify(plots)
