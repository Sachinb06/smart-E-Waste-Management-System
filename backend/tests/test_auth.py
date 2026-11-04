from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "Smart E-Waste" in data["system"]

def test_login_demo_user():
    response = client.post("/api/auth/login", json={
        "email": "demo@ewaste.org",
        "password": "User@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "demo@ewaste.org"
    assert data["user"]["role"] == "user"

def test_login_admin():
    response = client.post("/api/auth/login", json={
        "email": "admin@ewaste.org",
        "password": "Admin@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"
