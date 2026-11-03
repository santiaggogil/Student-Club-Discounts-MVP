import pytest
from fastapi import status

def test_publicar_vigencia_invalida_422(client, db):
    # Se usa un formato de fecha que Pydantic pueda parsear pero que sea inválido lógicamente si fuera necesario,
    # o simplemente un formato que no sea ISO válido para disparar el error de validación esperado.
    resp = client.post("/api/v1/ofertas/", 
                       files={"foto": ("test.jpg", b"data", "image/jpeg")}, 
                       data={"titulo": "Oferta Invalida", "precio": 1000.0, "ubicacion": "Manizales", 
                             "vigencia": "2025-13-45T00:00:00", "descripcion": "Prueba fecha invalida"})
    assert resp.status_code == 422
