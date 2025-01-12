from flask_sqlalchemy import SQLAlchemy
from flask import Flask

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:postgres@db:5432/mydatabase'
db = SQLAlchemy(app)

# 測試連線
try:
    with app.app_context():
        db.session.execute('SELECT 1')
        print("Database connection successful!")
except Exception as e:
    print(f"Error connecting to database: {e}")
