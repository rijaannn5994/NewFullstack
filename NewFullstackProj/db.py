from pymongo import MongoClient
from config import MONGO_URI, DB_NAME

# This connects to the server
client = MongoClient(MONGO_URI) 

# This creates/connects to your specific database
db = client['biz_directory_db'] 

# These create/connect to your collections
inventory_collection = db["inventory"]
suppliers_collection = db["suppliers"]