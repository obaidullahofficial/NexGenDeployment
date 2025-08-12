from werkzeug.security import generate_password_hash, check_password_hash
from utils.db import get_db
from models.user import user_collection

class UserController:
    @staticmethod
    def create_user(username, email, password, role='user'):
        db = get_db()
        users = user_collection(db)
        
        if users.find_one({'email': email}):
            return None, "Email already exists"
            
        password_hash = generate_password_hash(password)
        user_data = {
            'username': username,
            'email': email,
            'password_hash': password_hash,
            'role': role
        }
        
        result = users.insert_one(user_data)
        return str(result.inserted_id), "User created successfully"

    @staticmethod
    def verify_user(email, password):
        db = get_db()
        users = user_collection(db)
        user = users.find_one({'email': email})
        
        if user and check_password_hash(user['password_hash'], password):
            return user
        return None