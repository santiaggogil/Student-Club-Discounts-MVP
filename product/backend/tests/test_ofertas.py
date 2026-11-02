from fastapi.testclient import TestClient
from main import app
from app.db.session import SessionLocal
from app.social.models import User
from app.services.auth import get_password_hash, create_access_token
from datetime import datetime, timedelta

client = TestClient(app)

def test_publicar_y_listar_oferta_exitoso():
    db = SessionLocal()
    db.query(User).filter(User.username == "cazador").delete()
    db.commit()
    
    user = User(username="cazador", email="cazador@test.com", hashed_password=get_password_hash("Password123"))
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token({"sub": str(user.id)})
    vigencia = (datetime.now() + timedelta(days=1)).isoformat()
    
    response = client.post(
        "/api/v1/ofertas/",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "titulo": "Almuerzo Económico",
            "precio": 9000.0,
            "ubicacion": "Cafetería Central",
            "vigencia": vigencia,
            "descripcion": "Delicioso menú del día"
        },
        files={"foto": ("test.jpg", b"fake image content", "image/jpeg")}
    )
    assert response.status_code == 201
    
    feed = client.get("/api/v1/ofertas")
    assert feed.status_code == 200
    
    db.delete(user)
    db.commit()
    db.close()

def test_publicar_oferta_formato_imagen_invalido():
    db = SessionLocal()
    db.query(User).filter(User.username == "cazador2").delete()
    db.commit()
    
    user = User(username="cazador2", email="cazador2@test.com", hashed_password=get_password_hash("Password123"))
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    vigencia = (datetime.now() + timedelta(days=1)).isoformat()
    
    response = client.post(
        "/api/v1/ofertas/",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "titulo": "Almuerzo",
            "precio": 5000.0,
            "ubicacion": "Ubicación",
            "vigencia": vigencia,
            "descripcion": "Desc"
        },
        files={"foto": ("test.txt", b"text content", "text/plain")}
    )
    assert response.status_code == 422
    
    db.delete(user)
    db.commit()
    db.close()