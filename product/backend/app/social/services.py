from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
from app.social.models import User
from app.ofertas.models import OfertaComunitaria
import os, uuid

class SocialService:
    @staticmethod
    def actualizar_perfil(db: Session, user: User, data, foto: UploadFile | None = None) -> User:
        if foto:
            filename = f"{uuid.uuid4()}.jpg"
            with open(f"backend/uploads/{filename}", "wb") as f: f.write(foto.file.read())
            user.foto_perfil = f"/api/v1/uploads/{filename}"
        db.commit(); db.refresh(user); return user

    @staticmethod
    def obtener_perfil_publico(db: Session, target_id: int, current_user: User | None = None) -> dict:
        target = db.query(User).filter(User.id == target_id).first()
        ofertas = db.query(OfertaComunitaria).filter(OfertaComunitaria.autor_id == target_id).all()
        return {"id": target.id, "username": target.username, "foto_perfil": target.foto_perfil, "ofertas_publicadas": [{"id": o.id, "titulo": o.titulo, "imagen": o.imagen} for o in ofertas]}