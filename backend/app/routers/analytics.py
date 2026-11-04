from collections import defaultdict
from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import DetectionHistory, CollectionRequest, IoTBin
from ..schemas import AnalyticsOverview

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(db: Session = Depends(get_db)):
    """
    Returns actual application database statistics for interactive charts.
    """
    total_detections = db.query(DetectionHistory).count()
    total_requests = db.query(CollectionRequest).count()
    pending_requests = db.query(CollectionRequest).filter(CollectionRequest.status == "Pending").count()
    completed_requests = db.query(CollectionRequest).filter(CollectionRequest.status == "Recycled").count()

    # Total weight of accepted/completed collection requests
    total_weight = db.query(func.sum(CollectionRequest.weight_kg)).scalar() or 0.0

    # Category breakdown from actual detections & requests
    cat_counts = defaultdict(int)
    for row in db.query(DetectionHistory.category, func.count(DetectionHistory.id)).group_by(DetectionHistory.category).all():
        cat_counts[row[0]] += row[1]

    # Ensure all primary categories appear
    all_cats = [
        "Mobile Phones & Gadgets",
        "Computers & Accessories",
        "Batteries",
        "Cables & Chargers",
        "TVs & Monitors",
        "Other Electronic Waste"
    ]
    categories_breakdown = [{"name": cat, "value": cat_counts[cat]} for cat in all_cats]

    # Status breakdown
    all_statuses = ["Pending", "Approved", "Pickup Scheduled", "Collected", "Recycled", "Cancelled"]
    status_counts = defaultdict(int)
    for row in db.query(CollectionRequest.status, func.count(CollectionRequest.id)).group_by(CollectionRequest.status).all():
        status_counts[row[0]] = row[1]
    status_breakdown = [{"status": s, "count": status_counts[s]} for s in all_statuses]

    # Monthly collection trends (group by YYYY-MM)
    monthly_map = defaultdict(lambda: {"requests": 0, "weight_kg": 0.0})
    for req in db.query(CollectionRequest).all():
        month_key = req.created_at.strftime("%b %Y") if req.created_at else "Oct 2026"
        monthly_map[month_key]["requests"] += 1
        monthly_map[month_key]["weight_kg"] += round(req.weight_kg, 1)

    monthly_trends = []
    # If empty, provide the current month baseline
    if not monthly_map:
        current_m = datetime.utcnow().strftime("%b %Y")
        monthly_trends.append({"month": current_m, "requests": total_requests, "weight_kg": round(total_weight, 1)})
    else:
        for m, data in monthly_map.items():
            monthly_trends.append({"month": m, "requests": data["requests"], "weight_kg": round(data["weight_kg"], 1)})

    # Bins summary
    bins = db.query(IoTBin).all()
    bins_summary = [
        {
            "bin_name": b.bin_name,
            "category": b.category,
            "fill_percentage": b.current_fill_percentage,
            "status": b.status,
            "is_simulated": b.is_simulated
        }
        for b in bins
    ]

    return {
        "total_detections": total_detections,
        "total_requests": total_requests,
        "pending_requests": pending_requests,
        "completed_requests": completed_requests,
        "total_weight_kg": round(total_weight, 2),
        "active_bins_count": len(bins),
        "categories_breakdown": categories_breakdown,
        "status_breakdown": status_breakdown,
        "monthly_trends": monthly_trends,
        "bins_summary": bins_summary
    }
