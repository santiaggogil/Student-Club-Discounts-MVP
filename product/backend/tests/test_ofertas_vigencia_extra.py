import pytest
from fastapi import status

def test_publicar_vigencia_invalida_422(client, db):
    resp = client.post("/api/v1/ofertas/", 
                       files={"foto": ("test.jpg", b"data", "image/jpeg")}, 
                       data={"titulo": "Oferta Invalida", "precio": 1000.0, "ubicacion": "Manizales", 
                             "vigencia": "2025-13-45T00:00:00", "descripcion": "Prueba fecha invalida"})
    assert resp.status_code == 422
