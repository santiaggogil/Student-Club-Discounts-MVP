from fastapi.testclient import TestClient
from main import app
from app.db.session import SessionLocal
from app.social.models import User
from app.services.auth import get_password_hash
from datetime import datetime, timedelta

client = TestClient(app)

def test_calificar_oferta_con_esquema_y_validaciones():
    db = SessionLocal()
    db.query(User).filter(User.username.in_(["autor_oferta", "calificador"])).delete()
    db.commit()
    
    autor = User(username="autor_oferta", email="autor@test.com", hashed_password=get_password_hash("Password123"))
    calif_user = User(username="calificador", email="calif@test.com", hashed_password=get_password_hash("Password123"))
    db.add_all([autor, calif_user])
    db.commit()
    db.refresh(autor)
    db.refresh(calif_user)
    
    resp_login = client.post("/api/v1/auth/login", json={"identifier": "autor_oferta", "password": "Password123"})
    token_autor = resp_login.json()["access_token"]
    
    resp_login2 = client.post("/api/v1/auth/login", json={"identifier": "calificador", "password": "Password123"})
    token_calif = resp_login2.json()["access_token"]
    
    vigencia = (datetime.now() + timedelta(days=1)).isoformat()
    resp_pub = client.post(
        "/api/v1/ofertas",
        headers={"Authorization": f"Bearer {token_autor}"},
        data={"titulo": "Oferta Test", "precio": 1000.0, "ubicacion": "Aqui", "vigencia": vigencia, "descripcion": "Desc"},
        files={"foto": ("test.jpg", b"fake", "image/jpeg")}
    )
    assert resp_pub.status_code == 201
    oferta_id = resp_pub.json()["id"]
    
    resp_sin_sesion = client.post(f"/api/v1/ofertas/{oferta_id}/calificar", json={"puntuacion": 5})
    assert resp_sin_sesion.status_code == 401
    
    resp_self = client.post(f"/api/v1/ofertas/{oferta_id}/calificar", headers={"Authorization": f"Bearer {token_autor}"}, json={"puntuacion": 4})
    assert resp_self.status_code == 400
    
    resp_calif = client.post(f"/api/v1/ofertas/{oferta_id}/calificar", headers={"Authorization": f"Bearer {token_calif}"}, json={"puntuacion": 5})
    assert resp_calif.status_code == 200
    assert resp_calif.json()["promedio"] == 5.0
    
    db.close()

def test_feed_incluye_username_y_url_uploads():
    db = SessionLocal()
    db.query(User).filter(User.username == "feed_user").delete()
    db.commit()
    
    user = User(username="feed_user", email="feed@test.com", hashed_password=get_password_hash("Password123"))
    db.add(user)
    db.commit()
    db.refresh(user)
    
    resp_login = client.post("/api/v1/auth/login", json={"identifier": "feed_user", "password": "Password123"})
    token = resp_login.json()["access_token"]
    
    vigencia = (datetime.now() + timedelta(days=1)).isoformat()
    client.post(
        "/api/v1/ofertas",
        headers={"Authorization": f"Bearer {token}"},
        data={"titulo": "Feed Test", "precio": 2000.0, "ubicacion": "Mall", "vigencia": vigencia, "descripcion": "Test feed"},
        files={"foto": ("test file.jpg", b"fake", "image/jpeg")}
    )
    
    feed = client.get("/api/v1/ofertas").json()
    assert len(feed) > 0
    item = feed[0]
    assert item["autor_username"] == "feed_user"
    assert item["imagen"].startswith("/api/v1/uploads/")
    assert " " not in item["imagen"]
    
    img_resp = client.get(item["imagen"])
    assert img_resp.status_code == 200
    
    db.close()