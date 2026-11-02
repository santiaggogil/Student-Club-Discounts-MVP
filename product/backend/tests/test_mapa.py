from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_obtener_mapa_exitoso():
    response = client.get("/api/v1/ofertas/mapa")
    assert response.status_code == 200
    data = response.json()
    assert "ofertas" in data
    assert "sedes" in data