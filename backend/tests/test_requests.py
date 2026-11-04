from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_centers():
    response = client.get("/api/centers")
    assert response.status_code == 200
    centers = response.json()
    assert len(centers) >= 4
    assert any("EcoGreen" in c["name"] for c in centers)

def test_iot_bins():
    response = client.get("/api/iot/bins")
    assert response.status_code == 200
    bins = response.json()
    assert len(bins) == 4
    categories = [b["category"] for b in bins]
    assert "Mobile Phones & Gadgets" in categories
    assert "Batteries" in categories

def test_create_and_track_request():
    req_payload = {
        "item_name": "Broken Tablet",
        "category": "Mobile Phones & Gadgets",
        "quantity": 1,
        "weight_kg": 0.5,
        "condition": "Non-functional",
        "address": "123 Test Street",
        "city": "Metro City",
        "postal_code": "10001",
        "preferred_pickup_date": "2026-11-01",
        "contact_number": "+1 555-0199",
        "notes": "Screen broken"
    }
    response = client.post("/api/requests", json=req_payload)
    assert response.status_code == 200
    data = response.json()
    assert "request_code" in data
    assert data["status"] == "Pending"

    # Track by request code
    code = data["request_code"]
    track_res = client.get(f"/api/requests/track/{code}")
    assert track_res.status_code == 200
    track_data = track_res.json()
    assert track_data["request_code"] == code
    assert track_data["item_name"] == "Broken Tablet"
