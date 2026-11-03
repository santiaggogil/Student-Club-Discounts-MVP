import pytest
from unittest.mock import MagicMock, patch
from app.social.models import User, Seguimiento
from app.services.auth import get_password_hash, create_access_token
from bot_ofertas.telegram import ResultadoNotificacion, TelegramError

def test_publicar_oferta_notifica_seguidores_vinculados(client, db):
    autor = User(username="autor1", hashed_password=get_password_hash("Pass12345678"))
    db.add(autor)
    db.commit()
    db.refresh(autor)

    seguidor1 = User(username="seguidor1", hashed_password=get_password_hash("Pass12345678"), telegram_chat_id=111, telegram_usuario="user1")
    seguidor2 = User(username="seguidor2", hashed_password=get_password_hash("Pass12345678"))
    otro = User(username="otro", hashed_password=get_password_hash("Pass12345678"), telegram_chat_id=222)
    
    db.add_all([seguidor1, seguidor2, otro])
    db.commit()

    db.add(Seguimiento(seguidor_id=seguidor1.id, seguido_id=autor.id))
    db.add(Seguimiento(seguidor_id=seguidor2.id, seguido_id=autor.id))
    db.commit()

    token = create_access_token({"sub": str(autor.id)})
    mock_notificar = MagicMock(return_value=ResultadoNotificacion(enviados=[111], fallidos=[], bloqueados=[]))

    with patch("app.ofertas.services.ClienteTelegram") as mock_tg_cls, \
         patch("app.ofertas.services.notificar", mock_notificar):
        
        resp = client.post(
            "/api/v1/ofertas",
            headers={"Authorization": f"Bearer {token}"},
            data={
                "titulo": "Descuento en Pizzas",
                "precio": 15000,
                "ubicacion": "Centro",
                "vigencia": "2030-12-31T23:59:59Z",
                "descripcion": "2x1 los martes"
            },
            files={"foto": ("pizza.jpg", b"fakebytes", "image/jpeg")}
        )

        assert resp.status_code == 201
        assert mock_notificar.called
        call_args = mock_notificar.call_args
        chat_ids = call_args[0][1]
        texto = call_args[0][2]

        assert chat_ids == [111]
        assert "autor1" in texto
        assert "Descuento en Pizzas" in texto
        assert "http://localhost:5173/feed" in texto

def test_publicar_oferta_desvincula_usuario_bloqueado(client, db):
    autor = User(username="autor2", hashed_password=get_password_hash("Pass12345678"))
    db.add(autor)
    db.commit()
    db.refresh(autor)

    seguidor = User(username="seguidor_bloqueador", hashed_password=get_password_hash("Pass12345678"), telegram_chat_id=999, telegram_usuario="bloqueador")
    db.add(seguidor)
    db.commit()
    db.refresh(seguidor)

    db.add(Seguimiento(seguidor_id=seguidor.id, seguido_id=autor.id))
    db.commit()

    token = create_access_token({"sub": str(autor.id)})
    mock_notificar = MagicMock(return_value=ResultadoNotificacion(enviados=[], fallidos=[], bloqueados=[999]))

    with patch("app.ofertas.services.ClienteTelegram"), \
         patch("app.ofertas.services.notificar", mock_notificar):
        
        resp = client.post(
            "/api/v1/ofertas",
            headers={"Authorization": f"Bearer {token}"},
            data={
                "titulo": "Empanadas 50%",
                "precio": 2000,
                "ubicacion": "U Caldas",
                "vigencia": "2030-12-31T23:59:59Z",
                "descripcion": "Empanadas de carne"
            },
            files={"foto": ("empanada.jpg", b"fakebytes", "image/jpeg")}
        )

        assert resp.status_code == 201

    db.refresh(seguidor)
    assert seguidor.telegram_chat_id is None
    assert seguidor.telegram_usuario is None

def test_publicar_oferta_falla_telegram_no_rompe_publicacion(client, db):
    autor = User(username="autor3", hashed_password=get_password_hash("Pass12345678"))
    db.add(autor)
    db.commit()
    db.refresh(autor)

    seguidor = User(username="seguidor3", hashed_password=get_password_hash("Pass12345678"), telegram_chat_id=333)
    db.add(seguidor)
    db.commit()

    db.add(Seguimiento(seguidor_id=seguidor.id, seguido_id=autor.id))
    db.commit()

    token = create_access_token({"sub": str(autor.id)})

    with patch("app.ofertas.services.ClienteTelegram", side_effect=TelegramError("Falta TELEGRAM_BOT_TOKEN")):
        resp = client.post(
            "/api/v1/ofertas",
            headers={"Authorization": f"Bearer {token}"},
            data={
                "titulo": "Libros Usados",
                "precio": 10000,
                "ubicacion": "Biblioteca",
                "vigencia": "2030-12-31T23:59:59Z",
                "descripcion": "Venta de libros"
            },
            files={"foto": ("libro.jpg", b"fakebytes", "image/jpeg")}
        )

        assert resp.status_code == 201
        assert resp.json()["titulo"] == "Libros Usados"

def test_no_notificar_al_propio_autor(client, db):
    autor = User(username="autor_self", hashed_password=get_password_hash("Pass12345678"), telegram_chat_id=777)
    db.add(autor)
    db.commit()
    db.refresh(autor)

    db.add(Seguimiento(seguidor_id=autor.id, seguido_id=autor.id))
    db.commit()

    token = create_access_token({"sub": str(autor.id)})
    mock_notificar = MagicMock(return_value=ResultadoNotificacion(enviados=[], fallidos=[], bloqueados=[]))

    with patch("app.ofertas.services.ClienteTelegram"), \
         patch("app.ofertas.services.notificar", mock_notificar):
        
        resp = client.post(
            "/api/v1/ofertas",
            headers={"Authorization": f"Bearer {token}"},
            data={
                "titulo": "Oferta Propia",
                "precio": 5000,
                "ubicacion": "Cable",
                "vigencia": "2030-12-31T23:59:59Z",
                "descripcion": "Mi propia oferta"
            },
            files={"foto": ("oferta.jpg", b"fakebytes", "image/jpeg")}
        )

        assert resp.status_code == 201
        assert not mock_notificar.called
