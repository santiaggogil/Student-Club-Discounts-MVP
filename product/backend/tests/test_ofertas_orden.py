import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from app.db.session import Base, get_db
from app.social.models import User
from app.ofertas.models import OfertaComunitaria, Calificacion
from app.services.auth import get_password_hash, create_access_token

@pytest.fixture
def db_session(tmp_path):
    db_path = tmp_path / "test_orden.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    app.dependency_overrides[get_db] = lambda: session
    yield session
    session.close()
    app.dependency_overrides.clear()

@pytest.fixture
def client(db_session):
    return TestClient(app)

def test_ordenamiento_recientes_vs_relevancia_y_con_busqueda(client, db_session):
    # Crear usuario autor y calificador
    autor = User(username="autor", email="autor@test.com", hashed_password=get_password_hash("Password123"))
    calificador = User(username="evaluador", email="evaluador@test.com", hashed_password=get_password_hash("Password123"))
    db_session.add_all([autor, calificador])
    db_session.commit()

    futuro = datetime.now(timezone.utc) + timedelta(days=5)

    # Crear 3 ofertas con distintas calificaciones
    # Oferta 1 (ID menor, mas antigua): Promo Especial Arroz (Calificacion 2.0)
    o1 = OfertaComunitaria(titulo="Promo Especial Arroz", precio=10.0, ubicacion="Centro", vigencia=futuro, descripcion="Arroz economico", autor_id=autor.id)
    # Oferta 2 (ID medio): Promo Especial Combo (Calificacion 5.0)
    o2 = OfertaComunitaria(titulo="Promo Especial Combo", precio=20.0, ubicacion="Cable", vigencia=futuro, descripcion="Hamburguesa y papas", autor_id=autor.id)
    # Oferta 3 (ID mayor, mas reciente): Promo Especial Tacos (Calificacion 3.0)
    o3 = OfertaComunitaria(titulo="Promo Especial Tacos", precio=15.0, ubicacion="Palermo", vigencia=futuro, descripcion="Tacos al pastor", autor_id=autor.id)
    
    db_session.add_all([o1, o2, o3])
    db_session.commit()

    # Calificar ofertas
    c1 = Calificacion(oferta_id=o1.id, usuario_id=calificador.id, puntuacion=2)
    c2 = Calificacion(oferta_id=o2.id, usuario_id=calificador.id, puntuacion=5)
    c3 = Calificacion(oferta_id=o3.id, usuario_id=calificador.id, puntuacion=3)
    db_session.add_all([c1, c2, c3])
    db_session.commit()

    # 1. Probar orden=recientes (ID desc: o3, o2, o1)
    res_recientes = client.get("/api/v1/ofertas?orden=recientes")
    assert res_recientes.status_code == 200
    ids_recientes = [o["id"] for o in res_recientes.json()]
    assert ids_recientes == [o3.id, o2.id, o1.id]

    # 2. Probar orden=relevancia (promedio desc: o2 [5.0], o3 [3.0], o1 [2.0])
    res_relevancia = client.get("/api/v1/ofertas?orden=relevancia")
    assert res_relevancia.status_code == 200
    ids_relevancia = [o["id"] for o in res_relevancia.json()]
    assert ids_relevancia == [o2.id, o3.id, o1.id]
    assert ids_recientes != ids_relevancia

    # 3. Combinado con filtro q='Especial'
    res_q_recientes = client.get("/api/v1/ofertas?q=Especial&orden=recientes")
    assert res_q_recientes.status_code == 200
    ids_q_recientes = [o["id"] for o in res_q_recientes.json()]
    assert ids_q_recientes == [o3.id, o2.id, o1.id]

    res_q_relevancia = client.get("/api/v1/ofertas?q=Especial&orden=relevancia")
    assert res_q_relevancia.status_code == 200
    ids_q_relevancia = [o["id"] for o in res_q_relevancia.json()]
    assert ids_q_relevancia == [o2.id, o3.id, o1.id]
    assert ids_q_recientes != ids_q_relevancia

def test_filtro_vencidas_y_paginacion(client, db_session):
    autor = User(username="autor2", email="autor2@test.com", hashed_password=get_password_hash("Password123"))
    db_session.add(autor)
    db_session.commit()

    pasado = datetime.now(timezone.utc) - timedelta(days=1)
    futuro = datetime.now(timezone.utc) + timedelta(days=1)

    o_vencida = OfertaComunitaria(titulo="Expirada", precio=5.0, ubicacion="Centro", vigencia=pasado, descripcion="Vencida", autor_id=autor.id)
    o_vigente = OfertaComunitaria(titulo="Vigente", precio=10.0, ubicacion="Centro", vigencia=futuro, descripcion="Activa", autor_id=autor.id)
    db_session.add_all([o_vencida, o_vigente])
    db_session.commit()

    res = client.get("/api/v1/ofertas")
    assert res.status_code == 200
    ids = [o["id"] for o in res.json()]
    assert o_vigente.id in ids
    assert o_vencida.id not in ids
