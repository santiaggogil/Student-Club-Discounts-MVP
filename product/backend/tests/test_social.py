import pytest
from fastapi import status
from app.social.models import User
from app.services.auth import get_password_hash

def test_seguir_sin_autenticacion(client, db):
    resp = client.post('/api/v1/usuarios/1/seguir')
    assert resp.status_code == 401

def test_seguir_usuario_exitoso(client, db):
    user1 = User(username='u1', hashed_password=get_password_hash('Pass12345678'))
    user2 = User(username='u2', hashed_password=get_password_hash('Pass12345678'))
    db.add(user1)
    db.add(user2)
    db.commit()
    token = client.post('/api/v1/auth/login', json={'identifier': 'u1', 'password': 'Pass12345678'}).json()['access_token']
    resp = client.post(f'/api/v1/usuarios/{user2.id}/seguir', headers={'Authorization': f'Bearer {token}'})
    assert resp.status_code == 200

def test_dejar_de_seguir_usuario(client, db):
    user1 = User(username='u3', hashed_password=get_password_hash('Pass12345678'))
    user2 = User(username='u4', hashed_password=get_password_hash('Pass12345678'))
    db.add(user1)
    db.add(user2)
    db.commit()
    token = client.post('/api/v1/auth/login', json={'identifier': 'u3', 'password': 'Pass12345678'}).json()['access_token']
    client.post(f'/api/v1/usuarios/{user2.id}/seguir', headers={'Authorization': f'Bearer {token}'})
    resp = client.delete(f'/api/v1/usuarios/{user2.id}/seguir', headers={'Authorization': f'Bearer {token}'})
    assert resp.status_code == 200
