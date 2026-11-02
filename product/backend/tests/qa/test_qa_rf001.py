import pytest
from fastapi import status

def test_tc_008_proteccion_rutas(client):
    resp = client.post("/api/v1/ofertas/")
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED

def test_tc_009_no_redireccion_api(client):
    resp = client.get("/api/v1/ofertas", follow_redirects=False)
    assert resp.status_code != status.HTTP_307_TEMPORARY_REDIRECT
    assert resp.status_code == status.HTTP_200_OK