from sqlalchemy.orm import Session
from app.ofertas.models import OfertaComunitaria
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
    def listar_vigentes(db: Session) -> list[OfertaComunitaria]:
        now = datetime.now()
        return db.query(OfertaComunitaria).filter(OfertaComunitaria.vigencia > now).all()
