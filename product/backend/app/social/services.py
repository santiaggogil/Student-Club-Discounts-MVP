from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from app.social.models import User, Seguimiento
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
        
        seguidores_count = db.query(Seguimiento).filter(Seguimiento.seguido_id == target_id).count()
        seguidos_count = db.query(Seguimiento).filter(Seguimiento.seguidor_id == target_id).count()
        
        lo_sigo = False
        if current_user and current_user.id != target_id:
            lo_sigo = db.query(Seguimiento).filter(
                Seguimiento.seguidor_id == current_user.id,
                Seguimiento.seguido_id == target_id
            ).first() is not None

        seguidores_detalle = None
        if not target.seguidores_privados or (current_user and current_user.id == target.id):
            seguidores_rows = db.query(User).join(Seguimiento, User.id == Seguimiento.seguidor_id).filter(Seguimiento.seguido_id == target_id).all()
            seguidores_detalle = [
                {
                    "id": u.id,
                    "username": u.username,
                    "nombre": u.nombre,
                    "foto_perfil": u.foto_perfil
                } for u in seguidores_rows
            ]

        seguidos_rows = db.query(User).join(Seguimiento, User.id == Seguimiento.seguido_id).filter(Seguimiento.seguidor_id == target_id).all()
        seguidos_detalle = [
            {
                "id": u.id,
                "username": u.username,
                "nombre": u.nombre,
                "foto_perfil": u.foto_perfil
            } for u in seguidos_rows
        ]

        return {
            "id": target.id,
            "username": target.username,
            "email": target.email if (current_user and current_user.id == target.id) else None,
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
            "seguidores": seguidores_detalle,
            "seguidos": seguidos_detalle,
            "lo_sigo": lo_sigo
        }

    @staticmethod
    def seguir_usuario(db: Session, seguidor_id: int, seguido_id: int) -> dict:
        if seguidor_id == seguido_id:
            raise HTTPException(status_code=400, detail="No puedes seguirte a ti mismo")
        
        target = db.query(User).filter(User.id == seguido_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        existing = db.query(Seguimiento).filter(
            Seguimiento.seguidor_id == seguidor_id,
            Seguimiento.seguido_id == seguido_id
        ).first()
        if existing:
            raise HTTPException(status_code=409, detail="Ya sigues a este usuario")
        
        seg = Seguimiento(seguidor_id=seguidor_id, seguido_id=seguido_id)
        db.add(seg)
        db.commit()
        return {"message": "Ahora sigues a este usuario"}

    @staticmethod
    def dejar_de_seguir_usuario(db: Session, seguidor_id: int, seguido_id: int) -> dict:
        if seguidor_id == seguido_id:
            raise HTTPException(status_code=400, detail="No puedes dejar de seguirte a ti mismo")
        
        target = db.query(User).filter(User.id == seguido_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        existing = db.query(Seguimiento).filter(
            Seguimiento.seguidor_id == seguidor_id,
            Seguimiento.seguido_id == seguido_id
        ).first()
        if existing:
            db.delete(existing)
            db.commit()
        return {"message": "Has dejado de seguir a este usuario"}
