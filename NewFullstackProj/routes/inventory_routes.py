import os
from werkzeug.utils import secure_filename
from flask import Blueprint, request, jsonify, make_response
from datetime import datetime
from db import inventory_collection
import base64

inventory_bp = Blueprint("inventory", __name__)

UPLOAD_FOLDER = 'uploads/inventory_photos'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# GET ALL ITEMS (With Search)
@inventory_bp.route("/inventory", methods=["GET"])
def get_all_inventory():
    page_num = request.args.get("pn", default=1, type=int)
    page_size = request.args.get("ps", default=10, type=int)
    search_term = request.args.get("search", default="", type=str)

    page_start = (page_num - 1) * page_size

    query = {}
    if search_term:
        query = {
            "$or": [
                {"item_name": {"$regex": search_term, "$options": "i"}},
                {"item_id": {"$regex": search_term, "$options": "i"}},
                {"category": {"$regex": search_term, "$options": "i"}}
            ]
        }

    items = list(
        inventory_collection.find(query, {"_id": 0})
        .skip(page_start)
        .limit(page_size)
    )

    return make_response(jsonify(items), 200)

# CREATE ITEM
@inventory_bp.route("/inventory", methods=["POST", "OPTIONS"])
def create_inventory_item():
    if request.method == "OPTIONS":
        return make_response(jsonify({"message": "OK"}), 200)

    data = request.get_json()
    if not data:
        return make_response(jsonify({"error": "No data received"}), 400)
    
    if inventory_collection.find_one({"item_id": data.get("item_id")}):
        return make_response(jsonify({"error": "Item ID already exists"}), 409)

    data['last_updated'] = datetime.utcnow().isoformat()
    inventory_collection.insert_one(data)
    
    data.pop('_id', None)
    return make_response(jsonify({"message": "Item created", "item": data}), 201)

# GET SINGLE ITEM
@inventory_bp.route("/inventory/<item_id>", methods=["GET"])
def get_single_item(item_id):
    item = inventory_collection.find_one({"item_id": item_id}, {"_id": 0})
    if not item:
        return make_response(jsonify({"error": "Item not found"}), 404)
    return make_response(jsonify(item), 200)

# UPDATE ITEM
@inventory_bp.route("/inventory/<item_id>", methods=["PUT", "OPTIONS"])
def update_inventory_item(item_id):
    if request.method == "OPTIONS":
        return make_response(jsonify({"message": "OK"}), 200)

    data = request.get_json()
    data["last_updated"] = datetime.utcnow().isoformat()

    result = inventory_collection.update_one(
        {"item_id": item_id},
        {"$set": data}
    )

    if result.matched_count == 0:
        return make_response(jsonify({"error": "Item not found"}), 404)    

    return make_response(jsonify({"message": "Item updated successfully"}), 200)

# DELETE ITEM
@inventory_bp.route("/inventory/<item_id>", methods=["DELETE"])
def delete_inventory_item(item_id):
    result = inventory_collection.delete_one({"item_id": item_id})
    if result.deleted_count == 0:
        return make_response(jsonify({"error": "Item not found"}), 404)
    return make_response(jsonify({"message": "Item deleted successfully"}), 200)

# LOW STOCK
@inventory_bp.route("/inventory/low-stock", methods=["GET"])
def get_low_stock():
    query = {"$expr": {"$lte": ["$quantity_in_stock", "$reorder_level"]}}
    items = list(inventory_collection.find(query, {"_id": 0}))
    return make_response(jsonify(items), 200)

# UPLOAD ITEM PHOTO
@inventory_bp.route("/inventory/<item_id>/photos", methods=["POST", "OPTIONS"])
def upload_item_photo(item_id):
    if request.method == "OPTIONS":
        return make_response(jsonify({"message": "OK"}), 200)

    if 'photo' not in request.files:
        return make_response(jsonify({"error": "No photo file provided"}), 400)
    
    file = request.files['photo']
    if file.filename == '':
        return make_response(jsonify({"error": "No selected file"}), 400)
        
    if file:
        # Read the file and convert it to a base64 string
        encoded_string = base64.b64encode(file.read()).decode('utf-8')
        mime_type = file.content_type
        
        # Create a Data URL that HTML <img> tags can read directly
        photo_data_url = f"data:{mime_type};base64,{encoded_string}"

        # Save this massive text string directly into MongoDB
        result = inventory_collection.update_one(
            {"item_id": item_id},
            {"$push": {"photos": photo_data_url}}
        )

        return make_response(jsonify({
            "message": "Photo saved to database successfully", 
            "photo_url": photo_data_url
        }), 200)