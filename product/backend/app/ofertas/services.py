import os
import sys
import uuid
from pathlib import Path
from urllib.parse import quote
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.ofertas.schemas import OfertaCreate, OfertaResponse
from app.ofertas.repository import OfertaRepository
from app.ofertas.models import OfertaComunitaria

bot_path = Path(__file__).resolve().parent.parent.parent / "bot"
if str(bot_path) not in sys.path:
    sys.path.insert(0, str(bot_path))

from bot_ofertas import RepositorioOfertas, cargar_sedes

UPLOAD_DIR = "backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

FORMATOS_VALIDOS = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/jpg"}

class OfertaService:
    @staticmethod
    def procesar_y_guardar_imagen(file: UploadFile) -> str:
        if file.content_type not in FORMATOS_VALIDOS:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Formato de imagen no permitido: {file.content_type}."
            )
        try:
            contents = file.file.read()
            ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
            filename = f"{uuid.uuid4()}{ext}"
            filepath = os.path.join(UPLOAD_DIR, filename)
            with open(filepath, "wb") as f:
                f.write(contents)
            return f"/api/v1/uploads/{quote(filename)}"
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="La carga o el procesamiento de la imagen falló."
            )

    @staticmethod
    def publicar_oferta(db: Session, data: OfertaCreate, file: UploadFile, autor_id: int) -> OfertaResponse:
        imagen_url = OfertaService.procesar_y_guardar_imagen(file)
        oferta = OfertaRepository.crear(db, data, imagen_url, autor_id)
        return OfertaService._formatear_oferta(db, oferta)

    @staticmethod
    def editar_oferta(db: Session, oferta_id: int, data: OfertaCreate, file: UploadFile | None, autor_id: int) -> OfertaResponse:
        oferta = OfertaRepository.obtener_por_id(db, oferta_id)
        if not oferta:
            raise HTTPException(status_code=404, detail="Oferta no encontrada")
        if oferta.autor_id != autor_id:
            raise HTTPException(status_code=403, detail="No tienes permiso para editar esta oferta")
        
        imagen_url = OfertaService.procesar_y_guardar_imagen(file) if file else None
        oferta = OfertaRepository.actualizar(db, oferta, data, imagen_url)
        return OfertaService._formatear_oferta(db, oferta)

    @staticmethod
    def eliminar_oferta(db: Session, oferta_id: int, autor_id: int):
        oferta = OfertaRepository.obtener_por_id(db, oferta_id)
        if not oferta:
            raise HTTPException(status_code=404, detail="Oferta no encontrada")
        if oferta.autor_id != autor_id:
            raise HTTPException(status_code=403, detail="No tienes permiso para eliminar esta oferta")
        OfertaRepository.eliminar(db, oferta)

    @staticmethod
    def _formatear_oferta(db: Session, oferta: OfertaComunitaria) -> OfertaResponse:
        promedio = OfertaRepository.calcular_promedio(db, oferta.id)
        total = len(oferta.calificaciones) if oferta.calificaciones else 0
        now = datetime.now()
        resp = OfertaResponse(
            id=oferta.id,
            titulo=oferta.titulo,
            precio=oferta.precio,
            ubicacion=oferta.ubicacion,
            vigencia=oferta.vigencia,
            descripcion=oferta.descripcion,
            imagen=oferta.imagen,
            autor_id=oferta.autor_id,
            autor_username=oferta.autor.username if oferta.autor else None,
            promedio_calificacion=promedio,
            total_calificaciones=total,
            vigente=oferta.vigencia > now,
            vence_en=oferta.vigencia.isoformat()
        )
        return resp

    @staticmethod
    def obtener_feed(db: Session, page: int, size: int, orden: str = "relevancia") -> list[OfertaResponse]:
        if orden not in ["relevancia", "recientes"]:
            raise HTTPException(status_code=422, detail="Parámetro de orden inválido. Use 'relevancia' o 'recientes'.")
        ofertas = OfertaRepository.listar_vigentes(db, page, size, orden)
        return [OfertaService._formatear_oferta(db, o) for o in ofertas]

    @staticmethod
    def obtener_datos_mapa():
        try:
            db_file = bot_path / "ofertas_bot.db"
            repo = RepositorioOfertas(db_file)
            ofertas = repo.ofertas_vigentes()
            sedes = cargar_sedes().get("sedes", {})
            return {"ofertas": ofertas, "sedes": sedes}
        except Exception:
            raise HTTPException(status_code=503, detail="Datos de mapa no disponibles")

    @staticmethod
    def calificar_oferta(db: Session, oferta_id: int, usuario_id: int, puntuacion: int) -> float:
        oferta = OfertaRepository.obtener_por_id(db, oferta_id)
        if not oferta:
            raise HTTPException(status_code=404, detail="Oferta no encontrada")
        if oferta.autor_id == usuario_id:
            raise HTTPException(status_code=400, detail="No puedes calificar tu propia oferta")
        
        OfertaRepository.guardar_calificacion(db, oferta_id, usuario_id, puntuacion)
        return OfertaRepository.calcular_promedio(db, oferta_id)