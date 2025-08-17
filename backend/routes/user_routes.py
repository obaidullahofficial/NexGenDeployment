from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, unset_jwt_cookies
from controllers.user_controller import UserController
from models.registration_form import registration_form_collection
from models.user import user_collection
from models.society_profile import society_profile_collection
from utils.db import get_db

user_bp = Blueprint('user', __name__)

@user_bp.route('/register-society', methods=['POST'])
def register_society():
    data = request.json
    required_fields = ['name', 'type', 'regNo', 'established', 'authority', 'contact', 'website', 'plots']
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({"error": "All fields are required"}), 400
    data['status'] = "pending"
    db = get_db()
    reg_forms = registration_form_collection(db)
    reg_id = reg_forms.insert_one(data).inserted_id
    return jsonify({"message": "Society registration submitted", "registration_id": str(reg_id)}), 201

@user_bp.route('/check-email', methods=['POST'])
def check_email():
    """Check if an email already exists in the system"""
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    try:
        db = get_db()
        users = user_collection(db)
        
        existing_user = users.find_one({'email': email})
        
        if existing_user:
            return jsonify({"exists": True, "message": "Email already exists"}), 200
        else:
            return jsonify({"exists": False, "message": "Email is available"}), 200
            
    except Exception as e:
        return jsonify({"error": f"Failed to check email: {str(e)}"}), 500

@user_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'user')

    if not all([username, email, password]):
        return jsonify({"error": "All fields are required"}), 400

    user_id, message = UserController.create_user(username, email, password, role)
    if not user_id:
        return jsonify({"error": message}), 400

    return jsonify({"message": message, "user_id": user_id}), 201

