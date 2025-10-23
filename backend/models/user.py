from bson import ObjectId
from datetime import datetime

class User:
    def __init__(self, username, email, password_hash, role='user', society_id=None, is_verified=False, created_at=None):
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.role = role
        self.society_id = society_id
        self.is_verified = is_verified  # Email verification status
        self.created_at = created_at or datetime.utcnow()  # Account creation timestamp

def user_collection(db):
    return db['users']