from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, UniqueConstraint, DateTime
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
    telegram_chat_id = Column(Integer, nullable=True)
    telegram_usuario = Column(String, nullable=True)
    codigo_vinculacion = Column(String, nullable=True)
    vinculado_en = Column(DateTime, nullable=True)

class Seguimiento(Base):
    __tablename__ = "seguimientos"
    id = Column(Integer, primary_key=True, index=True)
    seguidor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seguido_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    __table_args__ = (
        UniqueConstraint('seguidor_id', 'seguido_id', name='uq_seguidor_seguido'),
    )

class TelegramConfig(Base):
    __tablename__ = "telegram_config"
    id = Column(Integer, primary_key=True)
    offset = Column(Integer, default=0)
