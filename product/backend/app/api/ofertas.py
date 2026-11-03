from fastapi import APIRouter, Depends, UploadFile, File, Form, status, HTTPException, Query, Header
from pydantic import BaseModel, Field, ValidationError
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.auth import decode_token
from app.ofertas.schemas import OfertaCreate, OfertaResponse
from app.ofertas.services import OfertaService
from app.social.models import User

router = APIRouter()

class CalificacionIn(BaseModel):
    puntuacion: int = Field(..., ge=1, le=5)

def get_current_user_optional(authorization: str | None = Header(None), db: Session = Depends(get_db)) -> User | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload: return None
    return db.query(User).filter(User.id == int(payload.get("sub"))).first()

def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)) -> User:
    user = get_current_user_optional(authorization, db)
    if not user: raise HTTPException(status_code=401, detail="Debes iniciar sesión")
    return user

@router.post("", response_model=OfertaResponse, status_code=status.HTTP_201_CREATED)
def publicar_oferta(titulo: str = Form(...), precio: float = Form(...), ubicacion: str = Form(...), vigencia: str = Form(...), descripcion: str = Form(...), foto: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = OfertaCreate(titulo=titulo, precio=precio, ubicacion=ubicacion, vigencia=vigencia, descripcion=descripcion)
    return OfertaService.publicar_oferta(db, data, foto, current_user.id)

@router.get("/{oferta_id}", response_model=OfertaResponse)
def obtener_oferta(oferta_id: int, db: Session = Depends(get_db), user: User | None = Depends(get_current_user_optional)):
    return OfertaService.obtener_oferta(db, oferta_id, user.id if user else None)

@router.put("/{oferta_id}", response_model=OfertaResponse)
def editar_oferta(oferta_id: int, titulo: str = Form(...), precio: float = Form(...), ubicacion: str = Form(...), vigencia: str = Form(...), descripcion: str = Form(...), foto: UploadFile | None = File(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = OfertaCreate(titulo=titulo, precio=precio, ubicacion=ubicacion, vigencia=vigencia, descripcion=descripcion)
    return OfertaService.editar_oferta(db, oferta_id, data, foto, current_user.id)

@router.delete("/{oferta_id}")
def eliminar_oferta(oferta_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    OfertaService.eliminar_oferta(db, oferta_id, current_user.id)
    return {"message": "Oferta eliminada"}

@router.get("", response_model=list[OfertaResponse])
def listar_ofertas(db: Session = Depends(get_db), q: str | None = Query(None), page: int = Query(1, ge=1), size: int = Query(10, ge=1, le=100), orden: str = Query("relevancia"), user: User | None = Depends(get_current_user_optional)):
    return OfertaService.obtener_feed(db, page, size, orden, q, user.id if user else None)

@router.post("/{oferta_id}/calificar")
def calificar_oferta(oferta_id: int, calif_in: CalificacionIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    promedio = OfertaService.calificar_oferta(db, oferta_id, current_user.id, calif_in.puntuacion)
    return {"promedio": promedio}