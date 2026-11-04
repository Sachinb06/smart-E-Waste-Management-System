"""
Automated end-to-end API and AI detection verification script.
Tests:
1. Health check & Root
2. Authentication (Login demo user and admin)
3. AI detection endpoint with image upload
4. Collection request creation & live tracking lookup
5. IoT Bins and Ultrasonic telemetry ingestion
6. Analytics overview
7. Admin CSV export endpoint
"""

import sys
import io
from PIL import Image, ImageDraw
import httpx

BASE_URL = "http://127.0.0.1:8000"

def run_checks():
    client = httpx.Client(base_url=BASE_URL, timeout=30.0)

    print("\n--- 1. Testing Root & Health ---")
    r = client.get("/")
    assert r.status_code == 200, f"Root failed: {r.text}"
    print("[OK] Root endpoint:", r.json()["system"])

    r = client.get("/health")
    assert r.status_code == 200
    print("[OK] Health check: healthy")

    print("\n--- 2. Testing Authentication ---")
    r = client.post("/api/auth/login", json={"email": "admin@ewaste.org", "password": "Admin@123"})
    assert r.status_code == 200, f"Admin login failed: {r.text}"
    admin_token = r.json()["access_token"]
    print("[OK] Admin login successful. Role:", r.json()["user"]["role"])

    r = client.post("/api/auth/login", json={"email": "demo@ewaste.org", "password": "User@123"})
    assert r.status_code == 200, f"User login failed: {r.text}"
    user_token = r.json()["access_token"]
    print("[OK] User login successful. Role:", r.json()["user"]["role"])

    print("\n--- 3. Testing AI Camera Detection Endpoint ---")
    # Draw an image with a phone-like shape to test detection
    img = Image.new("RGB", (640, 480), color=(240, 240, 240))
    draw = ImageDraw.Draw(img)
    # Draw dark smartphone rectangle
    draw.rectangle([200, 100, 440, 400], fill=(20, 20, 20), outline=(0, 0, 0), width=3)
    draw.rectangle([210, 130, 430, 370], fill=(80, 120, 160)) # screen
    draw.ellipse([310, 380, 330, 395], fill=(200, 200, 200)) # home button

    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    detect_res = client.post(
        "/api/detect-ewaste",
        files={"image": ("test_phone.jpg", buf.getvalue(), "image/jpeg")}
    )
    assert detect_res.status_code == 200, f"Detection failed: {detect_res.text}"
    det_data = detect_res.json()
    print("[OK] Detection response received:")
    print("  - Detected Object:", det_data["detected_object"])
    print("  - Category:", det_data["category"])
    print("  - Confidence:", det_data["confidence"])
    print("  - Recommended Bin:", det_data["recommended_bin"])
    print("  - Safe Guidance:", det_data["disposal_guidance"][:60], "...")

    print("\n--- 4. Testing Collection Request Creation & Tracking ---")
    req_body = {
        "item_name": "Old Smartphone & Charger",
        "category": "Mobile Phones & Gadgets",
        "quantity": 1,
        "weight_kg": 0.35,
        "condition": "Used / Non-functional",
        "address": "123 Green Earth Way",
        "city": "Metro City",
        "postal_code": "10001",
        "preferred_pickup_date": "2026-10-30",
        "contact_number": "+1 (555) 019-9988",
        "notes": "Battery intact, data wiped",
        "detection_id": det_data.get("history_id")
    }
    create_res = client.post("/api/requests", json=req_body, headers={"Authorization": f"Bearer {user_token}"})
    assert create_res.status_code == 200, f"Create request failed: {create_res.text}"
    req_data = create_res.json()
    req_code = req_data["request_code"]
    print(f"[OK] Collection Request created: {req_code} (Status: {req_data['status']})")

    # Track by unique code
    track_res = client.get(f"/api/requests/track/{req_code}")
    assert track_res.status_code == 200, f"Tracking failed: {track_res.text}"
    assert track_res.json()["request_code"] == req_code
    print("[OK] Real-time status tracking confirmed:", track_res.json()["status"])

    print("\n--- 5. Testing IoT Bins & Hardware Ultrasonic Telemetry ---")
    bins_res = client.get("/api/iot/bins")
    assert bins_res.status_code == 200
    bins = bins_res.json()
    print(f"[OK] Retrieved {len(bins)} IoT Bins:")
    for b in bins:
        print(f"  - [{b['bin_code']}] {b['bin_name']}: {b['current_fill_percentage']}% ({b['status']})")

    # Ingest real sensor telemetry
    telemetry_body = {
        "bin_code": "BIN-MOBILE-01",
        "distance_cm": 25.0,
        "total_depth_cm": 100.0,
        "device_id": "ESP32-STATION-01"
    }
    telem_res = client.post("/api/iot/telemetry", json=telemetry_body)
    assert telem_res.status_code == 200
    print("[OK] ESP32 ultrasonic packet ingested! Updated fill%:", telem_res.json()["fill_percentage"])

    print("\n--- 6. Testing Analytics Overview ---")
    analytics_res = client.get("/api/analytics/overview")
    assert analytics_res.status_code == 200
    a_data = analytics_res.json()
    print("[OK] Analytics Overview:")
    print("  - Total Detections:", a_data["total_detections"])
    print("  - Total Requests:", a_data["total_requests"])
    print("  - Total Weight (kg):", a_data["total_weight_kg"])
    print("  - Categories Breakdown:", len(a_data["categories_breakdown"]), "categories")

    print("\n--- 7. Testing Admin CSV Export ---")
    csv_res = client.get("/api/admin/export-requests-csv", headers={"Authorization": f"Bearer {admin_token}"})
    assert csv_res.status_code == 200
    assert "Request ID" in csv_res.text
    print("[OK] Admin CSV Export returned valid CSV with length:", len(csv_res.text), "bytes")

    print("\n=======================================================")
    print("  ALL 7 CORE SYSTEM WORKFLOWS VERIFIED 100% OPERATIONAL")
    print("=======================================================\n")

if __name__ == "__main__":
    try:
        run_checks()
    except Exception as e:
        print("Verification error:", e)
        sys.exit(1)
