from fastapi.testclient import TestClient
from main import app
from app.db.session import get_db, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.social.models import User
from app.services.auth import get_password_hash
from datetime import datetime, timedelta
import pytest

@pytest.fixture
def db_session(tmp_path):
    db_path = tmp_path / "test_orden.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    app.dependency_overrides[get_db] = lambda: session
    yield session
    session.close()
    app.dependency_overrides.clear()

@pytest.fixture
def client_orden(db_session):
    return TestClient(app)

def test_ac_047_orden_relevancia(client_orden, db_session):
    u1 = User(username="u1", email="u1@test.com", hashed_password=get_password_hash("Password123"))
    u2 = User(username="u2", email="u2@test.com", hashed_password=get_password_hash("Password123"))
    u3 = User(username="u3", email="u3@test.com", hashed_password=get_password_hash("Password123"))
    db_session.add_all([u1, u2, u3])
    db_session.commit()
    
    t1 = client_orden.post("/api/v1/auth/login", json={"identifier": "u1", "password": "Password123"}).json()["access_token"]
    t2 = client_orden.post("/api/v1/auth/login", json={"identifier": "u2", "password": "Password123"}).json()["access_token"]
    t3 = client_orden.post("/api/v1/auth/login", json={"identifier": "u3", "password": "Password123"}).json()["access_token"]
    
    vigencia = (datetime.now() + timedelta(days=1)).isoformat()
    
    # Oferta 1
    o1 = client_orden.post("/api/v1/ofertas", headers={"Authorization": f"Bearer {t1}"}, data={"titulo": "Baja", "precio": 100, "ubicacion": "A", "vigencia": vigencia, "descripcion": "D"}, files={"foto": ("t.jpg", b"f", "image/jpeg")}).json()["id"]
    # Oferta 2
    o2 = client_orden.post("/api/v1/ofertas", headers={"Authorization": f"Bearer {t2}"}, data={"titulo": "Alta", "precio": 100, "ubicacion": "A", "vigencia": vigencia, "descripcion": "D"}, files={"foto": ("t.jpg", b"f", "image/jpeg")}).json()["id"]
    
    # Calificar o1 con 2 estrellas por u3
    client_orden.post(f"/api/v1/ofertas/{o1}/calificar", headers={"Authorization": f"Bearer {t3}"}, json={"puntuacion": 2})
    # Calificar o2 con 5 estrellas por u3
    client_orden.post(f"/api/v1/ofertas/{o2}/calificar", headers={"Authorization": f"Bearer {t3}"}, json={"puntuacion": 5})
    
    resp = client_orden.get("/api/v1/ofertas?orden=relevancia")
    assert resp.status_code == 200
    items = resp.json()
    assert items[0]["id"] == o2
    assert items[1]["id"] == o1

def test_ac_049_orden_recientes(client_orden, db_session):
    u1 = User(username="u1_rec", email="u1r@test.com", hashed_password=get_password_hash("Password123"))
    u2 = User(username="u2_rec", email="u2r@test.com", hashed_password=get_password_hash("Password123"))
    db_session.add_all([u1, u2])
    db_session.commit()
    
    t1 = client_orden.post("/api/v1/auth/login", json={"identifier": "u1_rec", "password": "Password123"}).json()["access_token"]
    t2 = client_orden.post("/api/v1/auth/login", json={"identifier": "u2_rec", "password": "Password123"}).json()["access_token"]
    
    vigencia = (datetime.now() + timedelta(days=1)).isoformat()
    
    o1 = client_orden.post("/api/v1/ofertas", headers={"Authorization": f"Bearer {t1}"}, data={"titulo": "Primera", "precio": 100, "ubicacion": "A", "vigencia": vigencia, "descripcion": "D"}, files={"foto": ("t.jpg", b"f", "image/jpeg")}).json()["id"]
    o2 = client_orden.post("/api/v1/ofertas", headers={"Authorization": f"Bearer {t2}"}, data={"titulo": "Segunda", "precio": 100, "ubicacion": "A", "vigencia": vigencia, "descripcion": "D"}, files={"foto": ("t.jpg", b"f", "image/jpeg")}).json()["id"]
    
    resp = client_orden.get("/api/v1/ofertas?orden=recientes")
    assert resp.status_code == 200
    items = resp.json()
    assert items[0]["id"] == o2
    assert items[1]["id"] == o1
