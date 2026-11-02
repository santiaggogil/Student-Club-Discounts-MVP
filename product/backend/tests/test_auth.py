from app.services.auth import verify_password, get_password_hash, create_access_token

def test_password_hashing():
    password = "Password123"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed)
    assert not verify_password("wrong", hashed)

def test_jwt_creation():
    token = create_access_token({"sub": "user1"})
    assert isinstance(token, str)
    assert len(token) > 0