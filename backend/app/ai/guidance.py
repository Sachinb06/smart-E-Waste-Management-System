"""
Safe Handling, Recycling Instructions, and Hazard Safety Protocols.
"""

from typing import Dict, Any

CATEGORY_GUIDANCE: Dict[str, Dict[str, Any]] = {
    "Mobile Phones & Gadgets": {
        "guidance": (
            "1. Perform a complete factory data reset and log out of cloud accounts.\n"
            "2. Remove SIM card and external microSD memory cards.\n"
            "3. If the battery is swollen or leaking, do NOT insert into standard bins.\n"
            "4. Deposit device in the Mobile & Gadgets designated bin for circuit board and precious metal extraction."
        ),
        "is_hazard": False,
        "hazard_warning": None,
        "recycling_benefit": "Recovers valuable gold, copper, palladium, and rare earth elements while preventing lithium soil toxicity."
    },
    "Computers & Accessories": {
        "guidance": (
            "1. Securely wipe all storage devices (HDDs / SSDs) or request data sanitization.\n"
            "2. Detach external peripherals (cables, wireless dongles) and recycle separately.\n"
            "3. Place tower, keyboard, mouse, or laptop gently into the Computers & Accessories bin.\n"
            "4. Authorized recyclers will shred and segregate aluminum, plastics, and PCB components."
        ),
        "is_hazard": False,
        "hazard_warning": None,
        "recycling_benefit": "Prevents heavy metals like lead and cadmium from entering landfills and conserves industrial energy."
    },
    "Batteries": {
        "guidance": (
            "1. Tape battery terminals with non-conductive electrical tape to prevent short-circuiting.\n"
            "2. If the battery is swollen, punctured, smoking, or leaking acid, place it immediately in a metal container with sand.\n"
            "3. NEVER dispose of lithium-ion or alkaline batteries in ordinary municipal trash or mixed e-waste.\n"
            "4. Drop only non-damaged batteries into the specialized insulated Battery Collection Bin."
        ),
        "is_hazard": True,
        "hazard_warning": "CRITICAL FIRE & CHEMICAL HAZARD: Damaged, leaking, or swollen batteries must NOT be dropped into general bins. Handle with protective gloves and contact our hazardous e-waste response team.",
        "recycling_benefit": "Extracts cobalt, nickel, and lithium for manufacturing new clean-energy battery packs."
    },
    "Cables & Chargers": {
        "guidance": (
            "1. Coil and bundle cords neatly using velcro, twist ties, or rubber bands.\n"
            "2. Do not cut or strip the outer PVC/rubber insulation manually.\n"
            "3. Separate AC high-voltage adapters from low-voltage USB cords if possible.\n"
            "4. Drop into the Cables & Chargers bin for copper core stripping and plastic granulation."
        ),
        "is_hazard": False,
        "hazard_warning": None,
        "recycling_benefit": "Pure high-grade copper wires are 100% recyclable infinitely with 85% lower energy than raw mining."
    },
    "TVs & Monitors": {
        "guidance": (
            "1. Handle with care to prevent screen cracking or shattering.\n"
            "2. Old CRT monitors contain high amounts of leaded glass and phosphor powder — do not puncture the vacuum tube.\n"
            "3. Keep power cord attached or wrapped around the stand.\n"
            "4. Place upright in the padded TVs & Monitors bay to avoid breaking the front glass panel."
        ),
        "is_hazard": False,
        "hazard_warning": "FRAGILE GLASS & HEAVY METALS: If the screen is cracked or broken, wear cut-resistant gloves and wrap the display in protective plastic.",
        "recycling_benefit": "Safely isolates hazardous lead, mercury backlights, and recovers optical glass and flame-retardant polymers."
    },
    "Other Electronic Waste": {
        "guidance": (
            "1. Unplug and empty any internal components (water reservoirs, crumbs, filters).\n"
            "2. Remove any internal AA/AAA or button batteries before placing in the bin.\n"
            "3. Deposit item into the General E-Waste Assessment bin for dismantling and material categorization."
        ),
        "is_hazard": False,
        "hazard_warning": None,
        "recycling_benefit": "Diverts mixed motors, heating coils, and transformers into specialized recycling streams."
    },
    "Unknown / Not E-Waste": {
        "guidance": (
            "The AI detector could not confidently identify this item as an electronic device. "
            "Please ensure good lighting, center the electronic device in the camera frame, and retake the photo. "
            "Alternatively, you may manually pick the appropriate category from the collection form."
        ),
        "is_hazard": False,
        "hazard_warning": None,
        "recycling_benefit": "Proper pre-sorting ensures non-electronic waste does not contaminate specialized recycling machinery."
    }
}

def get_category_guidance(category: str, condition: str = "normal") -> Dict[str, Any]:
    info = CATEGORY_GUIDANCE.get(category, CATEGORY_GUIDANCE["Unknown / Not E-Waste"]).copy()
    
    # If the user or detection notes condition is swollen or broken
    if "swollen" in condition.lower() or "damaged" in condition.lower():
        info["is_hazard"] = True
        info["hazard_warning"] = (
            f"HAZARD ALERT: This {category} item is marked as damaged or swollen. "
            "Do not drop into standard collection bins. Store in a safe, non-flammable area and request priority pickup."
        )
    return info
