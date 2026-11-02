from fastapi import APIRouter, Depends, UploadFile, File, Form, status, HTTPException, Query, Body
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.session import get_db
from app.services.auth import decode_token
from fastapi import Header, Request
from app.ofertas.schemas import OfertaCreate, OfertaResponse
from app.ofertas.services import OfertaService
from app.social.models import User

router = APIRouter(redirect_slashes=False)

def get_current_user(authorization: str | None = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization:
        raise HTTPException(status_code=401, detail="Debes iniciar sesión para calificar")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Debes iniciar sesión para calificar")
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Debes iniciar sesión para calificar")
    user_id = int(payload.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Debes iniciar sesión para calificar")
    return user

@router.post("/", response_model=OfertaResponse, status_code=status.HTTP_201_CREATED)
def publicar_oferta(
    titulo: str = Form(...),
    precio: float = Form(...),
    ubicacion: str = Form(...),
    vigencia: str = Form(...),
    descripcion: str = Form(...),
    foto: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        vigencia_dt = datetime.fromisoformat(vigencia)
    except ValueError:
        raise HTTPException(status_code=422, detail="Formato de fecha de vigencia inválido (ISO requerido)")
    
    data = OfertaCreate(
        titulo=titulo,
        precio=precio,
        ubicacion=ubicacion,
        vigencia=vigencia_dt,
        descripcion=descripcion
    )
    return OfertaService.publicar_oferta(db, data, foto, current_user.id)

@router.get("", response_model=list[OfertaResponse])
def listar_ofertas_sin_slash(db: Session = Depends(get_db), page: int = Query(1, ge=1), size: int = Query(10, ge=1, le=100)):
    return OfertaService.obtener_feed(db, page, size)

@router.get("/", response_model=list[OfertaResponse])
def listar_ofertas(db: Session = Depends(get_db), page: int = Query(1, ge=1), size: int = Query(10, ge=1, le=100)):
    return OfertaService.obtener_feed(db, page, size)

@router.get("/mapa")
def obtener_mapa():
    return OfertaService.obtener_datos_mapa()

@router.post("/{oferta_id}/calificar")
def calificar_oferta(
    oferta_id: int,
    puntuacion: int = Body(..., ge=1, le=5),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    promedio = OfertaService.calificar_oferta(db, oferta_id, current_user.id, puntuacion)
    return {"promedio": promedio}
