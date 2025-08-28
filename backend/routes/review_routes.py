# backend/routes/review_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from controllers.review_controller import ReviewController
from bson import ObjectId

review_bp = Blueprint('review', __name__)

@review_bp.route('/reviews', methods=['POST'])
@jwt_required()
def create_review():
    """Endpoint to create a new review"""
    try:
        data = request.json
        plot_id = data.get('plot_id')
        rating = data.get('rating')
        comment = data.get('comment')
        
        # Get user ID from JWT token
        user_email = get_jwt_identity() 
        # You'll need a way to get the user_id from the user_email, e.g., by querying the user collection
        # For simplicity, we'll just use the email as the user_id for now
        user_id = user_email
        
        if not plot_id or not rating or not comment:
            return jsonify({"error": "Missing required fields"}), 400
            
        review_id, message = ReviewController.create_review(plot_id, user_id, rating, comment)
        
        if review_id:
            return jsonify({"success": True, "message": message, "review_id": review_id}), 201
        else:
            return jsonify({"error": message}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@review_bp.route('/plots/<plot_id>/reviews', methods=['GET'])
def get_reviews_by_plot(plot_id):
    """Endpoint to get all reviews for a specific plot"""
    try:
        reviews, message = ReviewController.get_reviews_by_plot(plot_id)
        
        return jsonify({"success": True, "reviews": reviews, "message": message}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500