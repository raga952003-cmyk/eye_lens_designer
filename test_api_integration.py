"""
Eluno AI OMS - API Integration Test Script
This script demonstrates all API endpoints and their functionality
"""

import requests
import json
from datetime import datetime
from typing import Dict, List

# Configuration
API_BASE_URL = "http://localhost:8000/api"

class ElunoAPITester:
    def __init__(self, base_url: str = API_BASE_URL):
        self.base_url = base_url
        self.session = requests.Session()
    
    def print_section(self, title: str):
        """Print formatted section header"""
        print("\n" + "="*80)
        print(f"  {title}")
        print("="*80 + "\n")
    
    def print_response(self, response: requests.Response):
        """Pretty print API response"""
        print(f"Status Code: {response.status_code}")
        try:
            data = response.json()
            print(json.dumps(data, indent=2, default=str))
        except:
            print(response.text)
        print()
    
    # ========== INVENTORY TESTS ==========
    
    def test_get_inventory(self):
        """Test GET /inventory"""
        self.print_section("1. GET INVENTORY")
        response = self.session.get(f"{self.base_url}/inventory")
        self.print_response(response)
        return response.json() if response.ok else []
    
    def test_create_inventory(self):
        """Test POST /inventory"""
        self.print_section("2. CREATE INVENTORY ITEM")
        
        payload = {
            "lens_type": "Single Vision",
            "power_sphere": -1.5,
            "power_cylinder": -0.5,
            "quantity": 25,
            "min_threshold": 5
        }
        
        print("Creating inventory item with:")
        print(json.dumps(payload, indent=2))
        print()
        
        response = self.session.post(
            f"{self.base_url}/inventory",
            json=payload
        )
        self.print_response(response)
        return response.json() if response.ok else None
    
    def test_update_inventory(self, item_id: str = "INV-0001"):
        """Test PUT /inventory/{id}"""
        self.print_section("3. UPDATE INVENTORY QUANTITY")
        
        payload = {"quantity": 15}
        
        print(f"Updating inventory {item_id} to quantity: 15\n")
        
        response = self.session.put(
            f"{self.base_url}/inventory/{item_id}",
            json=payload
        )
        self.print_response(response)
        return response.json() if response.ok else None
    
    # ========== ORDER TESTS ==========
    
    def test_create_order(self):
        """Test POST /orders"""
        self.print_section("4. CREATE NEW ORDER")
        
        payload = {
            "customer_name": "John Doe",
            "lens_type": "Progressive",
            "power_sphere": -2.5,
            "power_cylinder": -1.0,
            "location": "Mumbai",
            "sla_hours": 48,
            "operator_name": "Operator A"
        }
        
        print("Creating order with:")
        print(json.dumps(payload, indent=2))
        print()
        
        response = self.session.post(
            f"{self.base_url}/orders",
            json=payload
        )
        self.print_response(response)
        return response.json() if response.ok else None
    
    def test_get_orders(self, filters: Dict = None):
        """Test GET /orders with optional filters"""
        self.print_section("5. GET ORDERS (with filters)")
        
        params = filters or {}
        
        if params:
            print(f"Filters: {params}\n")
        
        response = self.session.get(
            f"{self.base_url}/orders",
            params=params
        )
        self.print_response(response)
        return response.json() if response.ok else []
    
    def test_update_order_stage(self, order_id: str):
        """Test PUT /orders/{id}/stage"""
        self.print_section("6. UPDATE ORDER STAGE")
        
        payload = {
            "stage": "Lens Surfacing",
            "operator_name": "Operator B",
            "notes": "Started lens surfacing process",
            "delay_reason": None
        }
        
        print(f"Updating order {order_id}:")
        print(json.dumps(payload, indent=2))
        print()
        
        response = self.session.put(
            f"{self.base_url}/orders/{order_id}/stage",
            json=payload
        )
        self.print_response(response)
        return response.json() if response.ok else None
    
    def test_get_single_order(self, order_id: str):
        """Test GET /orders/{id}"""
        self.print_section("7. GET SINGLE ORDER BY ID")
        
        response = self.session.get(f"{self.base_url}/orders/{order_id}")
        self.print_response(response)
        return response.json() if response.ok else None
    
    # ========== ALERT TESTS ==========
    
    def test_get_alerts(self):
        """Test GET /alerts"""
        self.print_section("8. GET ALL ALERTS")
        
        response = self.session.get(f"{self.base_url}/alerts")
        self.print_response(response)
        return response.json() if response.ok else []
    
    # ========== METRICS TESTS ==========
    
    def test_get_dashboard_metrics(self):
        """Test GET /dashboard/metrics"""
        self.print_section("9. GET DASHBOARD METRICS")
        
        response = self.session.get(f"{self.base_url}/dashboard/metrics")
        self.print_response(response)
        return response.json() if response.ok else None
    
    # ========== ML MODEL TESTS ==========
    
    def test_get_model_metrics(self):
        """Test GET /model-metrics"""
        self.print_section("10. GET ML MODEL METRICS")
        
        response = self.session.get(f"{self.base_url}/model-metrics")
        self.print_response(response)
        return response.json() if response.ok else None
    
    def test_retrain_model(self):
        """Test POST /model/retrain"""
        self.print_section("11. RETRAIN ML MODEL")
        
        payload = {"samples": 100}
        
        print("Retraining model with 100 additional samples...\n")
        
        response = self.session.post(
            f"{self.base_url}/model/retrain",
            json=payload
        )
        self.print_response(response)
        return response.json() if response.ok else None
    
    # ========== RECOMMENDATION TESTS ==========
    
    def test_get_recommendation(self, order_id: str):
        """Test POST /recommendations"""
        self.print_section("12. GET AI RECOMMENDATION")
        
        payload = {"order_id": order_id}
        
        print(f"Getting recommendation for order {order_id}...\n")
        
        response = self.session.post(
            f"{self.base_url}/recommendations",
            json=payload
        )
        self.print_response(response)
        return response.json() if response.ok else None
    
    # ========== COMPLETE TEST FLOW ==========
    
    def run_complete_test_suite(self):
        """Run all tests in sequence"""
        print("\n")
        print("╔" + "="*78 + "╗")
        print("║" + " "*20 + "ELUNO AI OMS - API TEST SUITE" + " "*29 + "║")
        print("╚" + "="*78 + "╝")
        
        try:
            # 1. Inventory Tests
            inventory_items = self.test_get_inventory()
            new_inventory = self.test_create_inventory()
            
            if inventory_items:
                self.test_update_inventory(inventory_items[0]["id"])
            
            # 2. Order Tests
            new_order_response = self.test_create_order()
            
            if new_order_response and "order" in new_order_response:
                order_id = new_order_response["order"]["id"]
                
                # Filter tests
                self.test_get_orders({"location": "Mumbai"})
                self.test_get_orders({"lens_type": "Progressive"})
                self.test_get_orders({"search": "John"})
                
                # Update order
                self.test_update_order_stage(order_id)
                
                # Get single order
                self.test_get_single_order(order_id)
                
                # Get recommendation
                self.test_get_recommendation(order_id)
            
            # 3. Alerts
            self.test_get_alerts()
            
            # 4. Metrics
            self.test_get_dashboard_metrics()
            
            # 5. ML Model
            self.test_get_model_metrics()
            self.test_retrain_model()
            
            print("\n")
            print("╔" + "="*78 + "╗")
            print("║" + " "*25 + "TEST SUITE COMPLETED" + " "*33 + "║")
            print("╚" + "="*78 + "╝")
            print()
            
        except requests.exceptions.ConnectionError:
            print("\n❌ ERROR: Cannot connect to API server")
            print("   Make sure the backend is running on http://localhost:8000")
            print("   Run: cd backend && uvicorn main:app --reload\n")
        except Exception as e:
            print(f"\n❌ ERROR: {str(e)}\n")


if __name__ == "__main__":
    # Initialize tester
    tester = ElunoAPITester()
    
    # Run complete test suite
    tester.run_complete_test_suite()
