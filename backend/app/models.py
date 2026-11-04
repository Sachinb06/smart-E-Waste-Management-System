from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(50), default="user")  # "user" or "admin"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    detection_histories = relationship("DetectionHistory", back_populates="user", cascade="all, delete-orphan")
    collection_requests = relationship("CollectionRequest", back_populates="user", cascade="all, delete-orphan")


class DetectionHistory(Base):
    __tablename__ = "detection_histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    image_path = Column(String(500), nullable=False)
    original_filename = Column(String(255), nullable=True)
    detected_object = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    bounding_box_json = Column(Text, nullable=True)  # JSON string of {x1, y1, x2, y2}
    recommended_bin = Column(String(100), nullable=False)
    disposal_guidance = Column(Text, nullable=False)
    is_hazard = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="detection_histories")
    collection_request = relationship("CollectionRequest", back_populates="detection", uselist=False)


class CollectionRequest(Base):
    __tablename__ = "collection_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_code = Column(String(50), unique=True, index=True, nullable=False)  # e.g., EW-20261026-ABCD
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    item_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    weight_kg = Column(Float, default=1.0, nullable=False)
    condition = Column(String(100), default="Used / Non-functional")  # Working, Repairable, Non-functional, Broken/Damaged, Swollen/Hazardous
    address = Column(String(500), nullable=False)
    city = Column(String(100), nullable=False)
    postal_code = Column(String(50), nullable=False)
    preferred_pickup_date = Column(String(50), nullable=False)
    contact_number = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="Pending")  # Pending -> Approved -> Pickup Scheduled -> Collected -> Recycled, or Cancelled
    detection_id = Column(Integer, ForeignKey("detection_histories.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="collection_requests")
    detection = relationship("DetectionHistory", back_populates="collection_request")


class CollectionCenter(Base):
    __tablename__ = "collection_centers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    address = Column(String(500), nullable=False)
    city = Column(String(100), nullable=False)
    postal_code = Column(String(50), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=True)
    operating_hours = Column(String(100), default="Mon - Sat: 9:00 AM - 6:00 PM")
    accepted_categories_json = Column(Text, nullable=False)  # JSON string array
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class IoTBin(Base):
    __tablename__ = "iot_bins"

    id = Column(Integer, primary_key=True, index=True)
    bin_code = Column(String(50), unique=True, index=True, nullable=False)  # e.g., BIN-MOBILE-01
    category = Column(String(100), nullable=False)
    bin_name = Column(String(100), nullable=False)
    location = Column(String(255), default="Central Recycling Hub")
    max_capacity_liters = Column(Float, default=120.0)
    current_fill_percentage = Column(Float, default=25.0)
    status = Column(String(50), default="Normal")  # Normal, Warning (>75%), Full (>90%), Maintenance
    is_simulated = Column(Boolean, default=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    sensor_readings = relationship("SensorReading", back_populates="bin", cascade="all, delete-orphan")


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    bin_id = Column(Integer, ForeignKey("iot_bins.id", ondelete="CASCADE"), nullable=False)
    distance_cm = Column(Float, nullable=False)
    fill_percentage = Column(Float, nullable=False)
    raw_reading = Column(Text, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    bin = relationship("IoTBin", back_populates="sensor_readings")
