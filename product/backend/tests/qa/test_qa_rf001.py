import pytest
from fastapi import status

def test_tc_001_registro_exitoso_correo(client, db):
    resp = client.post('/api/v1/auth/register', json={'email': 'test@test.com', 'password': 'Password123'})
    assert resp.status_code == 201

def test_tc_002_registro_exitoso_username(client, db):
    resp = client.post('/api/v1/auth/register', json={'username': 'testuser', 'password': 'Password123'})
    assert resp.status_code == 201

def test_tc_003_registro_duplicado(client, db):
    client.post('/api/v1/auth/register', json={'username': 'dup', 'password': 'Password123'})
    resp = client.post('/api/v1/auth/register', json={'username': 'dup', 'password': 'Password123'})
    assert resp.status_code == 400

def test_tc_004_correo_invalido(client, db):
    resp = client.post('/api/v1/auth/register', json={'email': 'invalid-email', 'password': 'Password123'})
    assert resp.status_code == 422

def test_tc_005_password_invalida(client, db):
    resp = client.post('/api/v1/auth/register', json={'email': 'test@test.com', 'password': 'short'})
    assert resp.status_code == 422