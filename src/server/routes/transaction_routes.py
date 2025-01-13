from flask import Flask, request, jsonify
from flask import Blueprint
from database import Database
from dotenv import load_dotenv
from flask_cors import CORS
from datetime import datetime
import logging

load_dotenv()
db = Database()
db.connect()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

transaction_bp = Blueprint("transaction_bp", __name__)

def create_response(message="", data=None, error=None, status=200):
    return jsonify({"message": message, "data": data, "error": error}), status

# ★ 修改點 (1)：抓取交易 (get_transactions)
@transaction_bp.route("/", methods=["GET"])
def get_transactions():
    """
    不 JOIN transaction_debtor:
    只帶回 transaction 基本資訊 + category_name。
    """
    try:
        db.connect()
        query = '''
            SELECT
                t."transaction_ID",
                t."item",
                t."amount",
                t."description",
                t."transaction_date",
                t."category_ID",
                c."category_name",
                t."payer_ID",
                t."split_count"
            FROM transactions t
            LEFT JOIN category c
                ON t."category_ID" = c."category_ID"
        '''
        rows = db.execute_query(query)
        return create_response(data=rows, status=200)

    except Exception as e:
        logger.exception("Error fetching transactions: %s", e)
        return create_response(error=str(e), status=500)

    finally:
        db.close()

@transaction_bp.route("/transactions", methods=["POST"])
def add_transaction():
    """
    新增交易 (例如在 /accounting 頁面用),
    預設付款人 payer_id = 使用者自己。
    排除自己在 splitters 裡面 (防止自己欠自己)。
    """
    try:
        db.connect()
        data = request.json
        # 檢查必填欄位
        required = ["item", "amount", "description", "transaction_date", "category_id", "payer_id", "splitters"]
        missing = [f for f in required if f not in data]
        if missing:
            return create_response(error=f"Missing fields: {missing}", status=400)

        payer_id = data["payer_id"]
        # 排除自己
        filtered_splitters = [d for d in data["splitters"] if d != payer_id]

        # 建立交易
        tx_id = db.create_transaction(
            item=data["item"],
            amount=data["amount"],
            description=data["description"],
            transaction_date=data["transaction_date"],
            category_id=data["category_id"],
            payer_id=payer_id,
            split_count=len(filtered_splitters)
        )

        if filtered_splitters:
            split_amount = round(float(data["amount"]) / len(filtered_splitters), 2)
            for debtor_id in filtered_splitters:
                db.create_transaction_debtor(tx_id, debtor_id, split_amount)

        return create_response(message="Transaction added successfully.", data={"transaction_id": tx_id}, status=201)
    except Exception as e:
        logger.exception("Error adding transaction: %s", e)
        return create_response(error="Failed to add transaction.", status=500)
    finally:
        db.close()

