from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from app.social.models import User
from app.social.schemas import UserUpdate
from app.ofertas.models import OfertaComunitaria
import os
import uuid
from urllib.parse import quote

UPLOAD_DIR = "backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
FORMATOS_VALIDOS = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/jpg"}

class SocialService:
    @staticmethod
    def actualizar_perfil(db: Session, user: User, data: UserUpdate, foto: UploadFile | None = None) -> User:
        if data.nombre is not None:
            user.nombre = data.nombre
        if data.biografia is not None:
            user.biografia = data.biografia
        if data.seguidores_privados is not None:
            user.seguidores_privados = data.seguidores_privados
        
        if foto:
            if foto.content_type not in FORMATOS_VALIDOS:
                raise HTTPException(status_code=422, detail=f"Formato de imagen no permitido: {foto.content_type}")
            try:
                contents = foto.file.read()
                ext = os.path.splitext(foto.filename)[1] if foto.filename else ".jpg"
                filename = f"{uuid.uuid4()}{ext}"
                filepath = os.path.join(UPLOAD_DIR, filename)
                with open(filepath, "wb") as f:
                    f.write(contents)
                user.foto_perfil = f"/api/v1/uploads/{quote(filename)}"
            except Exception:
                raise HTTPException(status_code=422, detail="Fallo al procesar la foto de perfil")

        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def obtener_perfil_publico(db: Session, target_id: int, current_user: User | None = None) -> dict:
        target = db.query(User).filter(User.id == target_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        ofertas = db.query(OfertaComunitaria).filter(OfertaComunitaria.autor_id == target_id).all()
        
        # Contadores (por ahora 0 o relación si se implementa seguidos/seguidores en modelo futuro)
        seguidores_count = 0
        seguidos_count = 0
        
        seguidores_detalle = None
        if not target.seguidores_privados or (current_user and current_user.id == target.id):
            seguidores_detalle = []

        return {
            "id": target.id,
            "username": target.username,
            "email": None, # Privacidad de email público
            "nombre": target.nombre,
            "foto_perfil": target.foto_perfil,
            "biografia": target.biografia,
            "seguidores_privados": target.seguidores_privados,
            "seguidores_count": seguidores_count,
            "seguidos_count": seguidos_count,
            "ofertas_publicadas": [
                {
                    "id": o.id,
                    "titulo": o.titulo,
                    "precio": o.precio,
                    "ubicacion": o.ubicacion,
                    "vigencia": o.vigencia.isoformat() if o.vigencia else None,
                    "descripcion": o.descripcion,
                    "imagen": o.imagen
                } for o in ofertas
            ],
            "seguidores": seguidores_detalle
        }
