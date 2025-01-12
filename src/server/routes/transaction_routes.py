from flask import Flask, request, jsonify
from flask import Blueprint
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

transaction_bp = Blueprint("transaction_bp", __name__)

@transaction_bp.route("/api/transactions", methods=["GET"])
def get_transactions():
    """获取所有交易记录"""
    try:
        db.connect()
        transactions = db.execute_query('SELECT * FROM transactions')
        logger.info("Fetched transactions: %s", transactions)
        return create_response(data=transactions, status=200)
    except Exception as e:
        logger.exception("Error fetching transactions: %s", e)
        return create_response(error="Failed to fetch transactions.", status=500)
    finally:
        db.close()

@transaction_bp.route("/api/split", methods=["POST"])
def split_transaction():
    """处理分账请求"""
    try:
        logger.info("Connecting to database...")
        db.connect()

        logger.info("Parsing request data...")
        data = request.json
        logger.info(f"Request data: {data}")

        # 数据验证
        required_fields = ["item", "amount", "description", "category_id", "payer_id", "transaction_date", "splitters"]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            logger.error(f"Missing fields: {missing_fields}")
            return create_response(error=f"Missing fields: {missing_fields}", status=400)

        transaction_date = datetime.strptime(data["transaction_date"], "%Y-%m-%d").date()

        logger.info("Creating transaction...")
        transaction_id = db.execute_query(
            '''
            INSERT INTO transactions (item, amount, description, transaction_date, category_ID, payer_ID, split_count)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING transaction_ID
            ''',
            (data["item"], data["amount"], data["description"], transaction_date, data["category_id"], data["payer_id"], len(data["splitters"]))
        )
        transaction_id = transaction_id[0]["transaction_id"]

        logger.info("Creating split and debtor records...")
        split_amount = round(data["amount"] / len(data["splitters"]), 2)
        for debtor_id in data["splitters"]:
            # 将每笔分账信息写入 Split 表
            logger.info(f"Inserting split record for debtor_id={debtor_id}")
            db.execute_query(
                '''
                INSERT INTO split (transaction_ID, debtor_ID, payer_ID, amount)
                VALUES (%s, %s, %s, %s)
                ''',
                (transaction_id, debtor_id, data["payer_id"], split_amount)
            )

            # 将每笔债务信息写入 Transaction_Debtor 表
            logger.info(f"Inserting debtor record for transaction_id={transaction_id}, debtor_id={debtor_id}")
            db.execute_query(
                '''
                INSERT INTO transaction_debtor (transaction_ID, debtor_ID, amount)
                VALUES (%s, %s, %s)
                ''',
                (transaction_id, debtor_id, split_amount)
            )

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

@transaction_bp.route("/api/users", methods=["GET"])
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

@transaction_bp.route("/api/friends/<int:user_id>", methods=["GET"])
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
