# Floor Plan Controller Example
from utils.db import get_db
from models.floorplan import floorplan_collection
from flask import jsonify, request

# Example: Save Floor Plan
def save_floorplan():
    db = get_db()
    data = request.json
    floorplan_col = floorplan_collection(db)
    floorplan_id = floorplan_col.insert_one(data).inserted_id
    return jsonify({'floorplan_id': str(floorplan_id)}), 201

# Example: Get Floor Plans by User
def get_user_floorplans(user_id):
    db = get_db()
    floorplan_col = floorplan_collection(db)
    plans = list(floorplan_col.find({'user_id': user_id}))
    for plan in plans:
        plan['_id'] = str(plan['_id'])
    return jsonify(plans)
