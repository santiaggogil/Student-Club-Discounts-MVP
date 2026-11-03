from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def run_migrations():
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    with engine.connect() as conn:
        if "users" in tables:
            columns = [c["name"] for c in inspector.get_columns("users")]
            if "telegram_chat_id" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN telegram_chat_id INTEGER"))
            if "telegram_usuario" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN telegram_usuario VARCHAR"))
            if "codigo_vinculacion" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN codigo_vinculacion VARCHAR"))
            if "vinculado_en" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN vinculado_en DATETIME"))
        
        if "telegram_config" not in tables:
            conn.execute(text("CREATE TABLE telegram_config (id INTEGER PRIMARY KEY, offset INTEGER DEFAULT 0)"))
        
        conn.commit()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
