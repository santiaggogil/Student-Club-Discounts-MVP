from fastapi.testclient import TestClient
from main import app
from app.db.session import SessionLocal
from app.social.models import User
from app.services.auth import get_password_hash, create_access_token

client = TestClient(app)

def test_perfil_me_y_actualizar():
    db = SessionLocal()
    db.query(User).filter(User.username == "socialuser").delete()
    db.commit()

    user = User(username="socialuser", email="social@test.com", hashed_password=get_password_hash("Password123"))
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})

    # GET /api/v1/usuarios/me
    resp = client.get("/api/v1/usuarios/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["username"] == "socialuser"
    assert "hashed_password" not in resp.json()

    # PUT /api/v1/usuarios/me (con biografía HTML que debe sanitizarse a texto plano)
    resp_put = client.put(
        "/api/v1/usuarios/me",
        headers={"Authorization": f"Bearer {token}"},
        data={"nombre": "Nombre Real", "biografia": "<b>Hola</b> esto es texto plano", "seguidores_privados": "true"},
        files={"foto": ("perfil.jpg", b"fake image", "image/jpeg")}
    )
    assert resp_put.status_code == 200
    data = resp_put.json()
    assert data["nombre"] == "Nombre Real"
    assert data["biografia"] == "Hola esto es texto plano"
    assert data["seguidores_privados"] is True

    # GET /api/v1/usuarios/{id}
    resp_public = client.get(f"/api/v1/usuarios/{user.id}", headers={"Authorization": f"Bearer {token}"})
    assert resp_public.status_code == 200
    assert resp_public.json()["nombre"] == "Nombre Real"

    db.delete(user)
    db.commit()
    db.close()

def test_perfil_publico_no_encontrado():
    resp = client.get("/api/v1/usuarios/99999")
    assert resp.status_code == 404
