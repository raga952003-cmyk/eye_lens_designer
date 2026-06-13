from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from services.order_lifecycle_manager import OrderLifecycleManager
from schemas import OrderCreate, OrderStageUpdate, OrderResponse, OrderCreateResponse, OrderUpdateResponse
from typing import List, Optional

router = APIRouter()

@router.get("/orders", response_model=List[OrderResponse])
def get_orders(
    stage: Optional[str] = Query(None),
    lens_type: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve orders with optional filters"""
    manager = OrderLifecycleManager(db)
    return manager.filter_orders(stage, lens_type, location, search)

@router.post("/orders", response_model=OrderCreateResponse)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    """Create new order with stock verification"""
    manager = OrderLifecycleManager(db)
    return manager.create_order(order)

@router.put("/orders/{order_id}/stage", response_model=OrderUpdateResponse)
def update_order_stage(order_id: str, update: OrderStageUpdate, db: Session = Depends(get_db)):
    """Update order stage and recalculate predictions"""
    manager = OrderLifecycleManager(db)
    try:
        return manager.update_order_stage(order_id, update)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(order_id: str, db: Session = Depends(get_db)):
    """Retrieve single order by ID"""
    manager = OrderLifecycleManager(db)
    order = manager.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/orders/clear")
def clear_orders(db: Session = Depends(get_db)):
    """Clear all orders, status history, and alert logs"""
    from models import Order, StatusHistory, AlertLog
    try:
        db.query(StatusHistory).delete()
        db.query(AlertLog).delete()
        db.query(Order).delete()
        db.commit()
        return {"success": True, "message": "All sample data cleared successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

