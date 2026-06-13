from pydantic import BaseModel, Field, ConfigDict
from pydantic.alias_generators import to_camel
from typing import Optional, List
from datetime import datetime
from models import StockStatus, OrderStage, RiskLevel, AlertChannel, LensType

class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )

# Inventory Schemas
class InventoryBase(CamelModel):
    lens_type: LensType
    power_sphere: float
    power_cylinder: float
    quantity: int
    min_threshold: int

class InventoryCreate(InventoryBase):
    pass

class InventoryUpdate(CamelModel):
    quantity: int

class InventoryResponse(InventoryBase):
    id: str
    stock_status: StockStatus

# Status History Schemas
class StatusHistoryBase(CamelModel):
    stage: OrderStage
    operator_name: str
    notes: Optional[str] = None
    delay_reason: Optional[str] = None

class StatusHistoryResponse(StatusHistoryBase):
    timestamp: datetime

# Order Schemas
class OrderCreate(CamelModel):
    customer_name: str
    lens_type: LensType
    power_sphere: float
    power_cylinder: float
    location: str
    sla_hours: int = 48
    operator_name: str = "System"

class OrderStageUpdate(CamelModel):
    stage: OrderStage
    operator_name: str
    notes: Optional[str] = None
    delay_reason: Optional[str] = None

class OrderResponse(CamelModel):
    id: str
    customer_name: str
    lens_type: LensType
    power_sphere: float
    power_cylinder: float
    location: str
    sla_deadline: datetime
    current_stage: OrderStage
    breach_probability: int
    risk_level: RiskLevel
    stock_status: StockStatus
    has_active_delay: bool
    delay_reason: Optional[str]
    status_history: List[StatusHistoryResponse]
    created_at: datetime

class OrderCreateResponse(CamelModel):
    success: bool
    order: OrderResponse
    stock_status: StockStatus
    matched_inventory: Optional[InventoryResponse]

class OrderUpdateResponse(CamelModel):
    success: bool
    order: OrderResponse
    alert_triggered: bool

# Alert Schemas
class AlertResponse(CamelModel):
    id: str
    order_id: str
    customer_name: str
    risk_score: int
    channel: AlertChannel
    message: str
    sent_at: datetime

# ML Model Schemas
class PredictionRequest(CamelModel):
    lens_type: LensType
    power_sphere: float
    power_cylinder: float
    current_stage: OrderStage
    elapsed_hours: float
    stock_status: StockStatus
    has_active_delay: bool

class PredictionResponse(CamelModel):
    risk_score: int
    reasons: List[str]
    is_sla_breach_high_prob: bool

class FeatureImportance(CamelModel):
    feature: str
    importance: float

class ModelMetrics(CamelModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    feature_importances: List[FeatureImportance]
    total_samples: int

# Dashboard Metrics Schema
class DashboardMetrics(CamelModel):
    total_active: int
    breached: int
    high_risk: int
    medium_risk: int
    average_tat_hours: float
    locations_distribution: dict
    lens_distribution: dict
    ml_classifier_state: ModelMetrics

# Recommendation Schema
class RecommendationRequest(CamelModel):
    order_id: str

class RecommendationResponse(CamelModel):
    recommendation: str

# ML Model Retrain Schemas
class RetrainRequest(CamelModel):
    samples: int = 100

class RetrainResponse(CamelModel):
    success: bool
    message: str
    metrics: ModelMetrics
