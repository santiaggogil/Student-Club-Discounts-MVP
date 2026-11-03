from fastapi import APIRouter, Depends, UploadFile, File, Form, status, HTTPException, Header
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.social.models import User
from app.social.schemas import UserUpdate, UserProfileResponse
from app.social.services import SocialService
from app.api.ofertas import get_current_user
from app.services.auth import decode_token

router = APIRouter()

def get_optional_current_user(authorization: str | None = Header(None), db: Session = Depends(get_db)) -> User | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        return None
    try:
        user_id = int(payload.get("sub"))
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None

@router.get("/me", response_model=UserProfileResponse)
def ver_perfil_propio(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return SocialService.obtener_perfil_publico(db, current_user.id, current_user)

@router.put("/me", response_model=UserProfileResponse)
def editar_perfil_propio(
    nombre: str | None = Form(None),
    biografia: str | None = Form(None),
    seguidores_privados: bool | None = Form(None),
    foto: UploadFile | None = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    data = UserUpdate(nombre=nombre, biografia=biografia, seguidores_privados=seguidores_privados)
    user_updated = SocialService.actualizar_perfil(db, current_user, data, foto)
    return SocialService.obtener_perfil_publico(db, user_updated.id, current_user)

@router.get("/{id}", response_model=UserProfileResponse)
def ver_perfil_publico(id: int, current_user: User | None = Depends(get_optional_current_user), db: Session = Depends(get_db)):
    return SocialService.obtener_perfil_publico(db, id, current_user)

@router.post("/{id}/seguir")
def seguir_usuario(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return SocialService.seguir_usuario(db, current_user.id, id)

@router.delete("/{id}/seguir")
def dejar_de_seguir_usuario(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return SocialService.dejar_de_seguir_usuario(db, current_user.id, id)
