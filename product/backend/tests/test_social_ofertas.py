from fastapi.testclient import TestClient
from main import app
from app.social.models import User
from app.ofertas.models import OfertaComunitaria
from app.services.auth import get_password_hash
from datetime import datetime, timezone, timedelta

client = TestClient(app)

def test_perfil_ofertas_completas(db):
    user = User(username="test", hashed_password=get_password_hash("Pass12345678"))
    db.add(user)
    db.commit()
    
    o1 = OfertaComunitaria(titulo="Vieja", precio=10, ubicacion="U", vigencia=datetime.now(timezone.utc)-timedelta(days=1), descripcion="D", autor_id=user.id)
    o2 = OfertaComunitaria(titulo="Nueva", precio=20, ubicacion="U", vigencia=datetime.now(timezone.utc)+timedelta(days=1), descripcion="D", autor_id=user.id)
    db.add_all([o1, o2])
    db.commit()
    
    resp = client.get(f"/api/v1/usuarios/{user.id}")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["ofertas_publicadas"]) == 2
    assert data["ofertas_publicadas"][0]["titulo"] == "Nueva"
    assert "promedio_calificacion" in data["ofertas_publicadas"][0]
