import pytest
from fastapi import status

def test_publicar_vigencia_invalida_422(client, db):
    # Se requiere autenticación para publicar oferta
    resp = client.post("/api/v1/auth/register", json={"username": "testuser", "password": "Password123"})
    login = client.post("/api/v1/auth/login", json={"identifier": "testuser", "password": "Password123"})
    token = login.json()["access_token"]
    
    resp = client.post("/api/v1/ofertas/", 
                       headers={"Authorization": f"Bearer {token}"},
                       files={"foto": ("test.jpg", b"data", "image/jpeg")}, 
                       data={"titulo": "Oferta Invalida", "precio": 1000.0, "ubicacion": "Manizales", 
                             "vigencia": "2025-13-45T00:00:00", "descripcion": "Prueba fecha invalida"})
    assert resp.status_code == 422
