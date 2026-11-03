from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException
from app.social.models import User, Seguimiento
from app.ofertas.models import OfertaComunitaria
import uuid

class SocialService:
    @staticmethod
    def actualizar_perfil(db: Session, user: User, data, foto: UploadFile | None = None) -> User:
        if data.nombre is not None: user.nombre = data.nombre
        if data.biografia is not None: user.biografia = data.biografia
        if data.seguidores_privados is not None: user.seguidores_privados = data.seguidores_privados
        if foto:
            if foto.content_type not in ["image/jpeg", "image/png", "image/webp"]:
                raise HTTPException(status_code=422, detail="Formato de imagen no permitido")
            content = foto.file.read()
            if len(content) > 2 * 1024 * 1024:
                raise HTTPException(status_code=422, detail="La imagen excede los 2 MB")
            filename = f"{uuid.uuid4()}.jpg"
            with open(f"backend/uploads/{filename}", "wb") as f: f.write(content)
            user.foto_perfil = f"/api/v1/uploads/{filename}"
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
        if current_user:
            lo_sigo = db.query(Seguimiento).filter(Seguimiento.seguidor_id == current_user.id, Seguimiento.seguido_id == target_id).first() is not None
        
        return {
            "id": target.id,
            "username": target.username,
            "email": target.email,
            "nombre": target.nombre,
            "foto_perfil": target.foto_perfil,
            "biografia": target.biografia,
            "seguidores_privados": target.seguidores_privados,
            "seguidores_count": seguidores_count,
            "seguidos_count": seguidos_count,
            "lo_sigo": lo_sigo,
            "ofertas_publicadas": [{"id": o.id, "titulo": o.titulo, "imagen": o.imagen, "precio": o.precio} for o in ofertas]
        }

    @staticmethod
    def seguir_usuario(db: Session, seguidor_id: int, seguido_id: int):
        if seguidor_id == seguido_id:
            raise HTTPException(status_code=400, detail="No puedes seguirte a ti mismo")
        target = db.query(User).filter(User.id == seguido_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        existing = db.query(Seguimiento).filter(Seguimiento.seguidor_id == seguidor_id, Seguimiento.seguido_id == seguido_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Ya sigues a este usuario")
        s = Seguimiento(seguidor_id=seguidor_id, seguido_id=seguido_id)
        db.add(s)
        db.commit()
        return {"message": "Usuario seguido exitosamente"}

    @staticmethod
    def dejar_de_seguir_usuario(db: Session, seguidor_id: int, seguido_id: int):
        s = db.query(Seguimiento).filter(Seguimiento.seguidor_id == seguidor_id, Seguimiento.seguido_id == seguido_id).first()
        if not s:
            raise HTTPException(status_code=404, detail="Relación de seguimiento no encontrada")
        db.delete(s)
        db.commit()
        return {"message": "Has dejado de seguir al usuario"}

    @staticmethod
    def listar_seguidores(db: Session, user_id: int, page: int, size: int, current_user: User | None):
        target = db.query(User).filter(User.id == user_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        if target.seguidores_privados and (not current_user or current_user.id != user_id):
            raise HTTPException(status_code=403, detail="Lista de seguidores privada")
        seguimientos = db.query(Seguimiento).filter(Seguimiento.seguido_id == user_id).all()
        users = [db.query(User).filter(User.id == s.seguidor_id).first() for s in seguimientos]
        return [{"id": u.id, "username": u.username, "nombre": u.nombre, "foto_perfil": u.foto_perfil} for u in users if u]

    @staticmethod
    def listar_seguidos(db: Session, user_id: int, page: int, size: int, current_user: User | None):
        target = db.query(User).filter(User.id == user_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        seguimientos = db.query(Seguimiento).filter(Seguimiento.seguidor_id == user_id).all()
        users = [db.query(User).filter(User.id == s.seguido_id).first() for s in seguimientos]
        return [{"id": u.id, "username": u.username, "nombre": u.nombre, "foto_perfil": u.foto_perfil} for u in users if u]
