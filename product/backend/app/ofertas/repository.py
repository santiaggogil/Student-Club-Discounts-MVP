from sqlalchemy.orm import Session
from sqlalchemy import func
from app.ofertas.models import OfertaComunitaria, Calificacion
from app.ofertas.schemas import OfertaCreate
from datetime import datetime

class OfertaRepository:
    @staticmethod
    def crear(db: Session, data: OfertaCreate, imagen_url: str | None, autor_id: int) -> OfertaComunitaria:
        oferta = OfertaComunitaria(
            titulo=data.titulo,
            precio=data.precio,
            ubicacion=data.ubicacion,
            vigencia=data.vigencia,
            descripcion=data.descripcion,
            imagen=imagen_url,
            autor_id=autor_id
        )
        db.add(oferta)
        db.commit()
        db.refresh(oferta)
        return oferta

    @staticmethod
    def listar_vigentes(db: Session, page: int = 1, size: int = 10) -> list[OfertaComunitaria]:
        now = datetime.now()
        offset = (page - 1) * size
        return db.query(OfertaComunitaria).filter(OfertaComunitaria.vigencia > now).offset(offset).limit(size).all()

    @staticmethod
    def obtener_por_id(db: Session, oferta_id: int) -> OfertaComunitaria:
        return db.query(OfertaComunitaria).filter(OfertaComunitaria.id == oferta_id).first()

    @staticmethod
    def guardar_calificacion(db: Session, oferta_id: int, usuario_id: int, puntuacion: int):
        cal = db.query(Calificacion).filter(Calificacion.oferta_id == oferta_id, Calificacion.usuario_id == usuario_id).first()
        if cal:
            cal.puntuacion = puntuacion
        else:
            cal = Calificacion(oferta_id=oferta_id, usuario_id=usuario_id, puntuacion=puntuacion)
            db.add(cal)
        db.commit()

    @staticmethod
    def calcular_promedio(db: Session, oferta_id: int) -> float:
        res = db.query(func.avg(Calificacion.puntuacion)).filter(Calificacion.oferta_id == oferta_id).scalar()
        return float(res) if res else 0.0