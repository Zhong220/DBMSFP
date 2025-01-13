from flask import Blueprint, request, jsonify, session
from database import Database
from flask_bcrypt import Bcrypt
from auth import create_account

# 建立 Blueprint
user_bp = Blueprint('user', __name__)
db = Database()  # 初始化自定義 Database 類
db.connect();
bcrypt = Bcrypt()

# 註冊使用者
@user_bp.route('/register', methods=['POST'])
def register():
    try:
        db.connect();
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        # 驗證必填欄位
        if not username or not password or not email:
            return jsonify({'error': 'Username, password and email are required'}), 400

        # 檢查用戶是否已存在
        existing_user = db.execute_query(
            "SELECT * FROM \"User\" WHERE name = %s", (username,)
        )
        if existing_user:
            return jsonify({'error': 'Username already exists'}), 400

        # 加密密碼
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        # 新增用戶
        user_id = db.add_user(username, email, hashed_password)
        if user_id:
            return jsonify({'message': 'Account created successfully!', 'user_id': user_id}), 201
        else:
            return jsonify({'error': 'Failed to create user'}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


# 登錄
@user_bp.route('/login', methods=['POST'])
def login():
    try:
        db.connect();
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        # 查詢用戶
        user = db.execute_query(
            "SELECT * FROM \"User\" WHERE name = %s", (username,)
        )
        if user and bcrypt.check_password_hash(user[0]['pwd_hash'], password):
            # 登錄成功，將用戶 ID 保存到 session 中
            session['user_id'] = user[0]['user_id']
            return jsonify({"message": "Login successful!"}), 200
        else:
            return jsonify({"error": "Invalid username or password"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

# 獲取用戶資料
@user_bp.route('/profile', methods=['GET'])
def get_user_profile():
    try:
        db.connect()
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "Not logged in"}), 401

        # 從資料庫中查詢用戶資料
        user = db.get_user_by_id(user_id)
        if user:
            return jsonify({
                "username": user['name'],
                "email": user['email'],
                "credit_score": user.get('credit_score', 0),
                "message": "User data retrieved successfully!"
            }), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

# 登出
@user_bp.route('/logout', methods=['POST'])
def logout():
    try:
        db.connect()
        session.pop('user_id', None)
        return jsonify({"message": "Logged out successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

