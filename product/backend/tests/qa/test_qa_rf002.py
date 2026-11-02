import pytest
from fastapi import status
from app.db.session import get_db
from main import app

@pytest.fixture
def client_with_db(db, monkeypatch):
    app.dependency_overrides[get_db] = lambda: db
    from fastapi.testclient import TestClient
    return TestClient(app)

def test_tc_008_login_exitoso(client_with_db, db):
    from app.social.models import User
    from app.services.auth import get_password_hash
    user = User(username='test', hashed_password=get_password_hash('Pass12345678'))
    db.add(user)
    db.commit()
    resp = client_with_db.post('/api/v1/auth/login', json={'identifier': 'test', 'password': 'Pass12345678'})
    assert resp.status_code == 200
    assert 'access_token' in resp.json()

def test_tc_009_login_fallido(client_with_db):
    resp = client_with_db.post('/api/v1/auth/login', json={'identifier': 'test', 'password': 'wrong'})
    assert resp.status_code == 401

def test_tc_010_sesion_valida(client_with_db, db):
    from app.social.models import User
    from app.services.auth import get_password_hash
    user = User(username='test', hashed_password=get_password_hash('Pass12345678'))
    db.add(user)
    db.commit()
    token = client_with_db.post('/api/v1/auth/login', json={'identifier': 'test', 'password': 'Pass12345678'}).json()['access_token']
    resp = client_with_db.get('/api/v1/ofertas', headers={'Authorization': f'Bearer {token}'})
    assert resp.status_code == 200

def test_tc_011_sesion_expirada(client_with_db, db):
    from app.social.models import User
    from app.services.auth import get_password_hash, create_access_token
    from datetime import timedelta
    user = User(username='test', hashed_password=get_password_hash('Pass12345678'))
    db.add(user)
    db.commit()
    token = create_access_token({'sub': str(user.id)}, expires_delta=timedelta(minutes=-31))
    resp = client_with_db.get('/api/v1/ofertas', headers={'Authorization': f'Bearer {token}'})
    assert resp.status_code == 401

def test_tc_012_logout(client_with_db, db):
    from app.social.models import User
    from app.services.auth import get_password_hash
    user = User(username='test', hashed_password=get_password_hash('Pass12345678'))
    db.add(user)
    db.commit()
    token = client_with_db.post('/api/v1/auth/login', json={'identifier': 'test', 'password': 'Pass12345678'}).json()['access_token']
    resp = client_with_db.post('/api/v1/auth/logout', headers={'Authorization': f'Bearer {token}'})
    assert resp.status_code == 200