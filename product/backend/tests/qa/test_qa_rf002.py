import pytest
from fastapi.testclient import TestClient
from app.services.auth import get_password_hash, create_access_token
from app.social.models import User
from datetime import timedelta, datetime

def test_tc_008_login_exitoso(client, db):
    user = User(username='test', hashed_password=get_password_hash('Pass12345678'))
    db.add(user)
    db.commit()
    resp = client.post('/api/v1/auth/login', json={'identifier': 'test', 'password': 'Pass12345678'})
    assert resp.status_code == 200
    assert 'access_token' in resp.json()

def test_tc_009_login_fallido(client):
    resp = client.post('/api/v1/auth/login', json={'identifier': 'test', 'password': 'wrong'})
    assert resp.status_code == 401

def test_tc_010_sesion_valida(client, db):
    user = User(username='test', hashed_password=get_password_hash('Pass12345678'))
    db.add(user)
    db.commit()
    token = client.post('/api/v1/auth/login', json={'identifier': 'test', 'password': 'Pass12345678'}).json()['access_token']
    resp = client.get('/api/v1/ofertas', headers={'Authorization': f'Bearer {token}'})
    assert resp.status_code == 200

def test_tc_011_sesion_expirada(client, db):
    user = User(username='test', hashed_password=get_password_hash('Pass12345678'))
    db.add(user)
    db.commit()
    token = create_access_token({'sub': str(user.id)}, expires_delta=timedelta(minutes=-31))
    resp = client.get('/api/v1/ofertas', headers={'Authorization': f'Bearer {token}'})
    assert resp.status_code == 401

def test_tc_012_logout(client, db):
    user = User(username='test', hashed_password=get_password_hash('Pass12345678'))
    db.add(user)
    db.commit()
    token = client.post('/api/v1/auth/login', json={'identifier': 'test', 'password': 'Pass12345678'}).json()['access_token']
    resp = client.post('/api/v1/auth/logout', headers={'Authorization': f'Bearer {token}'})
    assert resp.status_code == 200