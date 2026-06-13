from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import Inventory, LensType, StockStatus

def seed_inventory(db: Session):
    """Seed initial inventory data"""
    # Check if already seeded
    existing = db.query(Inventory).first()
    if existing:
        print("Database already seeded")
        return
    
    lens_types = [LensType.SINGLE_VISION, LensType.BIFOCAL, LensType.PROGRESSIVE]
    spheres = [-4.0, -2.0, 0.0, 2.0, 4.0]
    cylinders = [-1.5, 0.0, 1.5]
    
    inventory_items = []
    id_counter = 1
    
    for lens_type in lens_types:
        for sphere in spheres:
            for cylinder in cylinders:
                # Higher power is less common
                is_high_power = abs(sphere) > 2.0 or abs(cylinder) > 1.0
                base_qty = 4 if is_high_power else 18
                quantity = base_qty + (id_counter % 5)
                min_threshold = 3 if is_high_power else 5
                
                # Calculate stock status
                if quantity == 0:
                    stock_status = StockStatus.OUT_OF_STOCK
                elif quantity <= min_threshold:
                    stock_status = StockStatus.LOW_STOCK
                else:
                    stock_status = StockStatus.IN_STOCK
                
                item = Inventory(
                    id=f"INV-{str(id_counter).zfill(4)}",
                    lens_type=lens_type,
                    power_sphere=sphere,
                    power_cylinder=cylinder,
                    quantity=quantity,
                    min_threshold=min_threshold,
                    stock_status=stock_status
                )
                inventory_items.append(item)
                id_counter += 1
    
    db.bulk_save_objects(inventory_items)
    db.commit()
    print(f"Seeded {len(inventory_items)} inventory items")

def init_db():
    """Initialize database with schema and seed data"""
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created")
    
    # Seed data
    db = SessionLocal()
    try:
        seed_inventory(db)
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