# ★ 修改點 (2)：分帳 (save_splits_for_existing_transactions)
@transaction_bp.route("/splits", methods=["POST"])
def save_splits_for_existing_transactions():
    """
    前端送來：
    {
      "splits": {
        "3": {"2": 25},
        "5": {"2": 25}
      },
      "transaction_ids": [10, 11]
    }
    預設只用 transaction_ids[0]，一筆筆插入 transaction_debtor & Split。
    """
    try:
        db.connect()
        data = request.json or {}

        splits = data.get("splits")
        if not splits:
            return create_response(error="缺少 splits", status=400)

        tx_ids = data.get("transaction_ids", [])
        if not tx_ids:
            return create_response(error="缺少 transaction_ids", status=400)

        transaction_id = tx_ids[0]  # 全部都插到第一筆交易

        for debtorIdStr, creditorsDict in splits.items():
            debtor_id = int(debtorIdStr)
            for payerIdStr, amountVal in creditorsDict.items():
                payer_id = int(payerIdStr)

                # 寫入 transaction_debtor
                db.execute_query(
                    """
                    INSERT INTO transaction_debtor (transaction_ID, debtor_ID, amount)
                    VALUES (%s, %s, %s)
                    """,
                    (transaction_id, debtor_id, float(amountVal))
                )

                # 同步插入 Split (若您想留更完整紀錄)
                db.execute_query(
                    """
                    INSERT INTO "Split" (transaction_ID, debtor_ID, payer_ID, amount)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (transaction_id, debtor_id, payer_id, float(amountVal))
                )

        return create_response(message="Splits saved successfully.", status=201)

    except Exception as e:
        logger.exception(f"Error saving splits: {e}")
        return create_response(error=f"儲存 splits 失敗: {str(e)}", status=500)

    finally:
        db.close()
#
# 其餘如 get_friends, get_users, split_transaction()... 看您需求保留
#


#
# 例如保留一個 split_transaction() 來「一次性創建交易 + 分帳」,
# 同樣別忘了排除自己:
#
@transaction_bp.route("/split", methods=["POST"])
def split_transaction():
    """
    可能舊功能: 一次性創建新交易 + 直接分帳
    """
    try:
        db.connect()
        data = request.json

        required_fields = ["item", "amount", "description", "category_id", "payer_id", "transaction_date", "splitters"]
        missing_fields = [f for f in required_fields if f not in data]
        if missing_fields:
            return create_response(error=f"Missing fields: {missing_fields}", status=400)

        # 排除自己
        payer_id = data["payer_id"]
        filtered_splitters = [d for d in data["splitters"] if d != payer_id]

        transaction_date = datetime.strptime(data["transaction_date"], "%Y-%m-%d").date()

        # 建交易
        rows = db.execute_query(
            '''
            INSERT INTO transactions (item, amount, description, transaction_date, category_ID, payer_ID, split_count)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING transaction_ID
            ''',
            (data["item"], data["amount"], data["description"], transaction_date, data["category_id"], payer_id, len(filtered_splitters))
        )
        transaction_id = rows[0]["transaction_id"]

        # 寫入 transaction_debtor, split
        if filtered_splitters:
            split_amount = round(data["amount"] / len(filtered_splitters), 2)
            for debtor_id in filtered_splitters:
                db.execute_query(
                    '''
                    INSERT INTO transaction_debtor (transaction_ID, debtor_ID, amount)
                    VALUES (%s, %s, %s)
                    ''',
                    (transaction_id, debtor_id, split_amount)
                )
                db.execute_query(
                    '''
                    INSERT INTO "Split" (transaction_ID, debtor_ID, payer_ID, amount)
                    VALUES (%s, %s, %s, %s)
                    ''',
                    (transaction_id, debtor_id, payer_id, split_amount)
                )

        return create_response(message="Transaction created + splitted ok.", data={"transaction_id": transaction_id}, status=201)
    except Exception as e:
        logger.exception(f"split_transaction error: {e}")
        return create_response(error=str(e), status=500)
    finally:
        db.close()

@transaction_bp.route("/split-bulk", methods=["POST"])
def save_split_lines():
    """
    前端傳來:
    {
      "lines": [
        { "transactionId": 10, "debtorId": 3, "payerId": 2, "amount": 100 },
        { "transactionId": 11, "debtorId": 5, "payerId": 2, "amount": 25 },
        ...
      ]
    }
    逐筆 INSERT 到 transaction_debtor / Split
    """
    try:
        db.connect()
        data = request.json or {}
        lines = data.get("lines", [])

        if not lines:
            return create_response(error="No split lines provided", status=400)

        for line in lines:
            tx_id = line["transactionId"]
            debtor_id = line["debtorId"]
            payer_id = line["payerId"]
            amt = float(line["amount"])

            # (1) 寫入 transaction_debtor
            db.execute_query(
                """
                INSERT INTO transaction_debtor (transaction_ID, debtor_ID, amount)
                VALUES (%s, %s, %s)
                """,
                (tx_id, debtor_id, amt)
            )
            # (2) 寫入 Split
            db.execute_query(
                """
                INSERT INTO "Split" (transaction_ID, debtor_ID, payer_ID, amount)
                VALUES (%s, %s, %s, %s)
                """,
                (tx_id, debtor_id, payer_id, amt)
            )

        return create_response(message="Split lines saved successfully!", status=201)

    except Exception as e:
        logger.exception(f"Error saving split lines: {e}")
        return create_response(error=f"Split lines save failed: {str(e)}", status=500)
    finally:
        db.close()
