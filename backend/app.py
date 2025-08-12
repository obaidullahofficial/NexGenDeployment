from flask import Flask
from flask_jwt_extended import JWTManager
from routes.user_routes import user_bp
from flask_cors import CORS  
from utils.db import test_connection

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])
app.config['JWT_SECRET_KEY'] = '6b30c0cdbdc749228ae16f07492b441310eac85611cbd607e1e110237218f89b'  # Replace with your secret key
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')

@app.route('/api/db-test')
def db_test():
    result = test_connection()
    if isinstance(result, dict):
        return "MongoDB is connected"
    return f"MongoDB connection failed: {result}", 500

if __name__ == '__main__':
    app.run(debug=True)

