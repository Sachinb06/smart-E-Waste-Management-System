from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# ----------------- Auth & User Schemas -----------------
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    role: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# ----------------- AI Detection Schemas -----------------
class BoundingBox(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int

class DetectionResult(BaseModel):
    success: bool
    detected_object: str
    category: str
    confidence: float
    bounding_box: Optional[BoundingBox] = None
    all_detections: Optional[List[dict]] = None
    recommended_bin: str
    disposal_guidance: str
    is_hazard: bool = False
    hazard_warning: Optional[str] = None
    image_url: Optional[str] = None
    history_id: Optional[int] = None
    message: Optional[str] = None

class DetectionHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    detected_object: str
    category: str
    confidence: float
    bounding_box_json: Optional[str] = None
    recommended_bin: str
    disposal_guidance: str
    is_hazard: bool
    image_path: str
    created_at: datetime


# ----------------- Collection Request Schemas -----------------
class CollectionRequestCreate(BaseModel):
    item_name: str
    category: str
    quantity: int = Field(default=1, ge=1)
    weight_kg: float = Field(default=1.0, gt=0)
    condition: str
    address: str
    city: str
    postal_code: str
    preferred_pickup_date: str
    contact_number: str
    notes: Optional[str] = None
    detection_id: Optional[int] = None

class CollectionRequestStatusUpdate(BaseModel):
    status: str  # Pending, Approved, Pickup Scheduled, Collected, Recycled, Cancelled

class CollectionRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    request_code: str
    user_id: Optional[int] = None
    item_name: str
    category: str
    quantity: int
    weight_kg: float
    condition: str
    address: str
    city: str
    postal_code: str
    preferred_pickup_date: str
    contact_number: str
    notes: Optional[str] = None
    status: str
    detection_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime


# ----------------- Collection Center Schemas -----------------
class CollectionCenterBase(BaseModel):
    name: str
    address: str
    city: str
    postal_code: str
    phone: str
    email: Optional[str] = None
    operating_hours: str = "Mon - Sat: 9:00 AM - 6:00 PM"
    accepted_categories: List[str]
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: bool = True

class CollectionCenterCreate(CollectionCenterBase):
    pass

class CollectionCenterOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    address: str
    city: str
    postal_code: str
    phone: str
    email: Optional[str] = None
    operating_hours: str
    accepted_categories: List[str]
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: bool
    created_at: datetime


# ----------------- IoT Bin Schemas -----------------
class IoTBinOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    bin_code: str
    category: str
    bin_name: str
    location: str
    max_capacity_liters: float
    current_fill_percentage: float
    status: str
    is_simulated: bool
    last_updated: datetime

class IoTTelemetryInput(BaseModel):
    bin_code: str
    distance_cm: float
    total_depth_cm: Optional[float] = 100.0
    device_id: Optional[str] = None
    raw_payload: Optional[str] = None


# ----------------- Analytics Schemas -----------------
class AnalyticsOverview(BaseModel):
    total_detections: int
    total_requests: int
    pending_requests: int
    completed_requests: int
    total_weight_kg: float
    active_bins_count: int
    categories_breakdown: List[dict]
    status_breakdown: List[dict]
    monthly_trends: List[dict]
    bins_summary: List[dict]
