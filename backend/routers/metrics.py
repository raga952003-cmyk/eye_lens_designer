from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.dashboard_service import DashboardService
from schemas import DashboardMetrics

router = APIRouter()

@router.get("/dashboard/metrics", response_model=DashboardMetrics)
def get_metrics(db: Session = Depends(get_db)):
    """Retrieve aggregated dashboard metrics"""
    service = DashboardService(db)
    return service.get_metrics()
