from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
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
