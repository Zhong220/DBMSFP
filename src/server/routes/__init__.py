from flask import Blueprint
from .user_routes import user_bp
from .transaction_routes import transaction_bp

__all__ = ["transaction_bp", "user_bp"]

  # 匯入 user_routes 中的 Blueprint

# 定義主 Blueprint，用於註冊子 Blueprint
def register_blueprints(app):
    app.register_blueprint(user_routes)  # 註冊使用者相關路由
