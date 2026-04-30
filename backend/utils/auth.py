from flask import request, jsonify
import functools

def require_admin(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):

        user_role = request.headers.get("X-Role")

        if user_role != "Admin":
            return jsonify({"error": "Forbidden: Admin access required"}), 403

        return func(*args, **kwargs)

    return wrapper