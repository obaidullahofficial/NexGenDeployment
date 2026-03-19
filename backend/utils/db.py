from pymongo import MongoClient

# MongoDB Atlas connection string
MONGO_URI = "mongodb+srv://AashfaNoor:NextGenIT22-A@cluster0.otiywgx.mongodb.net/?retryWrites=true&w=majority"

# Local MongoDB fallback
LOCAL_MONGO_URI = "mongodb://localhost:27017/"

# Global client and database instances (persistent connection pooling)
_client = None
_db = None

def setup_admin_indexes(db):
    """Setup MongoDB indexes to optimize Admin Dashboard queries"""
    try:
        db.users.create_index([("email", 1)])
        db.users.create_index([("role", 1)])
        db.users.create_index([("created_at", -1)])
        # Other common admin fields
        db.society_profiles.create_index([("status", 1)])
        db.approval_requests.create_index([("status", 1)])
        print("[DB] Admin query indexes verified.")
    except Exception as e:
        print(f"[DB] Failed to create indexes: {e}")

def get_db():
    """
    Get database connection with persistent connection pooling.
    Creates connection only once, then reuses for all requests.
    Prioritizes MongoDB Atlas (production), falls back to local MongoDB.
    """
    global _client, _db
    
    # Return existing connection if available
    if _db is not None:
        return _db
    
    # Try MongoDB Atlas first (prioritized for production)
    try:
        print("[DB] Attempting to connect to MongoDB Atlas...")
        _client = MongoClient(
            MONGO_URI,
            serverSelectionTimeoutMS=30000,  # Increased to 30 seconds
            connectTimeoutMS=30000,          # Added explicit connect timeout
            socketTimeoutMS=30000,           # Socket timeout
            # Connection pooling options
            maxPoolSize=50,          # Maximum connections in pool
            minPoolSize=10,          # Minimum connections to maintain
            retryWrites=True,
            retryReads=True
        )
        # Test the connection
        _client.admin.command('ping')
        print("[DB] ✅ Connected to MongoDB Atlas (with connection pooling)")
        _db = _client['NextGenArchitect']
        setup_admin_indexes(_db)
        return _db
    except Exception as atlas_error:
        print(f"[DB] ❌ Atlas connection failed: {atlas_error}")
        
        # Fallback to local MongoDB (development)
        try:
            print("[DB] Attempting to connect to local MongoDB (fallback)...")
            _client = MongoClient(
                LOCAL_MONGO_URI,
                serverSelectionTimeoutMS=5000,
                # Connection pooling options
                maxPoolSize=50,
                minPoolSize=10
            )
            # Test the connection
            _client.admin.command('ping')
            print("[DB] ✅ Connected to local MongoDB (with connection pooling)")
            _db = _client['NextGenArchitect']
            setup_admin_indexes(_db)
            return _db
        except Exception as local_error:
            print(f"[DB] ❌ Local MongoDB connection failed: {local_error}")
            print("[DB] ❌ Both Atlas and local connections failed!")
            raise Exception("Database connection failed. Please ensure MongoDB Atlas is accessible or MongoDB is running locally.")

def test_connection():
    """
    Test database connection and return status using persistent connection
    """
    try:
        db = get_db()
        db.admin.command('ping')
        print("[DB] MongoDB connection successful")
        return {"status": "Connected", "result": "OK"}
    except Exception as error:
        print(f"[DB] Connection test failed: {error}")
        return {"status": "Failed", "error": str(error)}


def close_db():
    """
    Close MongoDB connection gracefully (call on app shutdown)
    """
    global _client, _db
    
    if _client is not None:
        try:
            _client.close()
            print("[DB] MongoDB connection closed gracefully")
            _client = None
            _db = None
        except Exception as e:
            print(f"[DB] Error closing connection: {e}")

    

