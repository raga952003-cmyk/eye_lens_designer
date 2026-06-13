from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.alert_manager import AlertManager
from schemas import AlertResponse
from typing import List

router = APIRouter()

@router.get("/alerts", response_model=List[AlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    """Retrieve all alert log entries"""
    manager = AlertManager(db)
    return manager.get_all_alerts()
