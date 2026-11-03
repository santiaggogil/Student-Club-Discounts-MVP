import pytest
from unittest.mock import MagicMock, patch
from app.social.models import User, Seguimiento
from app.services.auth import get_password_hash
from app.ofertas.services import OfertaService
from bot_ofertas.telegram import ResultadoNotificacion, TelegramError

def test_publicar_oferta_notifica_seguidores_vinculados(client, db):
    autor = User(username="autor1", hashed_password=get_password_hash("Pass12345678"))
    db.add(autor)
    db.commit()
    db.refresh(autor)

    seguidor1 = User(username="seguidor1", hashed_password=get_password_hash("Pass12345678"), telegram_chat_id=111, telegram_usuario="user1")
    db.add(seguidor1)
    db.commit()
    db.add(Seguimiento(seguidor_id=seguidor1.id, seguido_id=autor.id))
    db.commit()

    mock_notificar = MagicMock(return_value=ResultadoNotificacion(enviados=[111], fallidos=[], bloqueados=[]))

    with patch("app.ofertas.services.notificar", mock_notificar):
        OfertaService.notificar_seguidores_telegram(1, autor.id, db=db)
        assert mock_notificar.called

def test_publicar_oferta_desvincula_usuario_bloqueado(client, db):
    autor = User(username="autor2", hashed_password=get_password_hash("Pass12345678"))
    db.add(autor)
    db.commit()
    db.refresh(autor)

    seguidor = User(username="seguidor_bloqueador", hashed_password=get_password_hash("Pass12345678"), telegram_chat_id=999, telegram_usuario="bloqueador")
    db.add(seguidor)
    db.commit()
    db.add(Seguimiento(seguidor_id=seguidor.id, seguido_id=autor.id))
    db.commit()

    mock_notificar = MagicMock(return_value=ResultadoNotificacion(enviados=[], fallidos=[], bloqueados=[999]))

    with patch("app.ofertas.services.notificar", mock_notificar):
        OfertaService.notificar_seguidores_telegram(1, autor.id, db=db)

    db.refresh(seguidor)
    assert seguidor.telegram_chat_id is None

def test_publicar_oferta_falla_telegram_no_rompe_publicacion(client, db):
    autor = User(username="autor3", hashed_password=get_password_hash("Pass12345678"))
    db.add(autor)
    db.commit()
    db.refresh(autor)

    with patch("app.ofertas.services.ClienteTelegram", side_effect=TelegramError("Falta TOKEN")):
        try:
            OfertaService.notificar_seguidores_telegram(1, autor.id, db=db)
        except Exception:
            pytest.fail("La notificación no debería lanzar excepciones al exterior")

def test_no_notificar_al_propio_autor(client, db):
    autor = User(username="autor_self", hashed_password=get_password_hash("Pass12345678"), telegram_chat_id=777)
    db.add(autor)
    db.commit()
    db.refresh(autor)
    db.add(Seguimiento(seguidor_id=autor.id, seguido_id=autor.id))
    db.commit()

    mock_notificar = MagicMock()
    with patch("app.ofertas.services.notificar", mock_notificar):
        OfertaService.notificar_seguidores_telegram(1, autor.id, db=db)
        assert not mock_notificar.called
