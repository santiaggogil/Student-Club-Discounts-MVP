from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class OfertaComunitaria(Base):
    __tablename__ = "ofertas_comunitarias"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    precio = Column(Float, nullable=False)
    ubicacion = Column(String, nullable=False)
    vigencia = Column(DateTime, nullable=False)
    descripcion = Column(String, nullable=False)
    imagen = Column(String, nullable=True)
    autor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    calificaciones = relationship("Calificacion", back_populates="oferta")

class Calificacion(Base):
    __tablename__ = "calificaciones"
    id = Column(Integer, primary_key=True, index=True)
    oferta_id = Column(Integer, ForeignKey("ofertas_comunitarias.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    puntuacion = Column(Integer, nullable=False)
    oferta = relationship("OfertaComunitaria", back_populates="calificaciones")