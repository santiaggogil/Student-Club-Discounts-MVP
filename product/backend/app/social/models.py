from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    username = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    nombre = Column(String, nullable=True)
    foto_perfil = Column(String, nullable=True)
    biografia = Column(String, nullable=True)
    seguidores_privados = Column(Boolean, default=False, nullable=False)

