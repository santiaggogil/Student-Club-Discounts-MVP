from fastapi.testclient import TestClient
from main import app
from app.db.session import SessionLocal
from app.social.models import User
from app.ofertas.models import OfertaComunitaria
from app.services.auth import get_password_hash
from datetime import datetime, timedelta

client = TestClient(app)

def test_tc_024_feed_muestra_detalles(db):
    user = User(username="autor_test", email="autor@test.com", hashed_password=get_password_hash("Password123"))
    db.add(user)
    db.commit()
    db.refresh(user)
    
    oferta = OfertaComunitaria(
        titulo="Oferta Test",
        precio=5000.0,
        ubicacion="Campus",
        vigencia=datetime.now() + timedelta(days=1),
        descripcion="Descripcion de prueba",
        imagen="/uploads/test.jpg",
        autor_id=user.id
    )
    db.add(oferta)
    db.commit()
    
    response = client.get("/api/v1/ofertas")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    item = data[0]
    assert "titulo" in item
    assert "descripcion" in item
    assert "ubicacion" in item
    assert "autor_id" in item
    assert "imagen" in item

def test_tc_025_feed_paginacion_tandas(db):
    response1 = client.get("/api/v1/ofertas?page=1&size=2")
    response2 = client.get("/api/v1/ofertas?page=2&size=2")
    assert response1.status_code == 200
    assert response2.status_code == 200

def test_tc_026_feed_estado_vacio(db):
    response = client.get("/api/v1/ofertas?page=999&size=10")
    assert response.status_code == 200
    assert response.json() == []

def test_backend_no_redirect_slash(db):
    response = client.get("/api/v1/ofertas", follow_redirects=False)
    assert response.status_code == 200
