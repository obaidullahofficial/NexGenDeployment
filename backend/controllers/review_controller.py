# backend/controllers/review_controller.py
from utils.db import get_db
from models.review import Review, review_collection
from bson import ObjectId

class ReviewController:
    @staticmethod
    def create_review(plot_id, user_id, rating, comment):
        """Create a new review for a plot"""
        try:
            db = get_db()
            reviews = review_collection(db)
            
            # Create a new review object
            new_review = Review(
                plot_id=plot_id,
                user_id=user_id,
                rating=rating,
                comment=comment
            )
            
            # Insert the review into the database
            result = reviews.insert_one(new_review.to_dict())
            
            return str(result.inserted_id), "Review created successfully"
        except Exception as e:
            return None, f"Error creating review: {str(e)}"
            
    @staticmethod
    def get_reviews_by_plot(plot_id):
        """Get all reviews for a specific plot"""
        try:
            db = get_db()
            reviews = review_collection(db)
            
            # Find all reviews for the given plot_id
            found_reviews = list(reviews.find({'plot_id': plot_id}))
            
            # Convert ObjectId to string for JSON serialization
            for review in found_reviews:
                review['_id'] = str(review['_id'])
                
            return found_reviews, "Reviews retrieved successfully"
        except Exception as e:
            return [], f"Error retrieving reviews: {str(e)}"