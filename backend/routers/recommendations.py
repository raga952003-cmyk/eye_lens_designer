from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.gemini_integration import GeminiIntegration
from services.order_lifecycle_manager import OrderLifecycleManager
from schemas import RecommendationResponse
from pydantic import BaseModel

router = APIRouter()

class RecommendationRequest(BaseModel):
    order_id: str

@router.post("/recommendations", response_model=RecommendationResponse)
def get_recommendation(request: RecommendationRequest, db: Session = Depends(get_db)):
    """Generate AI remediation recommendation"""
    manager = OrderLifecycleManager(db)
    order = manager.get_order_by_id(request.order_id)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    gemini = GeminiIntegration()
    recommendation = gemini.get_recommendation(order)
    
    return {"recommendation": recommendation}
