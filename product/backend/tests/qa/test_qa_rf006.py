import pytest
from fastapi import status
from unittest.mock import patch
import time

def test_tc_021_formato_invalido(client, db):
    resp = client.post("/api/v1/ofertas/", files={"foto": ("test.txt", b"data", "text/plain")}, data={"titulo": "T", "precio": 1, "ubicacion": "U", "vigencia": "2025-01-01T00:00:00", "descripcion": "D"})
    assert resp.status_code == 422

def test_tc_022_fallo_procesamiento(client, db):
    with patch("app.ofertas.services.OfertaService.procesar_y_guardar_imagen", side_effect=Exception("Fail")):
        resp = client.post("/api/v1/ofertas/", files={"foto": ("test.jpg", b"data", "image/jpeg")}, data={"titulo": "T", "precio": 1, "ubicacion": "U", "vigencia": "2025-01-01T00:00:00", "descripcion": "D"})
        assert resp.status_code == 422

def test_tc_023_respuesta_inmediata(client, db):
    start = time.time()
    resp = client.post("/api/v1/ofertas/", files={"foto": ("test.jpg", b"data", "image/jpeg")}, data={"titulo": "T", "precio": 1, "ubicacion": "U", "vigencia": "2025-01-01T00:00:00", "descripcion": "D"})
    end = time.time()
    assert (end - start) < 1.0