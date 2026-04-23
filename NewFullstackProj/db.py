from pymongo import MongoClient
from config import MONGO_URI, DB_NAME

client = MongoClient(MONGO_URI)
db = client['biz_directory_db']

inventory_collection = db["inventory"]
suppliers_collection = db["suppliers"]