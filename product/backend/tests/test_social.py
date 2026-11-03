from fastapi.testclient import TestClient
from main import app
from app.social.models import User, Seguimiento
from app.services.auth import get_password_hash

client = TestClient(app)

def test_seguir_sin_autenticacion(db_session):
    resp = client.post("/api/v1/usuarios/1/seguir")
    assert resp.status_code == 401

def test_seguir_usuario_exitoso(db_session):
    u1 = User(username="u1", hashed_password=get_password_hash("Pass12345678"))
    u2 = User(username="u2", hashed_password=get_password_hash("Pass12345678"))
    db_session.add_all([u1, u2])
    db_session.commit()
    
    token = client.post("/api/v1/auth/login", json={"identifier": "u1", "password": "Pass12345678"}).json()["access_token"]
    resp = client.post(f"/api/v1/usuarios/{u2.id}/seguir", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert db_session.query(Seguimiento).filter(Seguimiento.seguidor_id == u1.id, Seguimiento.seguido_id == u2.id).first() is not None

def test_dejar_de_seguir_usuario(db_session):
    u1 = User(username="u1", hashed_password=get_password_hash("Pass12345678"))
    u2 = User(username="u2", hashed_password=get_password_hash("Pass12345678"))
    db_session.add_all([u1, u2])
    db_session.commit()
    
    s = Seguimiento(seguidor_id=u1.id, seguido_id=u2.id)
    db_session.add(s)
    db_session.commit()
    
    token = client.post("/api/v1/auth/login", json={"identifier": "u1", "password": "Pass12345678"}).json()["access_token"]
    resp = client.delete(f"/api/v1/usuarios/{u2.id}/seguir", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert db_session.query(Seguimiento).filter(Seguimiento.seguidor_id == u1.id, Seguimiento.seguido_id == u2.id).first() is None
