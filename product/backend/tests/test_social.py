import pytest
from fastapi import status

def test_seguir_sin_autenticacion(client, db):
    # POST /api/v1/usuarios/1/seguir requiere autenticación
    resp = client.post('/api/v1/usuarios/1/seguir')
    assert resp.status_code == 401

def test_seguir_usuario_exitoso(client, db):
    # Crear dos usuarios
    client.post('/api/v1/auth/register', json={'username': 'u1', 'password': 'Password123'})
    client.post('/api/v1/auth/register', json={'username': 'u2', 'password': 'Password123'})
    login = client.post('/api/v1/auth/login', json={'identifier': 'u1', 'password': 'Password123'})
    token = login.json()['access_token']
    
    resp = client.post('/api/v1/usuarios/2/seguir', headers={'Authorization': f'Bearer {token}'})
    assert resp.status_code == 200

def test_dejar_de_seguir_usuario(client, db):
    client.post('/api/v1/auth/register', json={'username': 'u1', 'password': 'Password123'})
    client.post('/api/v1/auth/register', json={'username': 'u2', 'password': 'Password123'})
    login = client.post('/api/v1/auth/login', json={'identifier': 'u1', 'password': 'Password123'})
    token = login.json()['access_token']
    
    client.post('/api/v1/usuarios/2/seguir', headers={'Authorization': f'Bearer {token}'})
    resp = client.delete('/api/v1/usuarios/2/seguir', headers={'Authorization': f'Bearer {token}'})
    assert resp.status_code == 200
