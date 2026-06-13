from sqlalchemy.orm import Session
from models import Order, StatusHistory, OrderStage, StockStatus, RiskLevel, LensType
from schemas import OrderCreate, OrderStageUpdate
from services.inventory_manager import InventoryManager
from services.prediction_engine import PredictionEngine
from services.alert_manager import AlertManager
from datetime import datetime, timedelta
from typing import Optional, List

class OrderLifecycleManager:
    def __init__(self, db: Session):
        self.db = db
        self.inventory_manager = InventoryManager(db)
        self.prediction_engine = PredictionEngine()
        self.alert_manager = AlertManager(db)
    
    def create_order(self, order_data: OrderCreate) -> dict:
        """Create new order with stock verification"""
        # Find matching inventory
        matched_inventory = self.inventory_manager.find_matching_inventory(
            order_data.lens_type,
            order_data.power_sphere,
            order_data.power_cylinder
        )
        
        # Determine stock status
        if matched_inventory:
            if matched_inventory.quantity > 0:
                # Decrement inventory
                matched_inventory.quantity -= 1
                matched_inventory.stock_status = self.inventory_manager.calculate_stock_status(
                    matched_inventory.quantity,
                    matched_inventory.min_threshold
                )
                stock_status = matched_inventory.stock_status
            else:
                stock_status = StockStatus.OUT_OF_STOCK
        else:
            stock_status = StockStatus.OUT_OF_STOCK
        
        # Generate order ID
        count = self.db.query(Order).count()
        order_id = f"EL-{count + 1206}"
        
        # Calculate SLA deadline
        sla_deadline = datetime.now() + timedelta(hours=order_data.sla_hours)
        
        # Calculate initial breach probability
        prediction = self.prediction_engine.predict_breach(
            order_data.lens_type,
            order_data.power_sphere,
            order_data.power_cylinder,
            OrderStage.ORDER_RECEIVED,
            0,  # just started
            stock_status,
            False
        )
        
        # Create order
        new_order = Order(
            id=order_id,
            customer_name=order_data.customer_name,
            lens_type=order_data.lens_type,
            power_sphere=order_data.power_sphere,
            power_cylinder=order_data.power_cylinder,
            location=order_data.location,
            sla_hours=order_data.sla_hours,
            sla_deadline=sla_deadline,
            current_stage=OrderStage.ORDER_RECEIVED,
            breach_probability=prediction["breach_probability"],
            risk_level=prediction["risk_level"],
            stock_status=stock_status,
            has_active_delay=False,
            created_at=datetime.now()
        )
        
        self.db.add(new_order)
        self.db.flush()
        
        # Create initial status history entry
        history_entry = StatusHistory(
            order_id=order_id,
            timestamp=datetime.now(),
            stage=OrderStage.ORDER_RECEIVED,
            operator_name=order_data.operator_name,
            notes=f"Order created. Stock status: {stock_status}"
        )
        
        self.db.add(history_entry)
        
        # Trigger alert if high risk
        alert_triggered = False
        if prediction["breach_probability"] > 70:
            self.alert_manager.generate_alert(new_order)
            alert_triggered = True
        
        self.db.commit()
        self.db.refresh(new_order)
        
        return {
            "success": True,
            "order": new_order,
            "stock_status": stock_status,
            "matched_inventory": matched_inventory,
            "alert_triggered": alert_triggered
        }
    
    def update_order_stage(self, order_id: str, update: OrderStageUpdate) -> dict:
        """Update order stage and recalculate breach probability"""
        order = self.db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise ValueError(f"Order {order_id} not found")
        
        # Update order stage
        order.current_stage = update.stage
        
        # Update delay reason
        if update.delay_reason:
            order.delay_reason = update.delay_reason
            order.has_active_delay = True
        
        # Create status history entry
        history_entry = StatusHistory(
            order_id=order_id,
            timestamp=datetime.now(),
            stage=update.stage,
            operator_name=update.operator_name,
            notes=update.notes,
            delay_reason=update.delay_reason
        )
        
        self.db.add(history_entry)
        
        # Recalculate breach probability
        if update.stage == OrderStage.DELIVERED:
            order.breach_probability = 0
            order.risk_level = RiskLevel.LOW
        else:
            elapsed_hours = (datetime.now() - order.created_at).total_seconds() / 3600
            prediction = self.prediction_engine.predict_breach(
                order.lens_type,
                order.power_sphere,
                order.power_cylinder,
                order.current_stage,
                elapsed_hours,
                order.stock_status,
                order.has_active_delay
            )
            
            order.breach_probability = prediction["breach_probability"]
            order.risk_level = prediction["risk_level"]
        
        # Generate alert if breach probability exceeds 70
        alert_triggered = False
        if order.breach_probability > 70:
            self.alert_manager.generate_alert(order)
            alert_triggered = True
        
        self.db.commit()
        self.db.refresh(order)
        
        return {
            "success": True,
            "order": order,
            "alert_triggered": alert_triggered
        }
    
    def get_all_orders(self) -> List[Order]:
        """Retrieve all orders"""
        return self.db.query(Order).all()
    
    def filter_orders(
        self,
        stage: Optional[str] = None,
        lens_type: Optional[str] = None,
        location: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Order]:
        """Filter orders by multiple criteria"""
        query = self.db.query(Order)
        
        if stage:
            query = query.filter(Order.current_stage == stage)
        if lens_type:
            query = query.filter(Order.lens_type == lens_type)
        if location:
            query = query.filter(Order.location == location)
        if search:
            search_lower = search.lower()
            query = query.filter(
                (Order.id.ilike(f"%{search}%")) |
                (Order.customer_name.ilike(f"%{search}%"))
            )
        
        return query.all()
    
    def get_order_by_id(self, order_id: str) -> Optional[Order]:
        """Retrieve single order by identifier"""
        return self.db.query(Order).filter(Order.id == order_id).first()
