import os
import uuid
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from app.ofertas.schemas import OfertaCreate
from app.ofertas.repository import OfertaRepository
from app.ofertas.models import OfertaComunitaria
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
            filename = f"{uuid.uuid4()}_{file.filename}"
            filepath = os.path.join(UPLOAD_DIR, filename)
            with open(filepath, "wb") as f:
                f.write(contents)
            return f"/uploads/{filename}"
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="La carga o el procesamiento de la imagen falló."
            )

    @staticmethod
    def publicar_oferta(db: Session, data: OfertaCreate, file: UploadFile, autor_id: int) -> OfertaComunitaria:
        imagen_url = OfertaService.procesar_y_guardar_imagen(file)
        return OfertaRepository.crear(db, data, imagen_url, autor_id)

    @staticmethod
    def obtener_feed(db: Session, page: int, size: int) -> list[OfertaComunitaria]:
        return OfertaRepository.listar_vigentes(db, page, size)

    @staticmethod
    def obtener_datos_mapa():
        try:
            repo = RepositorioOfertas("backend/bot/ofertas_bot.db")
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