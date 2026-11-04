import json
import uuid
import shutil
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import DetectionHistory, User
from ..schemas import DetectionResult, DetectionHistoryOut
from ..auth import get_optional_current_user, get_current_user
from ..ai.detector import run_detection

router = APIRouter(prefix="", tags=["Detection"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB

@router.post("/detect-ewaste", response_model=DetectionResult)
async def detect_ewaste(
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    POST /api/detect-ewaste:
    Accepts an uploaded image from webcam capture or file selector,
    validates file type and size, performs YOLO model inference,
    records detection history in the database, and returns classification,
    bounding box coordinates, recommended collection bin, and safe handling instructions.
    """
    # 1. Validate file extension
    ext = Path(image.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Please upload JPG, PNG, or WEBP."
        )

    # 2. Read file bytes and validate size
    image_bytes = await image.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE // (1024*1024)}MB."
        )

    # 3. Save uploaded image to disk
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    saved_path = settings.UPLOAD_DIR / unique_filename
    with open(saved_path, "wb") as f:
        f.write(image_bytes)

    # 4. Run AI model inference
    result = run_detection(image_bytes, filename=unique_filename)

    # 5. Save detection in database
    bbox_json = json.dumps(result.get("bounding_box")) if result.get("bounding_box") else None
    
    detection_record = DetectionHistory(
        user_id=current_user.id if current_user else None,
        image_path=f"/uploads/{unique_filename}",
        original_filename=image.filename,
        detected_object=result["detected_object"],
        category=result["category"],
        confidence=result["confidence"],
        bounding_box_json=bbox_json,
        recommended_bin=result["recommended_bin"],
        disposal_guidance=result["disposal_guidance"],
        is_hazard=result["is_hazard"]
    )
    db.add(detection_record)
    db.commit()
    db.refresh(detection_record)

    result["image_url"] = f"/uploads/{unique_filename}"
    result["history_id"] = detection_record.id

    return result


@router.get("/detections", response_model=List[DetectionHistoryOut])
def get_user_detections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns detection history for the current authenticated user.
    """
    if current_user.role == "admin":
        return db.query(DetectionHistory).order_by(DetectionHistory.created_at.desc()).limit(100).all()
    return db.query(DetectionHistory).filter(DetectionHistory.user_id == current_user.id).order_by(DetectionHistory.created_at.desc()).all()
