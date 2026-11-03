import pytest
from app.social.models import User
from app.services.auth import get_password_hash

def test_perfil_ofertas_completas(client, db):
    user = User(username='test', hashed_password=get_password_hash('Pass12345678'))
    db.add(user)
    db.commit()
    resp = client.get(f'/api/v1/usuarios/{user.id}')
    assert resp.status_code == 200
