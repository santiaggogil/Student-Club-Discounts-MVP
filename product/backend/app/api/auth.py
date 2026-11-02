from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.social.models import User
from app.services.auth import get_password_hash, verify_password, create_access_token, decode_token
import re

router = APIRouter()

class UserRegister(BaseModel):
    email: EmailStr = None
    username: str = None
    password: str = Field(..., min_length=10)

    @field_validator('password')
    @classmethod
    def password_complexity(cls, v):
        if not re.search(r'[A-Z]', v) or not re.search(r'[a-z]', v) or not re.search(r'\d', v):
            raise ValueError('La contraseña debe incluir mayúsculas, minúsculas y números')
        return v

class LoginRequest(BaseModel):
    identifier: str
    password: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    if not user_in.email and not user_in.username:
        raise HTTPException(status_code=400, detail="Se requiere email o username")
    
    existing = db.query(User).filter((User.email == user_in.email) if user_in.email else (User.username == user_in.username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Usuario o correo ya registrado")
    
    user = User(email=user_in.email, username=user_in.username, hashed_password=get_password_hash(user_in.password))
    db.add(user)
    db.commit()
    return {"message": "Usuario creado exitosamente"}

@router.post("/login")
def login(login_in: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter((User.email == login_in.identifier) | (User.username == login_in.identifier)).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")
    
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/logout")
def logout(authorization: str = Header(...)):
    return {"message": "Sesión cerrada"}
