from flask import Blueprint, request, jsonify
from database import db

transaction_bp = Blueprint('transaction_bp', __name__)

@transaction_bp.route('/create', methods=['POST'])
def create_transaction():
    data = request.json
    item = data.get('item')
    amount = data.get('amount')
    description = data.get('description')
    transaction_date = data.get('transaction_date')
    category_id = data.get('category_id')
    payer_id = data.get('payer_id')
    split_count = data.get('split_count')

    try:
        db.execute_query(
            '''
            INSERT INTO "transactions" (item, amount, description, transaction_date, category_ID, payer_ID, split_count)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ''',
            (item, amount, description, transaction_date, category_id, payer_id, split_count)
        )
        return jsonify({"message": "Transaction created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@transaction_bp.route('/list', methods=['GET'])
def get_transactions():
    """獲取所有交易記錄"""
    try:
        transactions = db.execute_query('SELECT * FROM transactions')
        return jsonify(transactions), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@transaction_bp.route('/split', methods=['POST'])
def split_transaction():
    """處理分帳請求"""
    data = request.json
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

    try:
        transaction_id = db.execute_query(
            '''
            INSERT INTO transactions (item, amount, description, transaction_date, category_ID, payer_ID, split_count)
            VALUES (%s, %s, %s, CURRENT_DATE, %s, %s, %s)
            RETURNING transaction_ID
            ''',
            (item, amount, description, category_id, payer_id, split_count)
        )
        transaction_id = transaction_id[0]["transaction_id"]

        # 插入分帳記錄和債務人記錄
        for debtor_id in splitters:
            db.execute_query(
                '''
                INSERT INTO split (transaction_ID, debtor_ID, payer_ID, amount)
                VALUES (%s, %s, %s, %s)
                ''',
                (transaction_id, debtor_id, payer_id, split_amount)
            )
            db.execute_query(
                '''
                INSERT INTO transaction_debtor (transaction_ID, debtor_ID, amount)
                VALUES (%s, %s, %s)
                ''',
                (transaction_id, debtor_id, split_amount)
            )

        return jsonify({"message": "Transaction and splits created successfully", "transaction_id": transaction_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
