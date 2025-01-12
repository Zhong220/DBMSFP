from flask import Blueprint, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from auth import create_account

# 建立 Blueprint
user_routes = Blueprint('user', __name__)

# 註冊使用者
@user_routes.route('/register', methods=['POST'])

def register():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        # 驗證必填欄位
        if not username or not password or not email:
            return jsonify({'error': 'Username, password and email are required'}), 400
        
        result = create_account(username, password, email)

        if result is None:
            return jsonify({'error': 'An error occurred while creating account'}),500

        if result.get('error'):
            return jsonify(result), 400
        
        return jsonify({'message': 'Account created successfully!'}), 201
    
    except Exception as e:
        # 如果處理過程中發生錯誤，返回錯誤訊息
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
    user_routes.run(host='0.0.0.0', port=5000)  # 運行 Flask 伺服器，預設 5000 端口