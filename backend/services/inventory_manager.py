from sqlalchemy.orm import Session
from models import Inventory, Order, StockStatus, LensType
from schemas import InventoryCreate, InventoryUpdate
from typing import Optional, List
from services.prediction_engine import PredictionEngine

class InventoryManager:
    def __init__(self, db: Session):
        self.db = db
        self.prediction_engine = PredictionEngine()
    
    def get_all_inventory(self) -> List[Inventory]:
        """Retrieve all lens blank inventory records"""
        return self.db.query(Inventory).all()
    
    def create_inventory(self, item: InventoryCreate) -> Inventory:
        """Create new lens blank record"""
        # Generate ID
        count = self.db.query(Inventory).count()
        item_id = f"INV-{str(count + 1).zfill(4)}"
        
        # Calculate stock status
        stock_status = self.calculate_stock_status(item.quantity, item.min_threshold)
        
        new_item = Inventory(
            id=item_id,
            lens_type=item.lens_type,
            power_sphere=item.power_sphere,
            power_cylinder=item.power_cylinder,
            quantity=item.quantity,
            min_threshold=item.min_threshold,
            stock_status=stock_status
        )
        
        self.db.add(new_item)
        self.db.commit()
        self.db.refresh(new_item)
        
        return new_item
    
    def update_inventory(self, item_id: str, update: InventoryUpdate) -> Inventory:
        """Update lens blank quantity and trigger order sync"""
        item = self.db.query(Inventory).filter(Inventory.id == item_id).first()
        if not item:
            raise ValueError(f"Inventory item {item_id} not found")
        
        item.quantity = update.quantity
        item.stock_status = self.calculate_stock_status(item.quantity, item.min_threshold)
        
        self.db.commit()
        self.db.refresh(item)
        
        # Trigger order synchronization
        self.sync_orders_with_inventory(
            item.lens_type,
            item.power_sphere,
            item.power_cylinder,
            item.stock_status
        )
        
        return item
    
    def find_matching_inventory(
        self, 
        lens_type: LensType, 
        power_sphere: float, 
        power_cylinder: float
    ) -> Optional[Inventory]:
        """Find inventory within 0.1 tolerance for prescription"""
        tolerance = 0.1
        
        items = self.db.query(Inventory).filter(
            Inventory.lens_type == lens_type,
            Inventory.power_sphere >= power_sphere - tolerance,
            Inventory.power_sphere <= power_sphere + tolerance,
            Inventory.power_cylinder >= power_cylinder - tolerance,
            Inventory.power_cylinder <= power_cylinder + tolerance
        ).all()
        
        return items[0] if items else None
    
    def calculate_stock_status(self, quantity: int, min_threshold: int) -> StockStatus:
        """Determine stock status classification"""
        if quantity == 0:
            return StockStatus.OUT_OF_STOCK
        elif quantity <= min_threshold:
            return StockStatus.LOW_STOCK
        else:
            return StockStatus.IN_STOCK
    
    def sync_orders_with_inventory(
        self,
        lens_type: LensType,
        power_sphere: float,
        power_cylinder: float,
        stock_status: StockStatus
    ):
        """Update all matching orders with new stock status"""
        tolerance = 0.1
        
        # Query all active orders matching lens prescription
        orders = self.db.query(Order).filter(
            Order.lens_type == lens_type,
            Order.power_sphere >= power_sphere - tolerance,
            Order.power_sphere <= power_sphere + tolerance,
            Order.power_cylinder >= power_cylinder - tolerance,
            Order.power_cylinder <= power_cylinder + tolerance,
            Order.current_stage != "Delivered"
        ).all()
        
        # Update each order
        for order in orders:
            order.stock_status = stock_status
            
            # Recalculate breach probability
            from datetime import datetime
            elapsed_hours = (datetime.now() - order.created_at).total_seconds() / 3600
            
            prediction = self.prediction_engine.predict_breach(
                order.lens_type,
                order.power_sphere,
                order.power_cylinder,
                order.current_stage,
                elapsed_hours,
                stock_status,
                order.has_active_delay
            )
            
            order.breach_probability = prediction["breach_probability"]
            order.risk_level = prediction["risk_level"]
        
        self.db.commit()
