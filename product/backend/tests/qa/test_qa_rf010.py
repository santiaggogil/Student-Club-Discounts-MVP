import pytest
from fastapi import status
from app.ofertas.models import OfertaComunitaria, Calificacion
from app.social.models import User
from app.services.auth import get_password_hash, create_access_token

def test_tc_032_calificar_oferta_ajena(client, db):
    u1 = User(username='u1', hashed_password=get_password_hash('Pass12345678'))
    u2 = User(username='u2', hashed_password=get_password_hash('Pass12345678'))
    db.add_all([u1, u2])
    db.commit()
    o = OfertaComunitaria(titulo='O', precio=10.0, ubicacion='U', vigencia='2025-01-01 00:00:00', descripcion='D', autor_id=u1.id)
    db.add(o)
    db.commit()
    token = create_access_token({'sub': str(u2.id)})
    resp = client.post(f'/api/v1/ofertas/{o.id}/calificar', json={'puntuacion': 5}, headers={'Authorization': f'Bearer {token}'})
    assert resp.status_code == 200
    assert resp.json()['promedio'] == 5.0

def test_tc_033_modificar_calificacion(client, db):
    u1 = User(username='u1_mod', hashed_password=get_password_hash('Pass12345678'))
    u2 = User(username='u2_mod', hashed_password=get_password_hash('Pass12345678'))
    db.add_all([u1, u2])
    db.commit()
    o = OfertaComunitaria(titulo='O2', precio=10.0, ubicacion='U', vigencia='2025-01-01 00:00:00', descripcion='D', autor_id=u1.id)
    db.add(o)
    db.commit()
    token = create_access_token({'sub': str(u2.id)})
    
    # Primera calificación
    client.post(f'/api/v1/ofertas/{o.id}/calificar', json={'puntuacion': 1}, headers={'Authorization': f'Bearer {token}'})
    
    # Modificación
    resp = client.post(f'/api/v1/ofertas/{o.id}/calificar', json={'puntuacion': 5}, headers={'Authorization': f'Bearer {token}'})
    assert resp.status_code == 200
    assert resp.json()['promedio'] == 5.0
    
    # Verificar que solo hay 1 calificación en BD
    total_cals = db.query(Calificacion).filter_by(oferta_id=o.id, usuario_id=u2.id).count()
    assert total_cals == 1

def test_tc_034_no_calificar_propia(client, db):
    u1 = User(username='u1_propia', hashed_password=get_password_hash('Pass12345678'))
    db.add(u1)
    db.commit()
    o = OfertaComunitaria(titulo='O', precio=10.0, ubicacion='U', vigencia='2025-01-01 00:00:00', descripcion='D', autor_id=u1.id)
    db.add(o)
    db.commit()
    token = create_access_token({'sub': str(u1.id)})
    resp = client.post(f'/api/v1/ofertas/{o.id}/calificar', json={'puntuacion': 5}, headers={'Authorization': f'Bearer {token}'})
    assert resp.status_code == 400

def test_tc_035_no_calificar_sin_sesion(client, db):
    u1 = User(username='u1_sin', hashed_password=get_password_hash('Pass12345678'))
    db.add(u1)
    db.commit()
    o = OfertaComunitaria(titulo='O', precio=10.0, ubicacion='U', vigencia='2025-01-01 00:00:00', descripcion='D', autor_id=u1.id)
    db.add(o)
    db.commit()
    resp = client.post(f'/api/v1/ofertas/{o.id}/calificar', json={'puntuacion': 5})
    assert resp.status_code == 401
