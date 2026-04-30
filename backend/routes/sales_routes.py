from flask import Blueprint, request, jsonify, make_response
from db import sales_collection
import datetime

sales_bp = Blueprint("sales", __name__)

# POST: Record a new sale
@sales_bp.route("/sales", methods=["POST", "OPTIONS"])
def create_sale():
    if request.method == "OPTIONS":
        return make_response(jsonify({"message": "OK"}), 200)

    data = request.get_json()
    if not data:
        return make_response(jsonify({"error": "No data received"}), 400)
    
    # Insert the sale into MongoDB
    sales_collection.insert_one(data)
    
    data.pop('_id', None) # Remove MongoDB's internal ID before returning
    return make_response(jsonify({"message": "Sale recorded", "sale": data}), 201)

# GET: Fetch all past sales (Sales History)
@sales_bp.route("/sales", methods=["GET"])
def get_sales():
    # Fetch all sales and sort them by date (newest first)
    sales = list(sales_collection.find({}, {"_id": 0}).sort("date", -1))
    return make_response(jsonify(sales), 200)