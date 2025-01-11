from flask import Flask, request, jsonify
from database import Database
from dotenv import load_dotenv
from flask_cors import CORS
from datetime import datetime
import logging

# 初始化应用与环境
load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
db = Database()
db.connect()

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 通用的 API 响应格式
def create_response(message="", data=None, error=None, status=200):
    return jsonify({"message": message, "data": data, "error": error}), status

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Welcome to the Flask API"})
@app.route("/api/split", methods=["POST"])
def split_transaction():
    """處理分帳請求"""
    try:
        logger.info("Connecting to database...")
        db.connect()

        logger.info("Parsing request data...")
        data = request.json
        logger.info(f"Request data: {data}")

        # 資料驗證
        required_fields = ["item", "amount", "description", "category_id", "payer_id", "transaction_date", "splitters"]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            logger.error(f"Missing fields: {missing_fields}")
            return create_response(error=f"Missing fields: {missing_fields}", status=400)

        transaction_date = datetime.strptime(data["transaction_date"], "%Y-%m-%d").date()

        logger.info("Creating transaction...")
        transaction_id = db.create_transaction(
            item=data["item"],
            amount=data["amount"],
            description=data["description"],
            transaction_date=transaction_date,
            category_id=data["category_id"],
            payer_id=data["payer_id"],
            split_count=len(data["splitters"]),
        )
        if not transaction_id:
            logger.error("Transaction creation failed.")
            return create_response(error="Transaction creation failed.", status=500)

        logger.info("Creating split and debtor records...")
        split_amount = round(data["amount"] / len(data["splitters"]), 2)
        for debtor_id in data["splitters"]:
            # 將每筆分帳資訊寫入 Split 表
            logger.info(f"Inserting split record for debtor_id={debtor_id}")
            db.create_split(transaction_id, debtor_id, data["payer_id"], split_amount)

            # 將每筆債務資訊寫入 Transaction_Debtor 表
            logger.info(f"Inserting debtor record for transaction_id={transaction_id}, debtor_id={debtor_id}")
            db.create_transaction_debtor(transaction_id, debtor_id, split_amount)

        logger.info(f"Transaction {transaction_id} created successfully.")
        return create_response(
            message="Transaction created successfully.",
            data={"transaction_id": transaction_id},
            status=201,
        )

    except Exception as e:
        logger.exception(f"Unexpected error: {e}")
        return create_response(error=f"An unexpected error occurred: {str(e)}", status=500)
    finally:
        db.close()


@app.route("/api/users", methods=["GET"])
def get_users():
    """返回测试用的用户列表"""
    try:
        users = [
            {"id": "1", "name": "Alice"},
            {"id": "2", "name": "Bob"},
            {"id": "3", "name": "Charlie"},
        ]
        logger.info(f"Fetched users: {users}")
        return create_response(data=users, status=200)
    except Exception as e:
        logger.exception(f"Error fetching users: {e}")
        return create_response(error="Failed to fetch users.", status=500)

@app.route("/api/friends/<int:user_id>", methods=["GET"])
def get_friends(user_id):
    """返回用户的好友列表"""
    try:
        db.connect()
        friends = db.get_friends_by_user_id(user_id)
        logger.info(f"Fetched friends for user {user_id}: {friends}")
        return create_response(data=friends, status=200)
    except Exception as e:
        logger.exception(f"Error fetching friends for user {user_id}: {e}")
        return create_response(error="Failed to fetch friends.", status=500)
    finally:
        db.close()

if __name__ == "__main__":
    app.run(debug=True, port=5005)

