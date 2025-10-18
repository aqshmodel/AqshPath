
# -*- coding: utf-8 -*-

from database import engine, Base
import models

print("Creating tables in the database...")

# Baseに紐づいているすべてのテーブルをデータベース内に作成する
Base.metadata.create_all(bind=engine)

print("Tables created successfully.")
