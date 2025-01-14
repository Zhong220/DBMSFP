# server/routes/split.route.py
from flask import Flask, request, jsonify
from flask import Blueprint
from database import Database
from dotenv import load_dotenv
from flask_cors import CORS
from datetime import datetime
import logging

load_dotenv()

db = Database()  # 你自己的 Database 類別
db.connect()

split_bp = Blueprint('split_routes', __name__)

@split_bp.route("/", methods=["GET"])
def get_splits():
    """
    從資料庫中獲取所有分帳紀錄。
    """
    try:
        db.connect()

        # SQL 查詢語句
        query = """
            SELECT
                s."split_ID",
                s."transaction_ID",
                s."debtor_ID",
                s."payer_ID",
                s."amount",
                t."item" AS "transaction_item",
                t."description" AS "transaction_description"
            FROM "split" s
            LEFT JOIN "transactions" t
                ON s."transaction_ID" = t."transaction_ID"
        """
        results = db.execute_query(query)

        return jsonify({"data": results}), 200

    except Exception as e:
        logging.exception(f"無法取得分帳紀錄: {e}")
        return jsonify({"error": f"伺服器錯誤: {str(e)}"}), 500

    finally:
        db.close()


@split_bp.route("/splits", methods=["POST"])
def create_splits():
    """
    接收前端傳來的一組分帳資料，逐筆 INSERT 進 "split" 表 (大寫欄位)
    預期前端格式:
      [
        { transactionId: 10, debtorId: 3, payerId: 1, amount: 100 },
        { transactionId: 11, debtorId: 5, payerId: 2, amount: 250 },
        ...
      ]
    """
    try:
        new_splits = request.json  # 預期是一個陣列

        db.connect()
        for line in new_splits:
            tx_id = line["transactionId"]
            debtor_id = line["debtorId"]
            payer_id = line["payerId"]
            amt = float(line["amount"])

            # ★ INSERT 時，同樣要對 "transaction_ID", "debtor_ID" 等加雙引號
            db.execute_query("""
                INSERT INTO "split" ("transaction_ID", "debtor_ID", "payer_ID", "amount")
                VALUES (%s, %s, %s, %s)
            """, (tx_id, debtor_id, payer_id, amt))

        return jsonify({"message": "Split lines inserted successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        db.close()
