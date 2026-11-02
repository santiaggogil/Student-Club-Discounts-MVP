import pytest
import time
from fastapi import status
from app.db.session import get_db
from main import app

def test_tc_024_feed_muestra_detalles(client, db):
    resp = client.get('/api/v1/ofertas')
    assert resp.status_code == 200
    data = resp.json()
    if len(data) > 0:
        assert 'titulo' in data[0]
        assert 'descripcion' in data[0]
        assert 'ubicacion' in data[0]
        assert 'autor_id' in data[0]

def test_tc_025_feed_paginacion_tandas(client, db):
    resp1 = client.get('/api/v1/ofertas?page=1&size=1')
    resp2 = client.get('/api/v1/ofertas?page=2&size=1')
    assert resp1.status_code == 200
    assert resp2.status_code == 200

def test_tc_026_feed_estado_vacio(client, db):
    resp = client.get('/api/v1/ofertas?page=999&size=10')
    assert resp.status_code == 200
    assert resp.json() == []

def test_tc_027_tiempo_carga_feed(client, db):
    start = time.time()
    resp = client.get('/api/v1/ofertas')
    end = time.time()
    assert resp.status_code == 200
    assert (end - start) < 2.0