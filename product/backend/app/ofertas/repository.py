from sqlalchemy.orm import Session, joinedload
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
    def listar_vigentes(db: Session, page: int = 1, size: int = 10, orden: str = "relevancia") -> list[OfertaComunitaria]:
        now = datetime.now()
        query = db.query(OfertaComunitaria).options(joinedload(OfertaComunitaria.autor)).filter(OfertaComunitaria.vigencia > now)
        
        if orden == "recientes":
            query = query.order_by(OfertaComunitaria.id.desc())
        else:
            # Relevancia: Ordenar por promedio de calificación descendente, total de calificaciones descendente y fecha de vigencia/id desc
            # En SQLAlchemy, realizamos el cálculo o cargamos y ordenamos en servicio si se prefiere exactitud, o mediante subconsultas/joins.
            # Como SQLite soporta subconsultas y joins con funciones de agregación, implementaremos ordenamiento eficiente.
            pass
            
        # Para asegurar flexibilidad y robustez en la combinación de relevancia (promedio, total y vigencia),
        # podemos recuperar las vigentes y aplicar el ordenamiento en memoria o mediante una consulta optimizada.
        # Dado el paginado, recuperamos todas las vigentes o aplicamos la lógica.
        ofertas = query.all()
        
        # Ordenamiento en memoria para aplicar reglas exactas de relevancia (promedio desc, total desc, id desc)
        def clave_relevancia(o):
            prom = OfertaRepository.calcular_promedio(db, o.id)
            tot = len(o.calificaciones) if o.calificaciones else 0
            return (prom, tot, o.id)

        if orden == "recientes":
            ofertas.sort(key=lambda o: o.id, reverse=True)
        else:
            ofertas.sort(key=clave_relevancia, reverse=True)
            
        offset = (page - 1) * size
        return ofertas[offset:offset + size]

    @staticmethod
    def obtener_por_id(db: Session, oferta_id: int) -> OfertaComunitaria:
        return db.query(OfertaComunitaria).options(joinedload(OfertaComunitaria.autor)).filter(OfertaComunitaria.id == oferta_id).first()

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
