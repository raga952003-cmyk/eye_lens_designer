import os
from typing import Optional
from models import Order
import google.generativeai as genai
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

class GeminiIntegration:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None
    
    def get_recommendation(self, order: Order) -> str:
        """Generate AI-powered remediation recommendation"""
        if not self.model:
            return self._generate_fallback_recommendation(order)
        
        try:
            prompt = self.construct_prompt(order)
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini API error: {e}")
            return self._generate_fallback_recommendation(order)
    
    def construct_prompt(self, order: Order) -> str:
        """Build detailed prompt with order context"""
        elapsed = (datetime.now() - order.created_at).total_seconds() / 3600
        elapsed_text = f"{round(elapsed, 1)} hours"
        
        history_text = "\n".join([
            f"- [{h.timestamp}] Stage: {h.stage}, Operator: {h.operator_name}, "
            f"Notes: \"{h.notes or 'None'}\", Delay: \"{h.delay_reason or 'None'}\""
            for h in order.status_history
        ])
        
        prompt = f"""You are the lead engineering agent and optical specialist for Eluno Eyewear. 
Provide a highly precise, technical, and actionable production mitigation advisory plan for a 
high-risk order that is currently flagging a {order.breach_probability}% SLA breach hazard.

CRITICAL ORDER DETAILS:
- Order ID: {order.id}
- Patient/Customer: {order.customer_name}
- Optical Recipe: Type: {order.lens_type}, Sphere: {order.power_sphere} diopter, Cylinder: {order.power_cylinder} diopter
- Current Production Stage: {order.current_stage}
- Stock Availability: {order.stock_status}
- Elapsed Time: {elapsed_text} in production
- Current Logged Hold Delay Reason: "{order.delay_reason or 'None'}"

PRODUCTION LOG AUDIT TRAIL:
{history_text}

Deliver a highly professional, expert response in markdown format with these exact headings:
1. ### 🔍 Root Cause Diagnosis
   Analyze the exact bottlenecks combining the prescription severity, stage characteristics, and stock availability.

2. ### 🛠️ Immediate Production Remediation
   Detailed optical bench work instructions for the operator room tech.

3. ### 📦 Inventory & Dispatch Workaround
   Actions related to material allocation and lab rerouting.

4. ### 💬 Customer Mitigation Draft
   A premium, highly reassuring communication script (Email/SMS) explaining the professional craftsmanship delay."""
        
        return prompt
    
    def _generate_fallback_recommendation(self, order: Order) -> str:
        """Generate fallback recommendation when API is unavailable"""
        return f"""### [OMS Fallback Recommendation for {order.id}]

**Diagnostic Factors:**
* Lens Type: {order.lens_type} (Rx Sphere: {order.power_sphere}, Cylinder: {order.power_cylinder})
* Active Stage: {order.current_stage}
* Reported Hold Reason: "{order.delay_reason or 'Stuck in Stage Machine Queue'}"
* Inventory Level: {order.stock_status}

**Urgent Remediation Plan:**
1. **Material Allocations**: Since the lens status is **{order.stock_status}**, immediately verify physical drawer inventory. If Out of Stock, place emergency backorder for matching prescription slab.

2. **Manufacturing Pipeline**: Assign expert lab tech to expedite specialized surfacing for spherical curve specification ({order.power_sphere}).

3. **Logistics Optimization**: Set order status priority flag to "EXPEDITE_GOLD" inside OMS to bypass downstream coating queues.

4. **Customer Communication**: Generate SMS draft notifying customer of extreme optical-precision custom engineering hold to maintain patient comfort, offering $20 optical service credit.

*Note: This is a fallback recommendation. Configure GEMINI_API_KEY for AI-powered insights.*"""
