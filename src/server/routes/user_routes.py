from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database import db

user_bp = Blueprint('user', __name__)

@user_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([name, email, password]):
        return jsonify({"error": "Missing required fields"}), 400

    hashed_pwd = generate_password_hash(password)
    try:
        db.execute_query(
            '''
            INSERT INTO "User" (name, email, pwd_hash)
            VALUES (%s, %s, %s)
            ''',
            (name, email, hashed_pwd)
        )
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        return jsonify({"error": f"Failed to register user: {e}"}), 500


@user_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"error": "Missing email or password"}), 400

    try:
        user = db.fetch_one(
            '''
            SELECT * FROM "User" WHERE email = %s
            ''',
            (email,)
        )

        if user and check_password_hash(user['pwd_hash'], password):
            # 可選：移除密碼哈希，避免返回敏感資訊
            user.pop('pwd_hash', None)
            return jsonify({"message": "Login successful", "user": user}), 200
        else:
            return jsonify({"error": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"error": f"Failed to login: {str(e)}"}), 500
