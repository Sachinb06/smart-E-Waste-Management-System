import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import CollectionCenter, User
from ..schemas import CollectionCenterCreate, CollectionCenterOut
from ..auth import get_current_admin

router = APIRouter(prefix="/centers", tags=["Collection Centers"])

def _format_center_out(c: CollectionCenter) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "address": c.address,
        "city": c.city,
        "postal_code": c.postal_code,
        "phone": c.phone,
        "email": c.email,
        "operating_hours": c.operating_hours,
        "accepted_categories": json.loads(c.accepted_categories_json) if c.accepted_categories_json else [],
        "latitude": c.latitude,
        "longitude": c.longitude,
        "is_active": c.is_active,
        "created_at": c.created_at
    }

@router.get("", response_model=List[CollectionCenterOut])
def list_centers(
    query: Optional[str] = Query(None, description="Search by name, city, address, or postal code"),
    category: Optional[str] = Query(None, description="Filter by accepted e-waste category"),
    db: Session = Depends(get_db)
):
    """
    Search and filter verified electronic waste collection centers.
    """
    db_query = db.query(CollectionCenter).filter(CollectionCenter.is_active == True)

    if query:
        q = f"%{query.strip().lower()}%"
        db_query = db_query.filter(
            CollectionCenter.name.ilike(q) |
            CollectionCenter.city.ilike(q) |
            CollectionCenter.address.ilike(q) |
            CollectionCenter.postal_code.ilike(q)
        )

    centers = db_query.all()
    results = []
    for c in centers:
        formatted = _format_center_out(c)
        if category and category != "All":
            if category not in formatted["accepted_categories"]:
                continue
        results.append(formatted)
    return results


@router.get("/{center_id}", response_model=CollectionCenterOut)
def get_center(center_id: int, db: Session = Depends(get_db)):
    c = db.query(CollectionCenter).filter(CollectionCenter.id == center_id).first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection center not found")
    return _format_center_out(c)


@router.post("", response_model=CollectionCenterOut)
def create_center(
    payload: CollectionCenterCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    c = CollectionCenter(
        name=payload.name,
        address=payload.address,
        city=payload.city,
        postal_code=payload.postal_code,
        phone=payload.phone,
        email=payload.email,
        operating_hours=payload.operating_hours,
        accepted_categories_json=json.dumps(payload.accepted_categories),
        latitude=payload.latitude,
        longitude=payload.longitude,
        is_active=payload.is_active
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return _format_center_out(c)


@router.delete("/{center_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_center(
    center_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    c = db.query(CollectionCenter).filter(CollectionCenter.id == center_id).first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection center not found")
    db.delete(c)
    db.commit()
    return None
