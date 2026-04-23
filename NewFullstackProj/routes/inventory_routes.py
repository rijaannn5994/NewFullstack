from flask import Blueprint, request, jsonify, make_response
from datetime import datetime
from db import inventory_collection
from utils.auth import require_admin

inventory_bp = Blueprint("inventory", __name__)

# GET ALL ITEMS
@inventory_bp.route("/inventory", methods=["GET"])
def get_all_inventory():

    page_num = request.args.get("pn", default=1, type=int)
    page_size = request.args.get("ps", default=10, type=int)

    page_start = (page_num - 1) * page_size

    items = list(
        inventory_collection.find({}, {"_id": 0})
        .skip(page_start)
        .limit(page_size)
    )

    return make_response(jsonify(items), 200)


# CREATE ITEM
@inventory_bp.route("/inventory", methods=["POST"])
@require_admin
def create_inventory_item():
    data = request.form.to_dict()
    
    # Basic validation
    if inventory_collection.find_one({"item_id": data.get("item_id")}):
        return make_response(jsonify({"error": "Item ID already exists"}),409)

    data['last_updated'] = datetime.utcnow().isoformat()
    inventory_collection.insert_one(data)
    
    data.pop('_id', None)
    return make_response(jsonify({"message": "Item created", "item": data}),201)


# GET SINGLE ITEM
@inventory_bp.route("/inventory/<item_id>", methods=["GET"])
def get_single_item(item_id):

    item = inventory_collection.find_one({"item_id": item_id}, {"_id": 0})

    if not item:
        return make_response(jsonify({"error": "Item not found"}),404)

    return make_response(jsonify(item),200)


# UPDATE ITEM
@inventory_bp.route("/inventory/<item_id>", methods=["PUT"])
@require_admin
def update_inventory_item(item_id):

    data = request.form.to_dict()
    data["last_updated"] = datetime.utcnow().isoformat()

    result = inventory_collection.update_one(
        {"item_id": item_id},
        {"$set": data}
    )

    if result.matched_count == 0:
        return make_response(jsonify({"error": "Item not found"}),404)    

    return make_response(jsonify({"message": "Item updated successfully"}),200)

# DELETE ITEM
@inventory_bp.route("/inventory/<item_id>", methods=["DELETE"])
@require_admin
def delete_inventory_item(item_id):

    result = inventory_collection.delete_one({"item_id": item_id})

    if result.deleted_count == 0:
        return make_response(jsonify({"error": "Item not found"}),404)

    return make_response(jsonify({"message": "Item deleted successfully"}),200)


# LOW STOCK
@inventory_bp.route("/inventory/low-stock", methods=["GET"])
def get_low_stock():

    query = {"$expr": {"$lte": ["$quantity_in_stock", "$reorder_level"]}}

    items = list(inventory_collection.find(query, {"_id": 0}))

    return make_response(jsonify(items),200)
