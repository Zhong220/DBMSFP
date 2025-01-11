
from flask import Flask, jsonify
from database import Database
from dotenv import load_dotenv
from flask_cors import CORS
=======
from flask import Flask
from database import Database  # 引入 database.py

# Import Blueprints
from routes.user_routes import user_bp
from routes.friend_routes import friend_bp
from routes.transaction_routes import transaction_bp
from routes.leaderdboard_routes import leaderboard_bp  

# 加載環境變數
load_dotenv()

# 創建 Flask 應用
app = Flask(__name__)
CORS(app)  # 全局啟用跨域支持
db = Database()  # 初始化資料庫


# 註冊 Blueprint
app.register_blueprint(user_bp, url_prefix='/api/users')
app.register_blueprint(friend_bp, url_prefix='/api/friends')
app.register_blueprint(transaction_bp, url_prefix='/api/transactions')
app.register_blueprint(leaderboard_bp, url_prefix="/api/leaderboard")
=======
# 創建 Database 實例
db = Database()


# 測試路由
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Welcome to the Flask API"})
=======
    # 連接資料庫
    db.connect()

    #CodeExample
    # 新增使用者
    user_id = db.add_user("Monkey", "monkey@example.com", "hashed_password")

    

    # 關閉資料庫連線
    db.close()

    return "Hello, Flask!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
