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
    db_path = tmp_path / "test_corr.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    app.dependency_overrides[get_db] = lambda: session
    yield session
    session.close()
    app.dependency_overrides.clear()

@pytest.fixture
def client_corr(db_session):
    return TestClient(app)

def test_calificar_oferta_con_esquema_y_validaciones(client_corr, db_session):
    autor = User(username="autor_oferta", email="autor@test.com", hashed_password=get_password_hash("Password123"))
    calif_user = User(username="calificador", email="calif@test.com", hashed_password=get_password_hash("Password123"))
    db_session.add_all([autor, calif_user])
    db_session.commit()
    db_session.refresh(autor)
    db_session.refresh(calif_user)
    
    resp_login = client_corr.post("/api/v1/auth/login", json={"identifier": "autor_oferta", "password": "Password123"})
    token_autor = resp_login.json()["access_token"]
    
    resp_login2 = client_corr.post("/api/v1/auth/login", json={"identifier": "calificador", "password": "Password123"})
    token_calif = resp_login2.json()["access_token"]
    
    vigencia = (datetime.now() + timedelta(days=1)).isoformat()
    resp_pub = client_corr.post(
        "/api/v1/ofertas",
        headers={"Authorization": f"Bearer {token_autor}"},
        data={"titulo": "Oferta Test", "precio": 1000.0, "ubicacion": "Aqui", "vigencia": vigencia, "descripcion": "Desc"},
        files={"foto": ("test.jpg", b"fake", "image/jpeg")}
    )
    assert resp_pub.status_code == 201
    oferta_id = resp_pub.json()["id"]
    
    resp_calif = client_corr.post(f"/api/v1/ofertas/{oferta_id}/calificar", headers={"Authorization": f"Bearer {token_calif}"}, json={"puntuacion": 5})
    assert resp_calif.status_code == 200
    
    feed = client_corr.get("/api/v1/ofertas").json()
    item = next(o for o in feed if o["id"] == oferta_id)
    assert item["promedio_calificacion"] == 5.0
    assert item["total_calificaciones"] == 1

def test_feed_incluye_username_y_url_uploads(client_corr, db_session):
    user = User(username="feed_user", email="feed@test.com", hashed_password=get_password_hash("Password123"))
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    resp_login = client_corr.post("/api/v1/auth/login", json={"identifier": "feed_user", "password": "Password123"})
    token = resp_login.json()["access_token"]
    
    vigencia = (datetime.now() + timedelta(days=1)).isoformat()
    client_corr.post(
        "/api/v1/ofertas",
        headers={"Authorization": f"Bearer {token}"},
        data={"titulo": "Feed Test", "precio": 2000.0, "ubicacion": "Mall", "vigencia": vigencia, "descripcion": "Test feed"},
        files={"foto": ("test.jpg", b"fake", "image/jpeg")}
    )
    
    feed = client_corr.get("/api/v1/ofertas").json()
    assert len(feed) > 0
    item = feed[0]
    assert item["autor_username"] == "feed_user"
    assert item["imagen"].startswith("/api/v1/uploads/")
