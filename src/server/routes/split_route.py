# server/routes/split.route.py
from flask import Flask, request, jsonify
from flask import Blueprint
from database import Database
from dotenv import load_dotenv
from flask_cors import CORS
from datetime import datetime
import logging

load_dotenv()

# 使用你的 Database 類別
db = Database()
db.connect()

split_bp = Blueprint('split_routes', __name__)

@split_bp.route("/", methods=["GET"])
def get_all_splits():
    """
    取得 split 資料表的全部紀錄
    讓 SplitPage.tsx 可以顯示目前所有分帳紀錄
    """
    try:
        db.connect()  # 確保連線
        rows = db.execute_query("""
            SELECT split_id, transaction_id, debtor_id, payer_id, amount
            FROM split
            ORDER BY split_id ASC
        """)
        
        # rows 可能是 list of dict，也可能是 list of tuple，視你的 Database 類別實作而定
        # 若是 list of tuple，就需要手動組裝成 dict
        data = []
        for r in rows:
            # 如果 r 是 dict，就寫:
            # data.append({
            #     "split_id": r["split_id"],
            #     "transaction_id": r["transaction_id"],
            #     "debtor_id": r["debtor_id"],
            #     "payer_id": r["payer_id"],
            #     "amount": float(r["amount"])
            # })

            # 如果 r 是 tuple，就寫:
            data.append({
                "split_id": r[0],
                "transaction_id": r[1],
                "debtor_id": r[2],
                "payer_id": r[3],
                "amount": float(r[4])
            })

        return jsonify({"data": data}), 200

    except Exception as e:
        # 如果 Database 裡面有 transaction 概念，也可在這裡做 rollback
        return jsonify({"error": str(e)}), 500

    finally:
        db.close()  # 查詢完畢關閉連線

@split_bp.route("/splits", methods=["POST"])
def create_splits():
    """
    接收前端傳來的一組分帳資料，逐筆 insert 進 split 表
    前端格式:
      [
        { "transactionId": 10, "debtorId": 3, "payerId": 1, "amount": 100 },
        { "transactionId": 11, "debtorId": 5, "payerId": 2, "amount": 250 },
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

            db.execute_query("""
                INSERT INTO split (transaction_id, debtor_id, payer_id, amount)
                VALUES (%s, %s, %s, %s)
            """, (tx_id, debtor_id, payer_id, amt))

        return jsonify({"message": "Split lines inserted successfully"}), 201

    except Exception as e:
        # 需要 rollback 的話，看你 Database 實作
        return jsonify({"error": str(e)}), 500

    finally:
        db.close()
