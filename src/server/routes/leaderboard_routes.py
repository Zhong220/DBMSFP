from flask import Blueprint, jsonify, request
from database import Database

leaderboard_bp = Blueprint("leaderboard", __name__)

@leaderboard_bp.route("/top", methods=["GET"])
def get_leaderboard():
    """返回排行榜數據"""
    limit = request.args.get("limit", 10, type=int)
    db = Database()
    db.connect()
    leaderboard = db.get_leaderboard_from_redis(limit)
    db.close()

    data = []
    for index, (entry, score) in enumerate(leaderboard):
        name, user_id = entry.split("|")
        data.append({"rank": index + 1, "name": name, "user_ID": user_id, "credit_score": score})

    return jsonify({"success": True, "data": data})

@leaderboard_bp.route("/update", methods=["POST"])
def update_leaderboard():
    """手動更新排行榜數據"""
    db = Database()
    db.connect()
    db.update_leaderboard_in_redis()
    db.close()
    return jsonify({"success": True, "message": "Leaderboard updated"})





