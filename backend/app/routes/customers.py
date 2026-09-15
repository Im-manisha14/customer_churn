"""Customer data routes."""

from fastapi import APIRouter, HTTPException
from app.schemas.prediction import CustomerRecord
from app.services.mock_customers import get_all_customers, get_customer_by_id

router = APIRouter()


@router.get("", response_model=list[CustomerRecord])
async def list_customers():
    """Return all customers with enriched churn probability fields."""
    return get_all_customers()


@router.get("/{customer_id}", response_model=CustomerRecord)
async def get_customer(customer_id: str):
    """Return a single customer profile by ID."""
    customer = get_customer_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail=f"Customer '{customer_id}' not found.")
    return customer
