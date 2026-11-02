import os
import uuid
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from app.ofertas.schemas import OfertaCreate
from app.ofertas.repository import OfertaRepository
from app.ofertas.models import OfertaComunitaria

UPLOAD_DIR = "backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

FORMATOS_VALIDOS = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/jpg"}

class OfertaService:
    @staticmethod
    def procesar_y_guardar_imagen(file: UploadFile) -> str:
        if file.content_type not in FORMATOS_VALIDOS:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Formato de imagen no permitido: {file.content_type}. Use JPEG, PNG, WEBP o HEIC."
            )
        try:
            contents = file.file.read()
            # Simula compresión a ~2MB y almacenamiento de archivo
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
        oferta = OfertaRepository.crear(db, data, imagen_url, autor_id)
        # Asincronía simulada para despacho de notificaciones (BR-010, AC-032)
        return oferta

    @staticmethod
    def obtener_feed(db: Session) -> list[OfertaComunitaria]:
        return OfertaRepository.listar_vigentes(db)
