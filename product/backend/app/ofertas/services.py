import os, uuid, unicodedata, logging, sys
from datetime import datetime, timezone
from pathlib import Path
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from fastapi import UploadFile, HTTPException
from app.db.session import SessionLocal
from app.ofertas.models import OfertaComunitaria, Calificacion
from app.ofertas.schemas import OfertaResponse, OfertaCreate, CalificacionResponse
from app.ofertas.repository import OfertaRepository
from app.social.models import User, Seguimiento

bot_path = Path(__file__).resolve().parent.parent.parent / "bot"
if str(bot_path) not in sys.path:
    sys.path.insert(0, str(bot_path))

from bot_ofertas import ClienteTelegram, TelegramError, formatear_publicacion, notificar

logger = logging.getLogger(__name__)

class OfertaService:
    @staticmethod
    def _normalizar(texto: str) -> str:
        return unicodedata.normalize('NFKD', texto.lower()).encode('ASCII', 'ignore').decode('utf-8')

    @staticmethod
    def obtener_feed(db: Session, page: int, size: int, orden: str, q: str | None, user_id: int | None) -> list[OfertaResponse]:
        now = datetime.now(timezone.utc)
        query = db.query(OfertaComunitaria).filter(OfertaComunitaria.vigencia > now)
        if q:
            norm_q = OfertaService._normalizar(q)
            query = query.filter(or_(func.lower(OfertaComunitaria.titulo).contains(norm_q), func.lower(OfertaComunitaria.descripcion).contains(norm_q), func.lower(OfertaComunitaria.ubicacion).contains(norm_q)))
        ofertas = query.all()
        formatted = [OfertaService._formatear_oferta(db, o, user_id) for o in ofertas]
        
        if orden == "recientes":
            formatted.sort(key=lambda o: o.id, reverse=True)
        else:
            formatted.sort(key=lambda o: (o.promedio_calificacion, o.total_calificaciones, o.id), reverse=True)
            
        offset = (page - 1) * size
        return formatted[offset:offset + size]

    @staticmethod
    def _formatear_oferta(db: Session, oferta: OfertaComunitaria, user_id: int | None) -> OfertaResponse:
        calificaciones = db.query(Calificacion).filter(Calificacion.oferta_id == oferta.id).all()
        promedio = sum(c.puntuacion for c in calificaciones) / len(calificaciones) if calificaciones else 0.0
        mi_cal = None
        if user_id:
            c = db.query(Calificacion).filter(Calificacion.oferta_id == oferta.id, Calificacion.usuario_id == user_id).first()
            if c: mi_cal = c.puntuacion
        return OfertaResponse(
            id=oferta.id,
            titulo=oferta.titulo,
            precio=oferta.precio,
            ubicacion=oferta.ubicacion,
            vigencia=oferta.vigencia,
            descripcion=oferta.descripcion,
            imagen=oferta.imagen,
            autor_id=oferta.autor_id,
            autor_username=oferta.autor.username if oferta.autor else None,
            autor_foto=oferta.autor.foto_perfil if oferta.autor else None,
            promedio_calificacion=promedio,
            total_calificaciones=len(calificaciones),
            mi_calificacion=mi_cal
        )

    @staticmethod
    def obtener_oferta(db: Session, oferta_id: int, user_id: int | None) -> OfertaResponse:
        o = db.query(OfertaComunitaria).filter(OfertaComunitaria.id == oferta_id).first()
        if not o:
            raise HTTPException(status_code=404, detail="Oferta no encontrada")
        return OfertaService._formatear_oferta(db, o, user_id)

    @staticmethod
    def calificar_oferta(db: Session, oferta_id: int, user_id: int, puntuacion: int) -> CalificacionResponse:
        o = db.query(OfertaComunitaria).filter(OfertaComunitaria.id == oferta_id).first()
        if o and o.autor_id == user_id:
            raise HTTPException(status_code=400, detail="No puedes calificar tu propia oferta")
        OfertaRepository.guardar_calificacion(db, oferta_id, user_id, puntuacion)
        calificaciones = db.query(Calificacion).filter(Calificacion.oferta_id == oferta_id).all()
        promedio = sum(c.puntuacion for c in calificaciones) / len(calificaciones) if calificaciones else 0.0
        return CalificacionResponse(promedio=promedio, promedio_calificacion=promedio, total_calificaciones=len(calificaciones), mi_calificacion=puntuacion)

    @staticmethod
    def publicar_oferta(db: Session, data: OfertaCreate, foto: UploadFile, autor_id: int):
        if foto and foto.content_type not in ["image/jpeg", "image/png", "image/webp"]:
            raise HTTPException(status_code=422, detail="Formato de imagen no permitido")
        content = foto.file.read() if foto else b""
        filename = f"{uuid.uuid4()}.jpg"
        with open(f"backend/uploads/{filename}", "wb") as f: f.write(content)
        return OfertaRepository.crear(db, data, f"/api/v1/uploads/{filename}", autor_id)

    @staticmethod
    def editar_oferta(db: Session, oferta_id: int, data: OfertaCreate, foto: UploadFile | None, autor_id: int):
        o = db.query(OfertaComunitaria).filter(OfertaComunitaria.id == oferta_id, OfertaComunitaria.autor_id == autor_id).first()
        if not o:
            raise HTTPException(status_code=403, detail="No autorizado para editar esta oferta")
        img = None
        if foto:
            if foto.content_type not in ["image/jpeg", "image/png", "image/webp"]:
                raise HTTPException(status_code=422, detail="Formato de imagen no permitido")
            content = foto.file.read()
            filename = f"{uuid.uuid4()}.jpg"
            with open(f"backend/uploads/{filename}", "wb") as f: f.write(content)
            img = f"/api/v1/uploads/{filename}"
        return OfertaRepository.actualizar(db, o, data, img)

    @staticmethod
    def eliminar_oferta(db: Session, oferta_id: int, autor_id: int):
        o = db.query(OfertaComunitaria).filter(OfertaComunitaria.id == oferta_id, OfertaComunitaria.autor_id == autor_id).first()
        if o:
            OfertaRepository.eliminar(db, o)

    @staticmethod
    def notificar_seguidores_telegram(oferta_id: int, autor_id: int):
        db = SessionLocal()
        try:
            autor = db.query(User).filter(User.id == autor_id).first()
            oferta = db.query(OfertaComunitaria).filter(OfertaComunitaria.id == oferta_id).first()
            if not autor or not oferta:
                return

            seguimientos = db.query(Seguimiento.seguidor_id).filter(
                Seguimiento.seguido_id == autor_id,
                Seguimiento.seguidor_id != autor_id
            ).all()
            seguidor_ids = [s[0] for s in seguimientos]
            if not seguidor_ids:
                return

            seguidores_vinculados = db.query(User).filter(
                User.id.in_(seguidor_ids),
                User.telegram_chat_id.isnot(None)
            ).all()

            if not seguidores_vinculados:
                return

            chat_ids = [u.telegram_chat_id for u in seguidores_vinculados if u.telegram_chat_id is not None]
            if not chat_ids:
                return

            try:
                tg = ClienteTelegram()
            except TelegramError as e:
                logger.warning(f"Error o falta TELEGRAM_BOT_TOKEN: {e}")
                return
            except Exception as e:
                logger.warning(f"Error inicializando ClienteTelegram: {e}")
                return

            frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
            url = f"{frontend_url}/feed"
            autor_username = autor.username or autor.nombre or f"Usuario {autor.id}"

            texto = formatear_publicacion(
                autor=autor_username,
                titulo=oferta.titulo,
                descripcion=oferta.descripcion,
                ubicacion=oferta.ubicacion,
                url=url
            )

            resultado = notificar(tg, chat_ids, texto)

            if resultado and getattr(resultado, "bloqueados", None):
                for b_chat_id in resultado.bloqueados:
                    try:
                        chat_id_val = int(b_chat_id)
                    except (ValueError, TypeError):
                        chat_id_val = b_chat_id
                    db.query(User).filter(
                        (User.telegram_chat_id == chat_id_val) | (User.telegram_chat_id == str(b_chat_id))
                    ).update(
                        {
                            User.telegram_chat_id: None,
                            User.telegram_usuario: None,
                            User.vinculado_en: None
                        },
                        synchronize_session=False
                    )
                db.commit()
        except Exception as e:
            logger.error(f"Excepción en notificar_seguidores_telegram: {e}")
        finally:
            db.close()
