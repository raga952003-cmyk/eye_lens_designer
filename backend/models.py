from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class StockStatus(str, enum.Enum):
    IN_STOCK = "In Stock"
    LOW_STOCK = "Low Stock"
    OUT_OF_STOCK = "Out of Stock"

class OrderStage(str, enum.Enum):
    ORDER_RECEIVED = "Order Received"
    LENS_SELECTION = "Lens Selection"
    LENS_SURFACING = "Lens Surfacing"
    POLISHING = "Polishing"
    COATING = "Coating"
    QUALITY_CHECK = "Quality Check"
    FULFILLMENT_READY = "Fulfillment Ready"
    DELIVERED = "Delivered"

class RiskLevel(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class AlertChannel(str, enum.Enum):
    EMAIL = "Email"
    WHATSAPP = "WhatsApp"

class LensType(str, enum.Enum):
    SINGLE_VISION = "Single Vision"
    BIFOCAL = "Bifocal"
    PROGRESSIVE = "Progressive"

class Inventory(Base):
    __tablename__ = "inventory"
    
    id = Column(String(20), primary_key=True)
    lens_type = Column(SQLEnum(LensType), nullable=False)
    power_sphere = Column(Float, nullable=False)
    power_cylinder = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    min_threshold = Column(Integer, nullable=False)
    stock_status = Column(SQLEnum(StockStatus), nullable=False)

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(String(20), primary_key=True)
    customer_name = Column(String(255), nullable=False)
    lens_type = Column(SQLEnum(LensType), nullable=False)
    power_sphere = Column(Float, nullable=False)
    power_cylinder = Column(Float, nullable=False)
    location = Column(String(100), nullable=False)
    sla_hours = Column(Integer, nullable=False)
    sla_deadline = Column(DateTime, nullable=False)
    current_stage = Column(SQLEnum(OrderStage), nullable=False)
    breach_probability = Column(Integer, nullable=False)
    risk_level = Column(SQLEnum(RiskLevel), nullable=False)
    stock_status = Column(SQLEnum(StockStatus), nullable=False)
    has_active_delay = Column(Boolean, default=False)
    delay_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=func.now())
    
    status_history = relationship("StatusHistory", back_populates="order", cascade="all, delete-orphan")
    alerts = relationship("AlertLog", back_populates="order", cascade="all, delete-orphan")

class StatusHistory(Base):
    __tablename__ = "status_history"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String(20), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime, nullable=False, default=func.now())
    stage = Column(SQLEnum(OrderStage), nullable=False)
    operator_name = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    delay_reason = Column(Text, nullable=True)
    
    order = relationship("Order", back_populates="status_history")
    
    __table_args__ = (
        Index('idx_order_id', 'order_id'),
        Index('idx_timestamp', 'timestamp'),
    )

class AlertLog(Base):
    __tablename__ = "alert_logs"
    
    id = Column(String(20), primary_key=True)
    order_id = Column(String(20), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    customer_name = Column(String(255), nullable=False)
    risk_score = Column(Integer, nullable=False)
    channel = Column(SQLEnum(AlertChannel), nullable=False)
    message = Column(Text, nullable=False)
    sent_at = Column(DateTime, nullable=False, default=func.now())
    
    order = relationship("Order", back_populates="alerts")
    
    __table_args__ = (
        Index('idx_alert_order_id', 'order_id'),
        Index('idx_sent_at', 'sent_at', postgresql_ops={'sent_at': 'DESC'}),
    )
