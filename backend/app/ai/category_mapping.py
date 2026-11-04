"""
E-Waste Category Mapping & Rule Engine
Maps raw model classes (COCO classes + specialized e-waste labels) to the 7 official E-Waste categories.
"""

from typing import Tuple, Dict

# Explicit mapping from common object detection labels to E-Waste categories
LABEL_TO_CATEGORY: Dict[str, str] = {
    # 1. Mobile Phones & Gadgets
    "cell phone": "Mobile Phones & Gadgets",
    "cellphone": "Mobile Phones & Gadgets",
    "mobile phone": "Mobile Phones & Gadgets",
    "phone": "Mobile Phones & Gadgets",
    "smartphone": "Mobile Phones & Gadgets",
    "tablet": "Mobile Phones & Gadgets",
    "ipad": "Mobile Phones & Gadgets",
    "smartwatch": "Mobile Phones & Gadgets",
    "smart watch": "Mobile Phones & Gadgets",
    "ipod": "Mobile Phones & Gadgets",
    "pda": "Mobile Phones & Gadgets",
    "e-reader": "Mobile Phones & Gadgets",
    "kindle": "Mobile Phones & Gadgets",

    # 2. Computers & Accessories
    "laptop": "Computers & Accessories",
    "mouse": "Computers & Accessories",
    "keyboard": "Computers & Accessories",
    "computer": "Computers & Accessories",
    "desktop": "Computers & Accessories",
    "pc": "Computers & Accessories",
    "hard drive": "Computers & Accessories",
    "hdd": "Computers & Accessories",
    "ssd": "Computers & Accessories",
    "ram": "Computers & Accessories",
    "motherboard": "Computers & Accessories",
    "cpu": "Computers & Accessories",
    "printer": "Computers & Accessories",
    "scanner": "Computers & Accessories",
    "webcam": "Computers & Accessories",
    "router": "Computers & Accessories",
    "modem": "Computers & Accessories",

    # 3. Batteries
    "battery": "Batteries",
    "batteries": "Batteries",
    "power bank": "Batteries",
    "powerbank": "Batteries",
    "lithium battery": "Batteries",
    "li-ion": "Batteries",
    "alkaline battery": "Batteries",
    "accumulator": "Batteries",
    "dry cell": "Batteries",
    "car battery": "Batteries",

    # 4. Cables & Chargers
    "cable": "Cables & Chargers",
    "cables": "Cables & Chargers",
    "charger": "Cables & Chargers",
    "chargers": "Cables & Chargers",
    "usb cable": "Cables & Chargers",
    "power cord": "Cables & Chargers",
    "wire": "Cables & Chargers",
    "wires": "Cables & Chargers",
    "adapter": "Cables & Chargers",
    "power adapter": "Cables & Chargers",
    "hdmi cable": "Cables & Chargers",
    "ethernet cable": "Cables & Chargers",

    # 5. TVs & Monitors
    "tv": "TVs & Monitors",
    "television": "TVs & Monitors",
    "monitor": "TVs & Monitors",
    "display": "TVs & Monitors",
    "screen": "TVs & Monitors",
    "lcd monitor": "TVs & Monitors",
    "crt monitor": "TVs & Monitors",

    # 6. Other Electronic Waste
    "remote": "Other Electronic Waste",
    "microwave": "Other Electronic Waste",
    "toaster": "Other Electronic Waste",
    "oven": "Other Electronic Waste",
    "refrigerator": "Other Electronic Waste",
    "hair drier": "Other Electronic Waste",
    "hair dryer": "Other Electronic Waste",
    "vacuum cleaner": "Other Electronic Waste",
    "speaker": "Other Electronic Waste",
    "speakers": "Other Electronic Waste",
    "headphones": "Other Electronic Waste",
    "earphones": "Other Electronic Waste",
    "radio": "Other Electronic Waste",
    "camera": "Other Electronic Waste",
    "calculator": "Other Electronic Waste",
    "clock": "Other Electronic Waste",
    "projector": "Other Electronic Waste",
    "game console": "Other Electronic Waste",
    "playstation": "Other Electronic Waste",
    "xbox": "Other Electronic Waste",
}

# Non e-waste objects commonly present in scenes (COCO classes)
NON_EWASTE_LABELS = {
    "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat",
    "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat",
    "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack",
    "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball",
    "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket",
    "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple",
    "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair",
    "couch", "potted plant", "bed", "dining table", "toilet", "book", "vase", "scissors",
    "teddy bear", "toothbrush"
}

# Recommended collection bins
CATEGORY_TO_BIN: Dict[str, str] = {
    "Mobile Phones & Gadgets": "Mobile & Gadgets",
    "Computers & Accessories": "Computers & Accessories",
    "Batteries": "Battery Collection",
    "Cables & Chargers": "Cables & Chargers",
    "TVs & Monitors": "TVs & Monitors",
    "Other Electronic Waste": "General E-Waste Assessment",
    "Unknown / Not E-Waste": "Unclassified / Manual Inspection Bin"
}

def map_label_to_category(raw_label: str) -> Tuple[str, str]:
    """
    Given a raw detection label, returns (e_waste_category, recommended_bin).
    """
    clean_label = raw_label.lower().strip()

    if clean_label in NON_EWASTE_LABELS:
        return "Unknown / Not E-Waste", CATEGORY_TO_BIN["Unknown / Not E-Waste"]

    # Direct match
    if clean_label in LABEL_TO_CATEGORY:
        category = LABEL_TO_CATEGORY[clean_label]
        return category, CATEGORY_TO_BIN[category]

    # Partial / substring match
    for keyword, cat in LABEL_TO_CATEGORY.items():
        if keyword in clean_label or clean_label in keyword:
            return cat, CATEGORY_TO_BIN[cat]

    return "Unknown / Not E-Waste", CATEGORY_TO_BIN["Unknown / Not E-Waste"]