@user_bp.route('/signup-society', methods=['POST'])
def signup_society():
    data = request.json
    
    # Extract user data
    user_name = data.get('userName')
    user_email = data.get('userEmail')
    user_password = data.get('userPassword')
    
    # Extract society data
    society_data = {
        'name': data.get('name'),
        'type': data.get('type'),
        'regNo': data.get('regNo'),
        'established': data.get('established'),
        'authority': data.get('authority'),
        'contact': data.get('contact'),
        'website': data.get('website'),
        'plots': data.get('plots'),
        'user_email': user_email  # Link society to user email
    }
    
    # Validate required fields
    user_required = [user_name, user_email, user_password]
    society_required = [society_data['name'], society_data['type'], society_data['regNo'], 
                       society_data['established'], society_data['authority'], 
                       society_data['contact'], society_data['website'], society_data['plots']]
    
    if not all(user_required):
        return jsonify({"error": "User information is incomplete"}), 400
    
    if not all(society_required):
        return jsonify({"error": "Society information is incomplete"}), 400
    
    try:
        # Create user account with society role
        user_id, user_message = UserController.create_user(user_name, user_email, user_password, 'society')
        if not user_id:
            return jsonify({"error": user_message}), 400
        
        # Create society registration form
        society_data['status'] = "pending"
        society_data['user_id'] = user_id  # Link society to user ID
        
        db = get_db()
        reg_forms = registration_form_collection(db)
        reg_id = reg_forms.insert_one(society_data).inserted_id
        
        return jsonify({
            "message": "Society signup successful! Your registration is pending admin approval.",
            "user_id": user_id,
            "registration_id": str(reg_id)
        }), 201
        
    except Exception as e:
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    print(f"[LOGIN] Attempting login for email: {email}")

    if not all([email, password]):
        print("[LOGIN] Missing email or password")
        return jsonify({"error": "Email and password are required"}), 400

    # Get user from database first to check if they exist
    db = get_db()
    users = user_collection(db)
    user_exists = users.find_one({'email': email})
    
    if not user_exists:
        print(f"[LOGIN] No user found with email: {email}")
        return jsonify({"error": "User not found"}), 401

    user = UserController.verify_user(email, password)
    print(f"[LOGIN] Verify user result: {user is not None}")
    
    if not user:
        print(f"[LOGIN] Password verification failed for email: {email}")
        return jsonify({"error": "Invalid password"}), 401

    # Check society registration status for society users
    if user['role'] == 'society':
        db = get_db()
        reg_forms = registration_form_collection(db)
        society = reg_forms.find_one({'user_email': email})
        
        if not society:
            return jsonify({"error": "Society registration not found"}), 404
        
        society_status = society.get('status', 'pending')
        
        if society_status == 'pending':
            return jsonify({
                "error": "registration_pending",
                "message": "Your society registration request is still being processed. Please wait for admin approval."
            }), 403
        elif society_status == 'rejected':
            return jsonify({
                "error": "registration_rejected", 
                "message": "Your society registration request has been rejected. Please contact admin for more information."
            }), 403
        elif society_status != 'approved':
            return jsonify({
                "error": "registration_invalid",
                "message": "Invalid registration status. Please contact admin."
            }), 403
    
    # Generate access token for successful login
    from datetime import datetime, timezone
    current_time = datetime.now(timezone.utc)
    print(f"[LOGIN DEBUG] Creating token at: {current_time}")
    
    # JWT identity must be a string, not a dict. We'll use email as identity
    # and add role as additional claims
    access_token = create_access_token(
        identity=email,
        additional_claims={'role': user['role']}
    )
    print(f"[LOGIN DEBUG] Token created: {access_token[:50]}...")
    
    # Decode and check the token immediately after creation
    try:
        import jwt
        from flask import current_app
        decoded = jwt.decode(access_token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        token_exp = datetime.fromtimestamp(decoded['exp'], timezone.utc)
        print(f"[LOGIN DEBUG] Token expires at: {token_exp}")
        print(f"[LOGIN DEBUG] Time until expiry: {(token_exp - current_time).total_seconds()} seconds")
    except Exception as decode_error:
        print(f"[LOGIN DEBUG] Error decoding token: {decode_error}")
    
    is_admin = user.get('role') == 'admin'
    
    response_data = {
        "access_token": access_token, 
        "is_admin": is_admin,
        "role": user['role'],
        "success": True
    }
    
    # For society users, check and initialize profile if needed
    if user['role'] == 'society':
        try:
            db = get_db()
            profiles = society_profile_collection(db)
            
            # Try to get existing profile
            profile = profiles.find_one({'user_email': email})
            
            if not profile:
                # Initialize basic profile structure
                from datetime import datetime
                profile_data = {
                    'user_email': email,
                    'name': '',
                    'description': '',
                    'location': '',
                    'available_plots': '',
                    'price_range': '',
                    'society_logo': '',
                    'is_complete': False,
                    'created_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                }
                
                # Insert the initial profile
                result = profiles.insert_one(profile_data)
                if result.inserted_id:
                    profile = profiles.find_one({'_id': result.inserted_id})
            
            # Check profile completeness
            if profile:
                required_fields = ['name', 'description', 'location', 'available_plots', 'price_range']
                missing_fields = [f for f in required_fields if not profile.get(f)]
                
                if not profile.get('society_logo'):
                    missing_fields.append('society_logo')
                    
                is_complete = len(missing_fields) == 0
                
                response_data.update({
                    "profile_complete": is_complete,
                    "missing_fields": missing_fields,
                    "profile_exists": True
                })
            else:
                response_data.update({
                    "profile_complete": False,
                    "missing_fields": ['name', 'description', 'location', 'available_plots', 'price_range', 'society_logo'],
                    "profile_exists": False
                })
                
        except Exception as e:
            # If there's an error with profile operations, still allow login
            print(f"Profile check error during login: {str(e)}")
            response_data.update({
                "profile_complete": False,
                "profile_exists": False,
                "missing_fields": ['name', 'description', 'location', 'available_plots', 'price_range', 'society_logo']
            })
    
    return jsonify(response_data), 200

@user_bp.route('/my-society', methods=['GET'])
@jwt_required()
def get_my_society():
    """Get society information for the logged-in user"""
    user_email = get_jwt_identity()  # Now returns email directly
    
    db = get_db()
    reg_forms = registration_form_collection(db)
    
    # Find society by user email
    society = reg_forms.find_one({'user_email': user_email})
    
    if not society:
        return jsonify({"error": "No society found for this user"}), 404
    
    # Convert ObjectId to string for JSON serialization
    society['_id'] = str(society['_id'])
    
    return jsonify({"society": society}), 200

@user_bp.route('/logout', methods=['POST'])
def logout():
    response = jsonify({'msg': 'Logout successful'})
    unset_jwt_cookies(response)
    return response, 200
