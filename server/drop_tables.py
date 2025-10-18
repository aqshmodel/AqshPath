
from database import engine, Base
import models # modelsをインポートしてBase.metadataに登録させる

print("Dropping all tables in the database...")

# Baseに紐づいているすべてのテーブルをデータベースから削除する
Base.metadata.drop_all(bind=engine)

print("Tables dropped successfully.")
