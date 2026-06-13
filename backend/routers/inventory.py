from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.inventory_manager import InventoryManager
from schemas import InventoryCreate, InventoryUpdate, InventoryResponse
from typing import List

router = APIRouter()

@router.get("/inventory", response_model=List[InventoryResponse])
def get_inventory(db: Session = Depends(get_db)):
    """Retrieve all lens blank inventory records"""
    manager = InventoryManager(db)
    return manager.get_all_inventory()

@router.post("/inventory", response_model=InventoryResponse)
def create_inventory(item: InventoryCreate, db: Session = Depends(get_db)):
    """Create new lens blank record"""
    manager = InventoryManager(db)
    return manager.create_inventory(item)

@router.put("/inventory/{item_id}", response_model=InventoryResponse)
def update_inventory(item_id: str, update: InventoryUpdate, db: Session = Depends(get_db)):
    """Update lens blank quantity and trigger order sync"""
    manager = InventoryManager(db)
    try:
        return manager.update_inventory(item_id, update)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
