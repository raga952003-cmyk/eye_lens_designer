from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.prediction_engine import PredictionEngine
from schemas import ModelMetrics, RetrainRequest, RetrainResponse, PredictionRequest, PredictionResponse

router = APIRouter()

@router.get("/model-metrics", response_model=ModelMetrics)
def get_model_metrics():
    """Retrieve ML model performance metrics"""
    engine = PredictionEngine()
    return engine.get_model_metrics()

@router.post("/predict", response_model=PredictionResponse)
def predict_breach(request: PredictionRequest):
    """Predict breach risk probability for sandbox simulation"""
    engine = PredictionEngine()
    result = engine.predict_breach(
        lens_type=request.lens_type,
        power_sphere=request.power_sphere,
        power_cylinder=request.power_cylinder,
        current_stage=request.current_stage,
        elapsed_hours=request.elapsed_hours,
        stock_status=request.stock_status,
        has_active_delay=request.has_active_delay
    )
    return {
        "risk_score": result["breach_probability"],
        "reasons": result["explanations"],
        "is_sla_breach_high_prob": result["breach_probability"] > 70
    }

@router.post("/model/retrain", response_model=RetrainResponse)
def retrain_model(request: RetrainRequest):
    """Trigger model retraining"""
    engine = PredictionEngine()
    metrics = engine.retrain_model(request.samples)
    return {
        "success": True,
        "message": "RandomForestClassifier retrained successfully",
        "metrics": metrics
    }
