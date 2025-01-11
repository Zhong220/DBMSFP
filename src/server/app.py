from flask import Flask, request, jsonify
from database import Database
from dotenv import load_dotenv
from flask_cors import CORS

# 加載環境變數
load_dotenv()

app = Flask(__name__)
CORS(app)  # 全局啟用跨域支持
db = Database()


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Welcome to the Flask API"})



@app.route("/api/split", methods=["POST"])
def split_transaction():
    """處理分帳請求"""
    try:
        db.connect()
        print("Route accessed")

        data = request.json
        print("Received payload:", data)
        if not data:
            return jsonify({"error": "Empty request body"}), 400

        item = data.get("item")
        amount = data.get("amount")
        description = data.get("description")
        category_id = data.get("category_id")
        payer_id = data.get("payer_id")
        splitters = data.get("splitters")  # 債務人 ID 的列表

        if not all([item, amount, description, category_id, payer_id, splitters]):
            return jsonify({"error": "Missing required fields"}), 400

        split_count = len(splitters)
        if split_count == 0:
            return jsonify({"error": "No splitters provided"}), 400

        split_amount = round(amount / split_count, 2)  # 均分金額

        transaction_id = db.create_transaction(
            item=item,
            amount=amount,
            description=description,
            category_id=category_id,
            payer_id=payer_id,
            split_count=split_count
        )

        if not transaction_id:
            print("Transaction creation failed: transaction_id is None")
            return jsonify({"error": "Transaction creation failed"}), 500

        for debtor_id in splitters:
            db.create_split(transaction_id, debtor_id, payer_id, split_amount)
            db.create_transaction_debtor(transaction_id, debtor_id, split_amount)

        return jsonify({"message": "Transaction created successfully", "transaction_id": transaction_id}), 201

    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        db.close()

