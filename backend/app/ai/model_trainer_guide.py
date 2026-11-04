"""
E-Waste Model Fine-Tuning Guide & Dataset Preparation Script
Provides automated utilities to train or fine-tune YOLOv8 on custom electronic waste datasets.
"""

import sys
from pathlib import Path

TRAINING_GUIDE_TEXT = """
========================================================================
    HOW TO TRAIN OR FINE-TUNE YOLO ON CUSTOM E-WASTE DATASETS
========================================================================

The Smart E-Waste Management System uses YOLOv8. While the base YOLOv8
detects common electronic objects (cell phones, laptops, keyboards, mice,
screens, remotes, microwaves, toasters), fine-tuning on custom labelled
e-waste images provides higher accuracy for circuit boards, specialized
cables, lithium batteries, and fragmented electronic parts.

1. DATASET SOURCES:
   - Roboflow Universe E-Waste Detection:
     https://universe.roboflow.com/search?q=e-waste
   - Kaggle Electronic Waste Classification & Detection Dataset
   - TACO / Garbage & Waste Object Datasets

2. ANNOTATION FORMAT:
   Standard YOLO format:
   dataset/
     ├── data.yaml
     ├── train/
     │   ├── images/
     │   └── labels/
     └── val/
         ├── images/
         └── labels/

   data.yaml example:
   ------------------
   names:
     0: mobile_phone
     1: laptop_pc
     2: battery
     3: cable_charger
     4: tv_monitor
     5: other_ewaste
   nc: 6
   train: ./train/images
   val: ./val/images

3. TRAINING COMMAND:
   yolo task=detect mode=train model=yolov8n.pt data=data.yaml epochs=50 imgsz=640 batch=16

4. DEPLOYING WEIGHTS:
   Copy the trained weights file 'runs/detect/train/weights/best.pt' into:
   backend/app/ai/weights/best.pt

   The detector automatically checks for 'best.pt' and prioritizes it.
========================================================================
"""

def train_custom_ewaste_model(data_yaml_path: str, epochs: int = 50, model_type: str = "yolov8n.pt"):
    """
    Trains a custom YOLOv8 model using ultralytics.
    """
    try:
        from ultralytics import YOLO
        print(f"Loading base model: {model_type}...")
        model = YOLO(model_type)

        print(f"Starting training on {data_yaml_path} for {epochs} epochs...")
        results = model.train(
            data=data_yaml_path,
            epochs=epochs,
            imgsz=640,
            batch=16,
            name="ewaste_finetuned"
        )
        print("Training completed successfully! Saved to runs/detect/ewaste_finetuned/weights/best.pt")
        return results
    except ImportError:
        print("Error: ultralytics package not installed. Run 'pip install ultralytics' first.")
    except Exception as e:
        print(f"Training failed: {e}")

if __name__ == "__main__":
    print(TRAINING_GUIDE_TEXT)
    if len(sys.argv) > 1 and sys.argv[1] == "--train":
        yaml_file = sys.argv[2] if len(sys.argv) > 2 else "data.yaml"
        train_custom_ewaste_model(yaml_file)
