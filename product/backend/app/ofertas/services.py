import os
import sys
import uuid
from pathlib import Path
from urllib.parse import quote
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
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
        oferta = OfertaRepository.obtener_por_id(db, oferta.id)
        promedio = OfertaRepository.calcular_promedio(db, oferta.id)
        total = len(oferta.calificaciones) if oferta.calificaciones else 0
        resp = OfertaResponse.model_validate(oferta)
        resp.autor_username = oferta.autor.username if oferta.autor else None
        resp.promedio_calificacion = promedio
        resp.total_calificaciones = total
        return resp

    @staticmethod
    def obtener_feed(db: Session, page: int, size: int) -> list[OfertaResponse]:
        ofertas = OfertaRepository.listar_vigentes(db, page, size)
        res = []
        for o in ofertas:
            promedio = OfertaRepository.calcular_promedio(db, o.id)
            total = len(o.calificaciones) if o.calificaciones else 0
            resp = OfertaResponse.model_validate(o)
            resp.autor_username = o.autor.username if o.autor else None
            resp.promedio_calificacion = promedio
            resp.total_calificaciones = total
            res.append(resp)
        return res

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
