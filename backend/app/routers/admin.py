import csv
import io
from typing import List
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, CollectionRequest, DetectionHistory
from ..schemas import UserOut
from ..auth import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/users", response_model=List[UserOut])
def get_all_users(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    """
    Returns list of all registered users for admin review.
    """
    return db.query(User).order_by(User.created_at.desc()).all()


@router.get("/export-requests-csv")
def export_requests_csv(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    """
    Exports all collection requests into a formatted CSV file for recycling logistics.
    """
    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Request ID",
        "Item Name",
        "Category",
        "Quantity",
        "Weight (kg)",
        "Condition",
        "Address",
        "City",
        "Postal Code",
        "Contact Number",
        "Preferred Pickup Date",
        "Status",
        "Created At",
        "User ID"
    ])

    requests = db.query(CollectionRequest).order_by(CollectionRequest.created_at.desc()).all()
    for r in requests:
        writer.writerow([
            r.request_code,
            r.item_name,
            r.category,
            r.quantity,
            r.weight_kg,
            r.condition,
            r.address,
            r.city,
            r.postal_code,
            r.contact_number,
            r.preferred_pickup_date,
            r.status,
            r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else "",
            r.user_id or "Guest"
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=ewaste_collection_requests.csv"}
    )
