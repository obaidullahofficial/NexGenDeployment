# Society Controller Example
from utils.db import get_db
from models.society import society_collection
from flask import jsonify, request

# Example: Create Society
def create_society():
    db = get_db()
    data = request.json
    society_col = society_collection(db)
    society_id = society_col.insert_one(data).inserted_id
    return jsonify({'society_id': str(society_id)}), 201

# Example: Get All Societies
def get_all_societies():
    db = get_db()
    society_col = society_collection(db)
    societies = list(society_col.find())
    for society in societies:
        society['_id'] = str(society['_id'])
    return jsonify(societies)
