import random
import string
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import CollectionRequest, User, IoTBin
from ..schemas import (
    CollectionRequestCreate,
    CollectionRequestOut,
    CollectionRequestStatusUpdate
)
from ..auth import get_current_user, get_optional_current_user, get_current_admin

router = APIRouter(prefix="/requests", tags=["Collection Requests"])

def generate_request_code() -> str:
    date_str = datetime.utcnow().strftime("%Y%m%d")
    random_chars = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"EW-{date_str}-{random_chars}"

VALID_STATUSES = ["Pending", "Approved", "Pickup Scheduled", "Collected", "Recycled", "Cancelled"]

@router.post("", response_model=CollectionRequestOut)
def create_collection_request(
    payload: CollectionRequestCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Submits a new electronic waste collection request.
    Generates a unique tracking ID and associates with user or guest.
    """
    code = generate_request_code()
    # Ensure code is unique
    while db.query(CollectionRequest).filter(CollectionRequest.request_code == code).first():
        code = generate_request_code()

    req = CollectionRequest(
        request_code=code,
        user_id=current_user.id if current_user else None,
        item_name=payload.item_name,
        category=payload.category,
        quantity=payload.quantity,
        weight_kg=payload.weight_kg,
        condition=payload.condition,
        address=payload.address,
        city=payload.city,
        postal_code=payload.postal_code,
        preferred_pickup_date=payload.preferred_pickup_date,
        contact_number=payload.contact_number,
        notes=payload.notes,
        status="Pending",
        detection_id=payload.detection_id
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@router.get("", response_model=List[CollectionRequestOut])
def list_collection_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lists requests. Normal users only view their own requests.
    Admins can view all requests across the entire system.
    """
    if current_user.role == "admin":
        return db.query(CollectionRequest).order_by(CollectionRequest.created_at.desc()).all()
    return db.query(CollectionRequest).filter(CollectionRequest.user_id == current_user.id).order_by(CollectionRequest.created_at.desc()).all()


@router.get("/track/{request_code}", response_model=CollectionRequestOut)
def track_collection_request(
    request_code: str,
    db: Session = Depends(get_db)
):
    """
    Public lookup by unique request ID (e.g. EW-20261026-ABCD)
    Allows users to check their collection & recycling workflow status anytime.
    """
    req = db.query(CollectionRequest).filter(CollectionRequest.request_code == request_code.strip().upper()).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No collection request found with tracking code '{request_code}'."
        )
    return req


@router.patch("/{request_id}/status", response_model=CollectionRequestOut)
def update_request_status(
    request_id: int,
    payload: CollectionRequestStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Admin only: Advance or modify collection status.
    Workflow: Pending -> Approved -> Pickup Scheduled -> Collected -> Recycled.
    """
    if payload.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}"
        )

    req = db.query(CollectionRequest).filter(CollectionRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found.")

    req.status = payload.status
    req.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(req)
    return req


@router.delete("/{request_id}/cancel", response_model=CollectionRequestOut)
def cancel_pending_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Allows a user to cancel their own pending request, or an admin to cancel any pending request.
    """
    req = db.query(CollectionRequest).filter(CollectionRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found.")

    if current_user.role != "admin" and req.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to cancel this request.")

    if req.status != "Pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel a request that has already progressed to '{req.status}'."
        )

    req.status = "Cancelled"
    req.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(req)
    return req
