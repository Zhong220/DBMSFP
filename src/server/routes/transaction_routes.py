#transaction_routes.py
from flask import Flask, request, jsonify
from flask import Blueprint
from database import Database
from dotenv import load_dotenv
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
        print("Database connected:", db.connection is not None)  # 打印连接状态
        query = '''
            SELECT
                t."transaction_id" AS transaction_id,
                t."item",
                t."amount",
                t."description",
                t."transaction_date",
                t."category_id" AS category_id,
                c."category_name",
                t."payer_id" AS payer_id,
                t."split_count"
            FROM "transaction" t
            LEFT JOIN "category" c
                ON t."category_id" = c."category_id"
        '''


        rows = db.execute_query(query)
        print("Query Result:", rows)  # 打印查询结果
        return create_response(data=rows, status=200)

    except Exception as e:
        print("Database connection error:", e)
        logger.exception("Error fetching transactions: %s", e)
        return create_response(error=str(e), status=500)

    finally:
        db.close()

@transaction_bp.route("/transaction/", methods=["POST"])
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
@transaction_bp.route("/split/", methods=["POST"])
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

        splits = data.get("split")
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
                    INSERT INTO transaction_debtor ("transaction_id", "debtor_id", "amount")
                    VALUES (%s, %s, %s)
                    """,
                    (transaction_id, debtor_id, float(amountVal))
                )

                # 同步插入 split (若想留更完整紀錄)
                db.execute_query(
                    """
                    INSERT INTO "split" ("transaction_id", "debtor_id", "payer_id", "amount")
                    VALUES (%s, %s, %s, %s)
                    """,
                    (transaction_id, debtor_id, payer_id, float(amountVal))
                )

        return create_response(message="split saved successfully.", status=201)

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

@transaction_bp.route("/split-bulk/", methods=["POST"])
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
    逐筆 INSERT 到 transaction_debtor + split
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

            # (1) transaction_debtor
            db.execute_query(
                """
                INSERT INTO transaction_debtor ("transaction_id", "debtor_id", "amount")
                VALUES (%s, %s, %s)
                """,
                (tx_id, debtor_id, amt)
            )

            # (2) split (小寫 s，確保和 schema.sql 裡的表名一致)
            db.execute_query(
                """
                INSERT INTO split ("transaction_id", "debtor_id", "payer_id", "amount")
                VALUES (%s, %s, %s, %s)
                """,
                (tx_id, debtor_id, payer_id, amt)
            )

        return create_response(message="Split lines saved successfully!", status=201)

    except Exception as e:
        logging.exception(f"Error saving split lines: {e}")
        return create_response(error=f"Split lines save failed: {str(e)}", status=500)
    finally:
        db.close()
