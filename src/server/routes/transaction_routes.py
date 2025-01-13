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
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3001"}})
db = Database()
db.connect()

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 通用的 API 响应格式
def create_response(message="", data=None, error=None, status=200):
    return jsonify({"message": message, "data": data, "error": error}), status

transaction_bp = Blueprint("transaction_bp", __name__)

@transaction_bp.route("/", methods=["GET"])
def get_transactions():
    """获取所有交易记录
    """
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

@transaction_bp.route("/split", methods=["POST"])
def split_transaction():
    """处理分账请求
    """
    try:
        logger.info("Connecting to database...")
        db.connect()

        logger.info("Parsing request data...")
        data = request.json
        logger.info(f"Request data: {data}")

        # 数据验证
        required_fields = ["item", "amount", "description", "transaction_date","category_id", "payer_id", "splitters"]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            logger.error(f"Missing fields: {missing_fields}")
            return create_response(error=f"Missing fields: {missing_fields}", status=400)

        # 验证 category_id 是否有效
        category = db.execute_query("SELECT * FROM Category WHERE category_ID = %s", (data["category_id"],))
        logger.info("%s",data["category_id"]),
        if not category:
            logger.error(f"Invalid category_id: {data['category_id']}")
            return create_response(error="Invalid category ID.", status=400)

        transaction_date = datetime.strptime(data["transaction_date"], "%Y-%m-%d").date()

        logger.info("Creating transaction..."),
        logger.info("Inserting transaction with data: item=%s, amount=%s, description=%s, transaction_date=%s, category_id=%s, payer_id=%s, split_count=%s",
            data["item"], data["amount"], data["description"], transaction_date, data["category_id"], data["payer_id"], len(data["splitters"]))
        transaction_id = db.create_transaction(
            item=data["item"],
            amount=data["amount"],
            description=data["description"],
            transaction_date=transaction_date,
            category_id=data["category_id"],
            payer_id=data["payer_id"],
            split_count=len(data["splitters"]),

            )
        logger.info(f"Transaction creation result: {transaction_id}")
        if not transaction_id:
            logger.error("Transaction creation failed: No transaction ID returned.")
            return create_response(error="Transaction creation failed.", status=500)

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

@transaction_bp.route("/users", methods=["GET"])
def get_users():
    """返回测试用的用户列表
    """
    try:
        db.connect()
        users = [
            {"id": "6", "name": "testuser"},
            {"id": "13", "name": "monkey"},
            {"id": "14", "name": "monkey"},
        ]
        logger.info(f"Fetched users: {users}")
        return create_response(data=users, status=200)
    except Exception as e:
        logger.exception(f"Error fetching users: {e}")
        return create_response(error="Failed to fetch users.", status=500)
    finally:
        db.close()

@transaction_bp.route("/friends/<int:user_id>", methods=["GET"])
def get_friends(user_id):
    """返回用户的好友列表
    """
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

@transaction_bp.route("/categories", methods=["GET"])
def get_categories():
    """取得所有交易类别
    """
    try:
        db.connect()
        categories = db.execute_query("SELECT * FROM Category")
        if not categories:
            return create_response(message="No categories found.", status=404)
        return create_response(data=categories, status=200)
    except Exception as e:
        logger.exception(f"Error fetching categories: {e}")
        return create_response(error="Failed to fetch categories.", status=500)
    finally:
        db.close()

if __name__ == "__main__":
    app.run(debug=True)

