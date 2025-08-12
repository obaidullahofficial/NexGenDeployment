from pymongo import MongoClient

MONGO_URI = "mongodb+srv://AashfaNoor:NextGenIT22-A@cluster0.otiywgx.mongodb.net/?retryWrites=true&w=majority"

def get_db():
    client = MongoClient(MONGO_URI)
    return client['NextGenArchitect']

def test_connection():
    try:
        client = MongoClient(MONGO_URI)
        return client.admin.command('ping')
    except Exception as e:
        return str(e)