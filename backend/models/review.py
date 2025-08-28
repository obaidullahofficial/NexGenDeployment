# backend/models/review.py
from datetime import datetime
from bson import ObjectId

class Review:
    def __init__(self, plot_id, user_id, rating, comment, created_at=None):
        self.plot_id = plot_id
        self.user_id = user_id
        self.rating = rating
        self.comment = comment
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self):
        return {
            "plot_id": self.plot_id,
            "user_id": self.user_id,
            "rating": self.rating,
            "comment": self.comment,
            "created_at": self.created_at
        }

def review_collection(db):
    return db['reviews']