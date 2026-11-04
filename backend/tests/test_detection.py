import io
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_detect_ewaste_endpoint_valid_image():
    # Create a small valid test image in memory
    img = Image.new("RGB", (320, 240), color=(73, 109, 137))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    response = client.post(
        "/api/detect-ewaste",
        files={"image": ("test_circuit.jpg", buf.getvalue(), "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "detected_object" in data
    assert "category" in data
    assert "confidence" in data
    assert "recommended_bin" in data
    assert "disposal_guidance" in data

def test_detect_ewaste_invalid_file_extension():
    response = client.post(
        "/api/detect-ewaste",
        files={"image": ("document.pdf", b"%PDF-1.4...", "application/pdf")}
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]
