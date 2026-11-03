import pytest
from fastapi.testclient import TestClient
from main import app
from app.db.session import get_db, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.social.models import User, Seguimiento
from app.services.auth import get_password_hash

@pytest.fixture
def db_session(tmp_path):
    db_path = tmp_path / "test_social.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    app.dependency_overrides[get_db] = lambda: session
    yield session
    session.close()
    app.dependency_overrides.clear()

@pytest.fixture
def client_social(db_session):
    return TestClient(app)

def test_ac_050_seguir_usuario_exitoso(client_social, db_session):
    u1 = User(username="cazador1", email="c1@test.com", hashed_password=get_password_hash("Password123"))
    u2 = User(username="cazador2", email="c2@test.com", hashed_password=get_password_hash("Password123"))
    db_session.add_all([u1, u2])
    db_session.commit()
    db_session.refresh(u1)
    db_session.refresh(u2)

    t1 = client_social.post("/api/v1/auth/login", json={"identifier": "cazador1", "password": "Password123"}).json()["access_token"]

    resp = client_social.post(f"/api/v1/usuarios/{u2.id}/seguir", headers={"Authorization": f"Bearer {t1}"})
    assert resp.status_code == 200
    assert resp.json()["message"] == "Ahora sigues a este usuario"

    perfil = client_social.get(f"/api/v1/usuarios/{u2.id}", headers={"Authorization": f"Bearer {t1}"}).json()
    assert perfil["lo_sigo"] is True
    assert perfil["seguidores_count"] == 1

def test_ac_051_seguir_usuario_duplicado(client_social, db_session):
    u1 = User(username="cazador1_dup", email="c1d@test.com", hashed_password=get_password_hash("Password123"))
    u2 = User(username="cazador2_dup", email="c2d@test.com", hashed_password=get_password_hash("Password123"))
    db_session.add_all([u1, u2])
    db_session.commit()

    t1 = client_social.post("/api/v1/auth/login", json={"identifier": "cazador1_dup", "password": "Password123"}).json()["access_token"]

    client_social.post(f"/api/v1/usuarios/{u2.id}/seguir", headers={"Authorization": f"Bearer {t1}"})
    resp = client_social.post(f"/api/v1/usuarios/{u2.id}/seguir", headers={"Authorization": f"Bearer {t1}"})
    assert resp.status_code == 409

def test_ac_052_dejar_de_seguir(client_social, db_session):
    u1 = User(username="cazador1_unf", email="c1u@test.com", hashed_password=get_password_hash("Password123"))
    u2 = User(username="cazador2_unf", email="c2u@test.com", hashed_password=get_password_hash("Password123"))
    db_session.add_all([u1, u2])
    db_session.commit()

    t1 = client_social.post("/api/v1/auth/login", json={"identifier": "cazador1_unf", "password": "Password123"}).json()["access_token"]

    client_social.post(f"/api/v1/usuarios/{u2.id}/seguir", headers={"Authorization": f"Bearer {t1}"})
    resp = client_social.delete(f"/api/v1/usuarios/{u2.id}/seguir", headers={"Authorization": f"Bearer {t1}"})
    assert resp.status_code == 200

    perfil = client_social.get(f"/api/v1/usuarios/{u2.id}", headers={"Authorization": f"Bearer {t1}"}).json()
    assert perfil["lo_sigo"] is False
    assert perfil["seguidores_count"] == 0

def test_ac_053_no_seguirse_a_si_mismo(client_social, db_session):
    u1 = User(username="cazador_self", email="self@test.com", hashed_password=get_password_hash("Password123"))
    db_session.add(u1)
    db_session.commit()

    t1 = client_social.post("/api/v1/auth/login", json={"identifier": "cazador_self", "password": "Password123"}).json()["access_token"]

    resp = client_social.post(f"/api/v1/usuarios/{u1.id}/seguir", headers={"Authorization": f"Bearer {t1}"})
    assert resp.status_code == 400

def test_seguir_usuario_inexistente(client_social, db_session):
    u1 = User(username="cazador_404", email="c404@test.com", hashed_password=get_password_hash("Password123"))
    db_session.add(u1)
    db_session.commit()

    t1 = client_social.post("/api/v1/auth/login", json={"identifier": "cazador_404", "password": "Password123"}).json()["access_token"]

    resp = client_social.post("/api/v1/usuarios/99999/seguir", headers={"Authorization": f"Bearer {t1}"})
    assert resp.status_code == 404

def test_seguir_sin_autenticacion(client_social, db_session):
    resp = client_social.post("/api/v1/usuarios/1/seguir")
    assert resp.status_code == 401
