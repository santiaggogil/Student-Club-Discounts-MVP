import sys
import time
from pathlib import Path
from unittest.mock import MagicMock, patch

bot_path = Path(__file__).resolve().parent.parent / "bot"
if str(bot_path) not in sys.path:
    sys.path.insert(0, str(bot_path))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_obtener_mapa_ofertas_exitoso_ac072():
    mock_repo = MagicMock()
    mock_repo.ofertas_vigentes.return_value = [
        {
            "fuente": "exito",
            "tienda": "Éxito",
            "producto": "Leche Entera 1L",
            "precio_actual": 3500.0,
            "ultima_vez": "2025-01-01T10:00:00"
        }
    ]
    mock_sedes = {
        "exito": [
            {
                "cadena": "Éxito",
                "nombre": "Éxito Cable Plaza",
                "lat": 5.0568,
                "lon": -75.4871
            },
            {
                "cadena": "Éxito",
                "nombre": "Sede Sin Coordenadas",
                "lat": None,
                "lon": None
            }
        ]
    }

    with patch("app.mapa.services.cargar_sedes", return_value={"sedes": mock_sedes}), \
         patch("app.mapa.services.RepositorioOfertas", return_value=mock_repo):
        response = client.get("/api/v1/mapa/ofertas")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        sede = data[0]
        assert sede["cadena"] == "Éxito"
        assert sede["nombre"] == "Éxito Cable Plaza"
        assert sede["latitud"] == 5.0568
        assert sede["longitud"] == -75.4871
        assert len(sede["ofertas"]) == 1
        assert sede["ofertas"][0]["producto"] == "Leche Entera 1L"
        assert sede["ofertas"][0]["precio"] == 3500.0

def test_mapa_ofertas_sin_datos_ac073():
    mock_repo = MagicMock()
    mock_repo.ofertas_vigentes.return_value = []
    mock_sedes = {"exito": []}

    with patch("app.mapa.services.cargar_sedes", return_value={"sedes": mock_sedes}), \
         patch("app.mapa.services.RepositorioOfertas", return_value=mock_repo):
        response = client.get("/api/v1/mapa/ofertas")
        assert response.status_code == 200
        assert response.json() == []

def test_mapa_ofertas_conserva_ofertas_anteriores_ac074():
    mock_repo = MagicMock()
    mock_repo.ofertas_vigentes.return_value = [
        {
            "fuente": "olimpica",
            "tienda": "Olímpica",
            "producto": "Arroz 1kg",
            "precio_actual": 4000.0,
            "ultima_vez": "2025-01-01T08:00:00"
        }
    ]
    mock_sedes = {
        "olimpica": [
            {
                "cadena": "Olímpica",
                "nombre": "Olímpica Centro",
                "lat": 5.068,
                "lon": -75.517
            }
        ]
    }

    with patch("app.mapa.services.cargar_sedes", return_value={"sedes": mock_sedes}), \
         patch("app.mapa.services.RepositorioOfertas", return_value=mock_repo):
        response = client.get("/api/v1/mapa/ofertas")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["ofertas"][0]["producto"] == "Arroz 1kg"

def test_mapa_ofertas_tiempo_respuesta_ac075():
    start_time = time.time()
    response = client.get("/api/v1/mapa/ofertas")
    elapsed = time.time() - start_time
    assert response.status_code == 200
    assert elapsed < 2.0
