"""
AI Electronic Waste Object Detection Service
Integrates YOLOv8 object detection with category mapping and confidence verification.
"""

import os
import io
import logging
from pathlib import Path
from typing import Optional, Dict, Any, List
from PIL import Image

from ..config import settings
from .category_mapping import map_label_to_category
from .guidance import get_category_guidance

logger = logging.getLogger("ewaste.detector")

_yolo_model = None
_model_load_attempted = False

def get_model():
    """
    Lazy load the YOLO object detection model.
    Checks for custom trained weights first, then falls back to pretrained YOLOv8.
    """
    global _yolo_model, _model_load_attempted
    if _yolo_model is not None:
        return _yolo_model

    if _model_load_attempted and _yolo_model is None:
        return None

    _model_load_attempted = True
    try:
        from ultralytics import YOLO

        # Check for custom fine-tuned weights first
        custom_weights = settings.WEIGHTS_DIR / "best.pt"
        if custom_weights.exists():
            logger.info(f"Loading custom fine-tuned e-waste model from {custom_weights}")
            _yolo_model = YOLO(str(custom_weights))
        else:
            logger.info(f"Loading base YOLO model: {settings.DEFAULT_YOLO_MODEL}")
            _yolo_model = YOLO(settings.DEFAULT_YOLO_MODEL)

        logger.info("YOLO Model loaded successfully.")
        return _yolo_model
    except Exception as e:
        logger.warning(f"Could not load ultralytics YOLO model: {e}. Fallback detector will be used.")
        _yolo_model = None
        return None


def run_detection(image_bytes: bytes, filename: str = "capture.jpg") -> Dict[str, Any]:
    """
    Runs actual model inference on the provided image bytes.
    Returns:
        dict with detected_object, category, confidence, bounding_box, recommended_bin, disposal_guidance, etc.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        width, height = image.size
    except Exception as e:
        return {
            "success": False,
            "detected_object": "Invalid Image",
            "category": "Unknown / Not E-Waste",
            "confidence": 0.0,
            "bounding_box": None,
            "all_detections": [],
            "recommended_bin": settings.BIN_MAPPING["Unknown / Not E-Waste"],
            "disposal_guidance": "Failed to decode the image. Please upload a valid JPG, PNG, or WEBP photo.",
            "is_hazard": False,
            "hazard_warning": None,
            "message": f"Image processing error: {str(e)}"
        }

    model = get_model()
    
    if model is not None:
        return _detect_with_yolo(model, image, width, height)
    else:
        # Fallback when ultralytics weights cannot be loaded into memory
        return _detect_with_fallback(image, width, height)


def _detect_with_yolo(model, image: Image.Image, img_width: int, img_height: int) -> Dict[str, Any]:
    """
    Executes actual YOLO inference and maps predictions to E-Waste categories.
    """
    try:
        # Run inference
        results = model.predict(source=image, conf=settings.CONFIDENCE_THRESHOLD, verbose=False)
        first_res = results[0]

        detections = []
        best_ewaste = None
        best_other = None

        if hasattr(first_res, "boxes") and first_res.boxes is not None:
            boxes = first_res.boxes
            for i in range(len(boxes)):
                xyxy = boxes.xyxy[i].tolist()
                conf = float(boxes.conf[i].item())
                cls_id = int(boxes.cls[i].item())
                label = model.names.get(cls_id, f"class_{cls_id}")

                category, bin_name = map_label_to_category(label)

                detection_item = {
                    "label": label,
                    "category": category,
                    "confidence": round(conf, 4),
                    "recommended_bin": bin_name,
                    "bounding_box": {
                        "x1": int(max(0, xyxy[0])),
                        "y1": int(max(0, xyxy[1])),
                        "x2": int(min(img_width, xyxy[2])),
                        "y2": int(min(img_height, xyxy[3]))
                    }
                }
                detections.append(detection_item)

                # Prioritize valid e-waste items
                if category != "Unknown / Not E-Waste":
                    if best_ewaste is None or conf > best_ewaste["confidence"]:
                        best_ewaste = detection_item
                else:
                    if best_other is None or conf > best_other["confidence"]:
                        best_other = detection_item

        # Choose the best candidate
        chosen = best_ewaste or best_other

        if chosen and chosen["confidence"] >= settings.CONFIDENCE_THRESHOLD:
            category = chosen["category"]
            guidance_info = get_category_guidance(category)

            return {
                "success": True,
                "detected_object": chosen["label"],
                "category": category,
                "confidence": chosen["confidence"],
                "bounding_box": chosen["bounding_box"],
                "all_detections": detections,
                "recommended_bin": chosen["recommended_bin"],
                "disposal_guidance": guidance_info["guidance"],
                "is_hazard": guidance_info["is_hazard"],
                "hazard_warning": guidance_info["hazard_warning"],
                "message": (
                    f"Identified {chosen['label']} with {int(chosen['confidence'] * 100)}% confidence."
                    if category != "Unknown / Not E-Waste"
                    else "Detected object does not appear to be electronic waste."
                )
            }
        else:
            # Low confidence or no objects detected
            guidance_info = get_category_guidance("Unknown / Not E-Waste")
            return {
                "success": False,
                "detected_object": "Uncertain / No clear object detected",
                "category": "Unknown / Not E-Waste",
                "confidence": 0.0,
                "bounding_box": None,
                "all_detections": detections,
                "recommended_bin": settings.BIN_MAPPING["Unknown / Not E-Waste"],
                "disposal_guidance": guidance_info["guidance"],
                "is_hazard": False,
                "hazard_warning": None,
                "message": "Confidence below threshold. Please reposition the electronic device closer to the camera or select category manually."
            }
    except Exception as e:
        logger.error(f"YOLO inference error: {e}")
        return _detect_with_fallback(image, img_width, img_height)


def _detect_with_fallback(image: Image.Image, img_width: int, img_height: int) -> Dict[str, Any]:
    """
    Honest fallback when model weights are not loaded into memory.
    Prompts the user with clear instructions rather than returning mock/simulated predictions.
    """
    guidance_info = get_category_guidance("Unknown / Not E-Waste")
    return {
        "success": False,
        "detected_object": "Model Initialization Required",
        "category": "Unknown / Not E-Waste",
        "confidence": 0.0,
        "bounding_box": None,
        "all_detections": [],
        "recommended_bin": settings.BIN_MAPPING["Unknown / Not E-Waste"],
        "disposal_guidance": guidance_info["guidance"],
        "is_hazard": False,
        "hazard_warning": None,
        "message": (
            "The object detection engine is loading or requires model weights. "
            "Please ensure yolov8n.pt is in the model directory or proceed with manual category selection."
        )
    }
