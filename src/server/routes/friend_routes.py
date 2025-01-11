from flask import Blueprint, request, jsonify
from database import db

friend_bp = Blueprint('friend', __name__)

@friend_bp.route('/add', methods=['POST'])
def add_friend():
    data = request.json
    user_id = data.get('user_id')
    friend_id = data.get('friend_id')
    nickname = data.get('nickname')

    if not user_id or not friend_id:
        return jsonify({"error": "Missing user_id or friend_id"}), 400

    try:
        db.execute(
            '''
            INSERT INTO Friend_List (user_ID, friend_ID, nickname)
            VALUES (%s, %s, %s)
            ''',
            (user_id, friend_id, nickname)
        )
        db.commit()
        return jsonify({"message": "Friend added successfully"}), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

@friend_bp.route('/delete', methods=['DELETE'])
def delete_friend():
    data = request.json
    user_id = data.get('user_id')
    friend_id = data.get('friend_id')

    try:
        db.execute(
            '''
            DELETE FROM Friend_List WHERE user_ID = %s AND friend_ID = %s
            ''',
            (user_id, friend_id)
        )
        db.commit()
        return jsonify({"message": "Friend deleted successfully"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
