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


@leaderboard_bp.route("/score/<int:user_id>", methods=["GET"])
def get_user_score(user_id):
    """返回指定用戶的積分"""
    db = Database()
    db.connect()
    
    try:
        query = """
        SELECT name, credit_score
        FROM "User"
        WHERE user_ID = %s;
        """
        result = db.execute_query(query, (user_id,))
        if result:
            user_data = result[0]  # 假設只會有一筆資料
            return jsonify({
                "success": True,
                "data": {
                    "user_ID": user_id,
                    "name": user_data["name"],
                    "credit_score": user_data["credit_score"]
                }
            })
        else:
            return jsonify({"success": False, "message": "User not found"}), 404
    except Exception as e:
        print(f"Error fetching user score: {e}")
        return jsonify({"success": False, "message": "Error fetching user score"}), 500
    finally:
        db.close()





