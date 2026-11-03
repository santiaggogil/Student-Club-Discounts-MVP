from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.ofertas import get_current_user
from app.social.models import User, TelegramConfig
from bot_ofertas import ClienteTelegram, TelegramError, generar_codigo_vinculacion, enlace_vinculacion, procesar_vinculaciones
from datetime import datetime, timezone

router = APIRouter()

@router.post("/vincular")
def vincular_telegram(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    codigo = generar_codigo_vinculacion()
    current_user.codigo_vinculacion = codigo
    db.commit()
    return {"enlace": enlace_vinculacion("scd_ofertas_bot", codigo)}

@router.get("/estado")
def estado_telegram(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        tg = ClienteTelegram()
    except TelegramError:
        raise HTTPException(status_code=503, detail="Servicio de Telegram no disponible")
    
    config = db.query(TelegramConfig).first() or TelegramConfig(offset=0)
    vinculos, nuevo_offset = procesar_vinculaciones(tg, config.offset)
    
    for v in vinculos:
        user = db.query(User).filter(User.codigo_vinculacion == v.codigo).first()
        if user:
            user.telegram_chat_id = v.chat_id
            user.telegram_usuario = v.usuario_telegram
            user.vinculado_en = datetime.now(timezone.utc)
            user.codigo_vinculacion = None
    
    config.offset = nuevo_offset or config.offset
    db.add(config)
    db.commit()
    
    return {"vinculado": current_user.telegram_chat_id is not None, "usuario_telegram": current_user.telegram_usuario}

@router.delete("/vincular")
def desvincular_telegram(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.telegram_chat_id = None
    current_user.telegram_usuario = None
    current_user.vinculado_en = None
    db.commit()
    return {"message": "Desvinculado exitosamente"}