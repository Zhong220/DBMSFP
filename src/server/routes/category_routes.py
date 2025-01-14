from flask import Blueprint, jsonify
from database import Database

category_bp = Blueprint('category_bp', __name__)
db = Database()

@category_bp.route("", methods=["GET"])

@category_bp.route("/", methods=["GET"])
def get_categories():
    try:
        db.connect()
        query = '''
            SELECT "category_ID", "category_name" 
            FROM category
        '''
        categories = db.execute_query(query)
        return jsonify({"data": categories, "error": None, "message": ""}), 200
    except Exception as e:
        return jsonify({"data": None, "error": str(e), "message": "Failed to fetch categories"}), 500
    finally:
        db.close()
