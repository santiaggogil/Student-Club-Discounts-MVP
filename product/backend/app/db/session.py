from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def run_migrations():
    inspector = inspect(engine)
    if "users" in inspector.get_table_names():
        columns = [c["name"] for c in inspector.get_columns("users")]
        with engine.connect() as conn:
            if "nombre" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN nombre VARCHAR"))
            if "foto_perfil" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN foto_perfil VARCHAR"))
            if "biografia" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN biografia VARCHAR"))
            if "seguidores_privados" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN seguidores_privados BOOLEAN DEFAULT 0 NOT NULL"))
            conn.commit()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
