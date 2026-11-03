from fastapi import APIRouter, Depends, UploadFile, File, Form, status, HTTPException, Query, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, ValidationError
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.auth import decode_token
from app.ofertas.schemas import OfertaCreate, OfertaResponse, CalificacionResponse
from app.ofertas.services import OfertaService
from app.social.models import User

router = APIRouter()
security = HTTPBearer(auto_error=False)

class CalificacionIn(BaseModel):
    puntuacion: int = Field(..., ge=1, le=5)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    user = db.query(User).filter(User.id == int(payload.get("sub"))).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")
    return user

def get_current_user_optional(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> User | None:
    if not credentials:
        return None
    try:
        return get_current_user(credentials, db)
    except HTTPException:
        return None

@router.post("", response_model=OfertaResponse, status_code=status.HTTP_201_CREATED)
def publicar_oferta(titulo: str = Form(...), precio: float = Form(...), ubicacion: str = Form(...), vigencia: str = Form(...), descripcion: str = Form(...), foto: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        data = OfertaCreate(titulo=titulo, precio=precio, ubicacion=ubicacion, vigencia=vigencia, descripcion=descripcion)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=[{"msg": str(err["msg"]), "loc": err["loc"]} for err in e.errors()])
    return OfertaService.publicar_oferta(db, data, foto, current_user.id)

@router.get("/{oferta_id}", response_model=OfertaResponse)
def obtener_oferta(oferta_id: int, db: Session = Depends(get_db), user: User | None = Depends(get_current_user_optional)):
    return OfertaService.obtener_oferta(db, oferta_id, user.id if user else None)

@router.put("/{oferta_id}", response_model=OfertaResponse)
def editar_oferta(oferta_id: int, titulo: str = Form(...), precio: float = Form(...), ubicacion: str = Form(...), vigencia: str = Form(...), descripcion: str = Form(...), foto: UploadFile | None = File(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        data = OfertaCreate(titulo=titulo, precio=precio, ubicacion=ubicacion, vigencia=vigencia, descripcion=descripcion)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=[{"msg": str(err["msg"]), "loc": err["loc"]} for err in e.errors()])
    return OfertaService.editar_oferta(db, oferta_id, data, foto, current_user.id)

@router.delete("/{oferta_id}")
def eliminar_oferta(oferta_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    OfertaService.eliminar_oferta(db, oferta_id, current_user.id)
    return {"message": "Oferta eliminada"}

@router.get("", response_model=list[OfertaResponse])
def listar_ofertas(db: Session = Depends(get_db), q: str | None = Query(None), page: int = Query(1, ge=1), size: int = Query(10, ge=1, le=100), orden: str = Query("relevancia"), user: User | None = Depends(get_current_user_optional)):
    return OfertaService.obtener_feed(db, page, size, orden, q, user.id if user else None)

@router.post("/{oferta_id}/calificar", response_model=CalificacionResponse)
def calificar_oferta(oferta_id: int, calif_in: CalificacionIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return OfertaService.calificar_oferta(db, oferta_id, current_user.id, calif_in.puntuacion)