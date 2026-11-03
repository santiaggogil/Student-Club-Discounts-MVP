from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, UniqueConstraint
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

class Seguimiento(Base):
    __tablename__ = "seguimientos"
    id = Column(Integer, primary_key=True, index=True)
    seguidor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seguido_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    __table_args__ = (
        UniqueConstraint('seguidor_id', 'seguido_id', name='uq_seguidor_seguido'),
    )
