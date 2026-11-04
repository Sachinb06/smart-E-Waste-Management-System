from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import IoTBin, SensorReading
from ..schemas import IoTBinOut, IoTTelemetryInput

router = APIRouter(prefix="/iot", tags=["Smart IoT Monitoring"])

class SimulationUpdate(BaseModel):
    fill_percentage: float
    status: str = "Normal"

@router.get("/bins", response_model=List[IoTBinOut])
def get_all_bins(db: Session = Depends(get_db)):
    """
    Returns live IoT Bin monitoring data for all bins:
    Mobile & Gadgets, Computers & Accessories, Battery Collection, Cables & Chargers.
    """
    bins = db.query(IoTBin).all()
    return bins


@router.post("/telemetry")
def receive_hardware_telemetry(payload: IoTTelemetryInput, db: Session = Depends(get_db)):
    """
    Hardware integration endpoint for physical IoT microcontrollers (Arduino / ESP32 + HC-SR04 Ultrasonic).
    Calculates fill percentage from distance:
    fill% = max(0, min(100, (1 - distance_cm / total_depth_cm) * 100))
    Sets is_simulated to False upon receiving genuine telemetry.
    """
    bin_obj = db.query(IoTBin).filter(IoTBin.bin_code == payload.bin_code).first()
    if not bin_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"IoT Bin '{payload.bin_code}' not registered in the system."
        )

    depth = payload.total_depth_cm if payload.total_depth_cm and payload.total_depth_cm > 0 else 100.0
    fill = max(0.0, min(100.0, ((depth - payload.distance_cm) / depth) * 100.0))
    fill = round(fill, 1)

    # Determine status
    if fill >= 90.0:
        bin_status = "Full"
    elif fill >= 75.0:
        bin_status = "Warning"
    else:
        bin_status = "Normal"

    bin_obj.current_fill_percentage = fill
    bin_obj.status = bin_status
    bin_obj.is_simulated = False
    bin_obj.last_updated = datetime.utcnow()

    # Record historical telemetry
    reading = SensorReading(
        bin_id=bin_obj.id,
        distance_cm=payload.distance_cm,
        fill_percentage=fill,
        raw_reading=payload.raw_payload or f"distance={payload.distance_cm}cm, device={payload.device_id}"
    )
    db.add(reading)
    db.commit()
    db.refresh(bin_obj)

    return {
        "success": True,
        "bin_code": bin_obj.bin_code,
        "fill_percentage": fill,
        "status": bin_status,
        "is_simulated": False,
        "message": "Hardware telemetry ingested and bin status updated successfully."
    }


@router.post("/bins/{bin_code}/simulate", response_model=IoTBinOut)
def simulate_bin_reading(
    bin_code: str,
    payload: SimulationUpdate,
    db: Session = Depends(get_db)
):
    """
    Simulates changes in bin level for demonstration purposes when physical hardware is not linked.
    Clearly marks is_simulated = True.
    """
    bin_obj = db.query(IoTBin).filter(IoTBin.bin_code == bin_code).first()
    if not bin_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bin not found")

    fill = max(0.0, min(100.0, payload.fill_percentage))
    if fill >= 90.0:
        bin_status = "Full"
    elif fill >= 75.0:
        bin_status = "Warning"
    else:
        bin_status = payload.status or "Normal"

    bin_obj.current_fill_percentage = round(fill, 1)
    bin_obj.status = bin_status
    bin_obj.is_simulated = True
    bin_obj.last_updated = datetime.utcnow()

    db.commit()
    db.refresh(bin_obj)
    return bin_obj
