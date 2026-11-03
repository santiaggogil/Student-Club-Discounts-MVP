import os, uuid, unicodedata
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.ofertas.models import OfertaComunitaria, Calificacion
from app.ofertas.schemas import OfertaResponse
from app.ofertas.repository import OfertaRepository

class OfertaService:
    @staticmethod
    def _normalizar(texto: str) -> str:
        return unicodedata.normalize('NFKD', texto.lower()).encode('ASCII', 'ignore').decode('utf-8')

    @staticmethod
    def obtener_feed(db: Session, page: int, size: int, orden: str, q: str | None, user_id: int | None) -> list[OfertaResponse]:
        query = db.query(OfertaComunitaria)
        if q:
            norm_q = OfertaService._normalizar(q)
            query = query.filter(or_(func.lower(OfertaComunitaria.titulo).contains(norm_q), func.lower(OfertaComunitaria.descripcion).contains(norm_q), func.lower(OfertaComunitaria.ubicacion).contains(norm_q)))
        ofertas = query.all()
        return [OfertaService._formatear_oferta(db, o, user_id) for o in ofertas]

    @staticmethod
    def _formatear_oferta(db: Session, oferta: OfertaComunitaria, user_id: int | None) -> OfertaResponse:
        calificaciones = db.query(Calificacion).filter(Calificacion.oferta_id == oferta.id).all()
        promedio = sum(c.puntuacion for c in calificaciones) / len(calificaciones) if calificaciones else 0.0
        mi_cal = None
        if user_id:
            c = db.query(Calificacion).filter(Calificacion.oferta_id == oferta.id, Calificacion.usuario_id == user_id).first()
            if c: mi_cal = c.puntuacion
        return OfertaResponse(id=oferta.id, titulo=oferta.titulo, precio=oferta.precio, ubicacion=oferta.ubicacion, vigencia=oferta.vigencia, descripcion=oferta.descripcion, imagen=oferta.imagen, autor_id=oferta.autor_id, autor_username=oferta.autor.username, promedio_calificacion=promedio, total_calificaciones=len(calificaciones), vigente=True, vence_en="", mi_calificacion=mi_cal)

    @staticmethod
    def obtener_oferta(db: Session, oferta_id: int, user_id: int | None) -> OfertaResponse:
        o = db.query(OfertaComunitaria).filter(OfertaComunitaria.id == oferta_id).first()
        return OfertaService._formatear_oferta(db, o, user_id)