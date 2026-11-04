from pathlib import Path
import secrets
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    PROJECT_NAME: str = "Smart E-Waste Management System"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/data/ewaste.db"
    
    # Upload & Media storage
    UPLOAD_DIR: Path = BASE_DIR / "data" / "uploads"
    WEIGHTS_DIR: Path = BASE_DIR / "app" / "ai" / "weights"
    
    # AI Detection Settings
    CONFIDENCE_THRESHOLD: float = 0.35
    DEFAULT_YOLO_MODEL: str = "yolov8n.pt"  # Pretrained YOLOv8 nano model
    
    # 7 Core E-Waste Categories
    CATEGORIES: list[str] = [
        "Mobile Phones & Gadgets",
        "Computers & Accessories",
        "Batteries",
        "Cables & Chargers",
        "TVs & Monitors",
        "Other Electronic Waste",
        "Unknown / Not E-Waste"
    ]
    
    # Category to Bin mapping
    BIN_MAPPING: dict[str, str] = {
        "Mobile Phones & Gadgets": "Mobile & Gadgets",
        "Computers & Accessories": "Computers & Accessories",
        "Batteries": "Battery Collection",
        "Cables & Chargers": "Cables & Chargers",
        "TVs & Monitors": "TVs & Monitors",
        "Other Electronic Waste": "General E-Waste Assessment",
        "Unknown / Not E-Waste": "Non-Recyclable / Further Inspection"
    }
settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
(BASE_DIR / "data").mkdir(parents=True, exist_ok=True)
