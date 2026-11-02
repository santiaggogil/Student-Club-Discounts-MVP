from fastapi.testclient import TestClient
from main import app
from app.services.auth import get_password_hash
from app.social.models import User
from app.db.session import SessionLocal

client = TestClient(app)

def test_login_flow():
    db = SessionLocal()
    user = User(username="testuser", hashed_password=get_password_hash("Password123"))
    db.add(user)
    db.commit()
    
    # Login exitoso
    resp = client.post("/api/v1/auth/login", json={"identifier": "testuser", "password": "Password123"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()
    
    # Login fallido
    resp = client.post("/api/v1/auth/login", json={"identifier": "testuser", "password": "WrongPass"})
    assert resp.status_code == 401
    
    db.delete(user)
    db.commit()
    db.close()

def test_logout():
    resp = client.post("/api/v1/auth/logout", headers={"Authorization": "Bearer fake"})
    assert resp.status_code == 200
