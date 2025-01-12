import pytest
import sqlite3
from database import Database  # 假設 database.py 在同一目錄下

# 創建一個測試用的 Database 類別，來覆蓋 `connect` 方法
class TestDatabase(Database):
    def connect(self):
        """建立 SQLite 記憶體資料庫的連線"""
        if self.connection is None:
            self.connection = sqlite3.connect(":memory:")  # 使用 SQLite 記憶體資料庫
            self.connection.row_factory = sqlite3.Row  # 設定返回字典格式的查詢結果

# 使用 pytest fixture 初始化資料庫連線
@pytest.fixture
def db():
    test_db = TestDatabase()  # 使用測試用的 Database 類別
    test_db.connect()  # 連接到 SQLite 記憶體資料庫
    yield test_db  # 讓測試可以使用 db 實例
    test_db.close()  # 測試結束後關閉資料庫連線

def test_add_user(db):
    # 測試新增用戶
    user_id = db.add_user("Alice", "alice@example.com", "hashedpassword")
    assert user_id is not None

def test_get_user_by_id(db):
    # 測試根據 ID 查詢用戶
    user_id = db.add_user("Bob", "bob@example.com", "hashedpassword")
    user = db.get_user_by_id(user_id)
    assert user is not None
    assert user["name"] == "Bob"

def test_create_category(db):
    # 測試新增類別
    category_id = db.create_category("Food")
    assert category_id is not None
