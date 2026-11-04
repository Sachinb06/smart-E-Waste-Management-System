import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .models import User, IoTBin, CollectionCenter, CollectionRequest, DetectionHistory
from .auth import get_password_hash

def seed_database(db: Session):
    # 1. Seed Users if not present
    admin = db.query(User).filter(User.email == "admin@ewaste.org").first()
    if not admin:
        admin = User(
            email="admin@ewaste.org",
            hashed_password=get_password_hash("Admin@123"),
            full_name="System Administrator",
            phone="+1 (555) 019-2831",
            role="admin"
        )
        db.add(admin)

    demo_user = db.query(User).filter(User.email == "demo@ewaste.org").first()
    if not demo_user:
        demo_user = User(
            email="demo@ewaste.org",
            hashed_password=get_password_hash("User@123"),
            full_name="Eco Champion",
            phone="+1 (555) 014-9922",
            role="user"
        )
        db.add(demo_user)

    db.commit()

    # 2. Seed IoT Bins (matching the smart IoT e-waste prototype)
    if db.query(IoTBin).count() == 0:
        bins = [
            IoTBin(
                bin_code="BIN-MOBILE-01",
                category="Mobile Phones & Gadgets",
                bin_name="Mobile & Gadgets Bin",
                location="Main Lobby - Sector A",
                max_capacity_liters=100.0,
                current_fill_percentage=38.5,
                status="Normal",
                is_simulated=True
            ),
            IoTBin(
                bin_code="BIN-COMP-01",
                category="Computers & Accessories",
                bin_name="Computers & Accessories Bin",
                location="Hardware Depository - Sector B",
                max_capacity_liters=250.0,
                current_fill_percentage=64.0,
                status="Normal",
                is_simulated=True
            ),
            IoTBin(
                bin_code="BIN-BATT-01",
                category="Batteries",
                bin_name="Battery Collection Bin",
                location="Fire-Isolated Zone - Bay 3",
                max_capacity_liters=60.0,
                current_fill_percentage=82.0,
                status="Warning",
                is_simulated=True
            ),
            IoTBin(
                bin_code="BIN-CABLE-01",
                category="Cables & Chargers",
                bin_name="Cables & Chargers Bin",
                location="Main Lobby - Sector A",
                max_capacity_liters=80.0,
                current_fill_percentage=26.0,
                status="Normal",
                is_simulated=True
            )
        ]
        db.add_all(bins)
        db.commit()

    # 3. Seed Collection Centers
    if db.query(CollectionCenter).count() == 0:
        centers = [
            CollectionCenter(
                name="EcoGreen Central E-Waste Facility",
                address="45 Industrial Park Road, Bay 4",
                city="Metro City",
                postal_code="10001",
                phone="+1 (555) 234-5678",
                email="contact@ecogreen-ewaste.org",
                operating_hours="Mon - Sat: 8:30 AM - 6:00 PM",
                accepted_categories_json=json.dumps([
                    "Mobile Phones & Gadgets",
                    "Computers & Accessories",
                    "Batteries",
                    "Cables & Chargers",
                    "TVs & Monitors",
                    "Other Electronic Waste"
                ]),
                latitude=40.7128,
                longitude=-74.0060,
                is_active=True
            ),
            CollectionCenter(
                name="TechRecycle Municipal Drop-off Station",
                address="128 Civic Center Blvd",
                city="Metro City",
                postal_code="10002",
                phone="+1 (555) 345-6789",
                email="depot@techrecycle.gov",
                operating_hours="Mon - Fri: 9:00 AM - 5:00 PM",
                accepted_categories_json=json.dumps([
                    "Mobile Phones & Gadgets",
                    "Computers & Accessories",
                    "Cables & Chargers"
                ]),
                latitude=40.7250,
                longitude=-73.9980,
                is_active=True
            ),
            CollectionCenter(
                name="SafeBattery Hazardous Disposal Depot",
                address="88 Hazard Mitigation Way",
                city="Westside",
                postal_code="10005",
                phone="+1 (555) 987-6543",
                email="hazmat@safebattery.org",
                operating_hours="Tue - Sat: 10:00 AM - 4:00 PM",
                accepted_categories_json=json.dumps([
                    "Batteries",
                    "TVs & Monitors"
                ]),
                latitude=40.7400,
                longitude=-74.0200,
                is_active=True
            ),
            CollectionCenter(
                name="GreenFuture Community Collection Hub",
                address="210 Green Valley Drive",
                city="North Suburb",
                postal_code="10012",
                phone="+1 (555) 456-7890",
                email="hub@greenfuture.org",
                operating_hours="Mon - Sun: 9:00 AM - 7:00 PM",
                accepted_categories_json=json.dumps([
                    "Mobile Phones & Gadgets",
                    "Cables & Chargers",
                    "Other Electronic Waste"
                ]),
                latitude=40.7600,
                longitude=-73.9800,
                is_active=True
            )
        ]
        db.add_all(centers)
        db.commit()

    # 4. Seed initial Collection Requests & Detections for rich dashboard analytics
    if db.query(CollectionRequest).count() == 0:
        reqs = [
            CollectionRequest(
                request_code="EW-20261020-A101",
                user_id=demo_user.id if demo_user else None,
                item_name="Old iPhone 8 & Samsung Galaxy S9",
                category="Mobile Phones & Gadgets",
                quantity=2,
                weight_kg=0.45,
                condition="Used / Non-functional",
                address="742 Evergreen Terrace",
                city="Metro City",
                postal_code="10001",
                preferred_pickup_date="2026-10-28",
                contact_number="+1 (555) 014-9922",
                notes="Cracked glass on iPhone; batteries intact without swelling.",
                status="Pickup Scheduled"
            ),
            CollectionRequest(
                request_code="EW-20261021-B202",
                user_id=demo_user.id if demo_user else None,
                item_name="Dell Inspiron 15 Laptop & Charger",
                category="Computers & Accessories",
                quantity=1,
                weight_kg=2.3,
                condition="Repairable",
                address="742 Evergreen Terrace",
                city="Metro City",
                postal_code="10001",
                preferred_pickup_date="2026-10-29",
                contact_number="+1 (555) 014-9922",
                notes="Hard drive formatted, RAM intact.",
                status="Approved"
            ),
            CollectionRequest(
                request_code="EW-20261022-C303",
                user_id=None,
                item_name="Batch of 12 Lithium-ion Laptop Batteries",
                category="Batteries",
                quantity=12,
                weight_kg=3.6,
                condition="Non-functional",
                address="500 Tech Boulevard",
                city="Westside",
                postal_code="10005",
                preferred_pickup_date="2026-10-27",
                contact_number="+1 (555) 888-1234",
                notes="Terminals insulated with electrical tape.",
                status="Pending"
            ),
            CollectionRequest(
                request_code="EW-20261015-D404",
                user_id=demo_user.id if demo_user else None,
                item_name="Assorted HDMI & Power Cables (15 pcs)",
                category="Cables & Chargers",
                quantity=15,
                weight_kg=1.8,
                condition="Used / Non-functional",
                address="12 High St, Apt 4B",
                city="Metro City",
                postal_code="10002",
                preferred_pickup_date="2026-10-18",
                contact_number="+1 (555) 321-4321",
                notes="All coiled with twist ties.",
                status="Recycled"
            ),
            CollectionRequest(
                request_code="EW-20261016-E505",
                user_id=None,
                item_name="Samsung 32-inch LED Television",
                category="TVs & Monitors",
                quantity=1,
                weight_kg=6.5,
                condition="Non-functional",
                address="90 Oak Lane",
                city="North Suburb",
                postal_code="10012",
                preferred_pickup_date="2026-10-19",
                contact_number="+1 (555) 777-6543",
                notes="Screen intact, main board failed power supply.",
                status="Collected"
            )
        ]
        db.add_all(reqs)
        db.commit()

    if db.query(DetectionHistory).count() == 0:
        det = DetectionHistory(
            user_id=demo_user.id if demo_user else None,
            image_path="/uploads/sample_mobile.jpg",
            original_filename="sample_mobile.jpg",
            detected_object="cell phone",
            category="Mobile Phones & Gadgets",
            confidence=0.94,
            bounding_box_json='{"x1": 110, "y1": 95, "x2": 450, "y2": 510}',
            recommended_bin="Mobile & Gadgets",
            disposal_guidance="Wipe user data. Safe for precious metal recycling.",
            is_hazard=False
        )
        db.add(det)
        db.commit()
