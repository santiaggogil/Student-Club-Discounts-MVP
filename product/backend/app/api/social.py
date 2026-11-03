from fastapi import APIRouter, Depends, UploadFile, File, Form, status, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.social.models import User
from app.social.schemas import UserUpdate, UserProfileResponse
from app.social.services import SocialService
from app.api.ofertas import get_current_user

router = APIRouter()

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
def ver_perfil_publico(id: int, current_user: User | None = Depends(get_current_user), db: Session = Depends(get_db)):
    return SocialService.obtener_perfil_publico(db, id, current_user)
