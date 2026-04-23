from flask import Blueprint, request, jsonify ,make_response
from db import suppliers_collection
from utils.auth import require_admin

supplier_bp = Blueprint("suppliers", __name__)

# GET ALL SUPPLIERS
@supplier_bp.route("/suppliers", methods=["GET"])
def get_all_suppliers():

    page_num = request.args.get("pn", default=1, type=int)
    page_size = request.args.get("ps", default=10, type=int)

    page_start = (page_num - 1) * page_size

    suppliers = list(
        suppliers_collection.find({}, {"_id": 0})
        .skip(page_start)
        .limit(page_size)
    )

    return make_response(jsonify(suppliers),200)


# CREATE SUPPLIER
@supplier_bp.route("/suppliers", methods=["POST"])
@require_admin
def create_supplier():
    data = request.form.to_dict()
    if suppliers_collection.find_one({"supplier_id": data.get("supplier_id")}):
        return make_response(jsonify({"error": "Supplier ID already exists"}),409)

        
    suppliers_collection.insert_one(data)
    data.pop('_id', None)
    return make_response(jsonify({"message": "supplier added", "supplier": data}),201)

# ANALYTICS
@supplier_bp.route("/suppliers/<supplier_id>/analytics", methods=["GET"])
def supplier_analytics(supplier_id):

    supplier = suppliers_collection.find_one(
        {"supplier_id": supplier_id}, {"_id": 0}
    )

    if not supplier:
        return make_response(jsonify({"error": "Supplier not found"}),404)

    analytics = {
        "supplier_name": supplier.get("supplier_name"),
        "reliability_score": supplier.get("reliability_score"),
        "performance_reviews": supplier.get("performance_reviews", [])
    }

    return make_response(jsonify(analytics),202)


# UPDATE SUPPLIER
@supplier_bp.route("/suppliers/<supplier_id>", methods=["PUT"])
@require_admin
def update_supplier(supplier_id):

    data = request.form.to_dict()

    result = suppliers_collection.update_one(
        {"supplier_id": supplier_id},
        {"$set": data}
    )

    if result.matched_count == 0:
        return make_response(jsonify({"error": "Supplier not found"}),404)

    return make_response(jsonify({"message": "Supplier updated"}),200)


# DELETE SUPPLIER
@supplier_bp.route("/suppliers/<supplier_id>", methods=["DELETE"])
@require_admin
def delete_supplier(supplier_id):

    result = suppliers_collection.delete_one({"supplier_id": supplier_id})

    if result.deleted_count == 0:
        return make_response(jsonify({"error": "Supplier not found"}),404)

    return make_response(jsonify({"message": "Supplier deleted"}),200)
