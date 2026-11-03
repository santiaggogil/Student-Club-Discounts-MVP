from fastapi.testclient import TestClient
from main import app
from app.db.session import SessionLocal, Base, engine
from app.social.models import User
from app.services.auth import get_password_hash
import pytest

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    if not db.query(User).filter(User.username == "cazador_vigencia").first():
        u = User(username="cazador_vigencia", email="cazador_vigencia@gmail.com", hashed_password=get_password_hash("Secret12345"))
        db.add(u)
        db.commit()
    db.close()
    yield

def get_token():
    res = client.post("/api/v1/auth/login", json={"identifier": "cazador_vigencia@gmail.com", "password": "Secret12345"})
    return res.json()["access_token"]

def test_publicar_vigencia_con_z(tmp_path):
    token = get_token()
    img_path = tmp_path / "test.jpg"
    img_path.write_bytes(b"fake image data")
    
    with open(img_path, "rb") as f:
        response = client.post(
            "/api/v1/ofertas",
            headers={"Authorization": f"Bearer {token}"},
            data={
                "titulo": "Oferta Z",
                "precio": 1000.0,
                "ubicacion": "Manizales",
                "vigencia": "2026-11-03T14:00:00.000Z",
                "descripcion": "Prueba vigencia Z"
            },
            files={"foto": ("test.jpg", f, "image/jpeg")}
        }
    assert response.status_code == 201
    data = response.json()
    assert data["titulo"] == "Oferta Z"

def test_publicar_vigencia_con_offset(tmp_path):
    token = get_token()
    img_path = tmp_path / "test.jpg"
    img_path.write_bytes(b"fake image data")
    
    with open(img_path, "rb") as f:
        response = client.post(
            "/api/v1/ofertas",
            headers={"Authorization": f"Bearer {token}"},
            data={
                "titulo": "Oferta Offset",
                "precio": 1000.0,
                "ubicacion": "Manizales",
                "vigencia": "2026-11-03T14:00:00+00:00",
                "descripcion": "Prueba vigencia offset"
            },
            files={"foto": ("test.jpg", f, "image/jpeg")}
        }
    assert response.status_code == 201

def test_publicar_vigencia_sin_zona(tmp_path):
    token = get_token()
    img_path = tmp_path / "test.jpg"
    img_path.write_bytes(b"fake image data")
    
    with open(img_path, "rb") as f:
        response = client.post(
            "/api/v1/ofertas",
            headers={"Authorization": f"Bearer {token}"},
            data={
                "titulo": "Oferta Sin Zona",
                "precio": 1000.0,
                "ubicacion": "Manizales",
                "vigencia": "2026-11-03T14:00:00",
                "descripcion": "Prueba vigencia sin zona"
            },
            files={"foto": ("test.jpg", f, "image/jpeg")}
        }
    assert response.status_code == 201

def test_publicar_vigencia_invalida_422(tmp_path):
    token = get_token()
    img_path = tmp_path / "test.jpg"
    img_path.write_bytes(b"fake image data")
    
    with open(img_path, "rb") as f:
        response = client.post(
            "/api/v1/ofertas",
            headers={"Authorization": f"Bearer {token}"},
            data={
                "titulo": "Oferta Invalida",
                "precio": 1000.0,
                "ubicacion": "Manizales",
                "vigencia": "INVALID-DATE",
                "descripcion": "Prueba fecha invalida"
            },
            files={"foto": ("test.jpg", f, "image/jpeg")}
        }
    assert response.status_code == 422
