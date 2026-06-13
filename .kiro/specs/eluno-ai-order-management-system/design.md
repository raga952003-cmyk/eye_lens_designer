# Design Document

## Overview

The Eluno AI Order Management System is an intelligent fulfillment platform that combines rule-based inventory management with predictive machine learning to proactively identify SLA breaches in eyewear production. The system addresses the complex, non-linear fulfillment paths inherent in eyewear manufacturing by providing real-time visibility, predictive analytics, and automated alerting.

### Key Design Principles

1. **Predictive Intelligence**: ML-driven breach prediction enables proactive intervention before deadlines are missed
2. **Real-time Synchronization**: Inventory changes automatically trigger order risk recalculation
3. **Audit Trail Integrity**: Complete status history tracking for compliance and process analysis
4. **Extensible Architecture**: Modular design supports future integration of additional ML models and workflow engines
5. **API-First Design**: All functionality exposed through REST endpoints for frontend and external system integration

### Technology Stack

- **Frontend**: React.js 18+ with TypeScript, Tailwind CSS for styling, Vite for build tooling
- **Backend**: Python 3.11+ with FastAPI for async REST API operations
- **Database**: PostgreSQL 15+ for production, JSON file storage for development
- **ML Framework**: Scikit-learn with RandomForestClassifier for TAT breach prediction
- **Workflow Automation**: n8n self-hosted for WhatsApp and Email alert delivery
- **API Communication**: Fetch API for frontend-backend integration
- **AI Integration**: Google Gemini API for remediation recommendations

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         React Frontend                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Dashboard   │  │   Orders     │  │  Inventory   │          │
│  │  Metrics     │  │   Manager    │  │   Tracker    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │ Predictions  │  │    Alerts    │                            │
│  │  Viewer      │  │    Monitor   │                            │
│  └──────────────┘  └──────────────┘                            │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST API (Fetch)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FastAPI Backend                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    API Layer                              │   │
│  │  /inventory  /orders  /alerts  /predict  /metrics        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         │                                        │
│  ┌──────────────────────┼────────────────────────────────────┐  │
│  │      Business Logic Layer                                  │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌──────────────┐      │  │
│  │  │ Inventory  │  │    Order      │  │  Prediction  │      │  │
│  │  │  Manager   │  │   Lifecycle   │  │   Engine     │      │  │
│  │  │            │  │   Manager     │  │              │      │  │
│  │  └────────────┘  └──────────────┘  └──────────────┘      │  │
│  │  ┌────────────┐  ┌──────────────┐                         │  │
│  │  │   Alert    │  │   Gemini     │                         │  │
│  │  │  Manager   │  │  Integration │                         │  │
│  │  └────────────┘  └──────────────┘                         │  │
│  └────────────────────────────────────────────────────────────┘  │
│                         │                                        │
│  ┌──────────────────────┴────────────────────────────────────┐  │
│  │               Data Access Layer                            │  │
│  │           Database / JSON File Operations                  │  │
│  └────────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌────────────┐  │
│  │inventory │  │  orders  │  │status_history│  │alert_logs  │  │
│  └──────────┘  └──────────┘  └──────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Integrations                         │
│  ┌──────────────┐                    ┌──────────────┐           │
│  │ n8n Workflow │                    │ Gemini API   │           │
│  │ WhatsApp+Email                    │ Remediation  │           │
│  └──────────────┘                    └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### Module Dependencies

**Inventory_Manager** ← Dependencies: Database Layer
- Manages lens blank inventory
- Triggers order stock status recalculation
- Provides stock availability data

**Order_Lifecycle_Manager** ← Dependencies: Inventory_Manager, Prediction_Engine, Alert_Manager
- Creates and updates orders
- Maintains status history audit trail
- Coordinates with inventory and prediction modules

**Prediction_Engine** ← Dependencies: None (pure logic module)
- Calculates breach probability
- Classifies risk levels
- Provides explanatory factors

**Alert_Manager** ← Dependencies: Database Layer
- Generates alert log entries
- Formats notification messages
- Exposes alerts for n8n consumption

**Dashboard** ← Dependencies: Order_Lifecycle_Manager
- Aggregates metrics
- Calculates performance indicators
- Provides analytics endpoints

## Components and Interfaces

### Backend Components

#### 1. Inventory_Manager

**Responsibility**: Track lens blank inventory levels and stock status

**Public Interface**:
```python
class InventoryManager:
    def get_all_inventory() -> List[InventoryItem]:
        """Retrieve all lens blank inventory records"""
        
    def create_inventory(item: InventoryCreate) -> InventoryItem:
        """Create new lens blank record"""
        
    def update_inventory(item_id: str, quantity: int) -> InventoryItem:
        """Update lens blank quantity and trigger order sync"""
        
    def find_matching_inventory(lens_type: str, power_sphere: float, 
                                power_cylinder: float) -> Optional[InventoryItem]:
        """Find inventory within 0.1 tolerance for prescription"""
        
    def calculate_stock_status(quantity: int, min_threshold: int) -> StockStatus:
        """Determine stock status classification"""
        
    def sync_orders_with_inventory(lens_type: str, power_sphere: float, 
                                   power_cylinder: float, stock_status: StockStatus):
        """Update all matching orders with new stock status"""
```

**Data Structures**:
```python
class InventoryItem:
    id: str              # Format: "INV-{number}"
    lensType: str        # "Single Vision" | "Bifocal" | "Progressive"
    powerSphere: float   # -20.0 to +20.0
    powerCylinder: float # -6.0 to +6.0
    quantity: int
    minThreshold: int
    stockStatus: StockStatus  # "In Stock" | "Low Stock" | "Out of Stock"
```

#### 2. Order_Lifecycle_Manager

**Responsibility**: Manage order creation, state transitions, and status history

**Public Interface**:
```python
class OrderLifecycleManager:
    def create_order(order_data: OrderCreate) -> OrderCreateResponse:
        """Create new order with stock verification"""
        
    def update_order_stage(order_id: str, update: OrderStageUpdate) -> OrderUpdateResponse:
        """Update order stage and recalculate breach probability"""
        
    def get_all_orders() -> List[Order]:
        """Retrieve all orders"""
        
    def filter_orders(stage: Optional[str], lens_type: Optional[str],
                     location: Optional[str], search: Optional[str]) -> List[Order]:
        """Filter orders by multiple criteria"""
        
    def get_order_by_id(order_id: str) -> Optional[Order]:
        """Retrieve single order by identifier"""
```

**Data Structures**:
```python
class Order:
    id: str                    # Format: "EL-{number}"
    customerName: str
    lensType: str
    powerSphere: float
    powerCylinder: float
    location: str
    slaHours: int
    slaDeadline: datetime
    currentStage: OrderStage
    breachProbability: int     # 0-100
    riskLevel: RiskLevel       # "Low" | "Medium" | "High"
    stockStatus: StockStatus
    hasActiveDelay: bool
    delayReason: Optional[str]
    statusHistory: List[StatusHistoryEntry]
    createdAt: datetime

class StatusHistoryEntry:
    timestamp: datetime
    stage: OrderStage
    operatorName: str
    notes: Optional[str]
    delayReason: Optional[str]

class OrderStage(Enum):
    ORDER_RECEIVED = "Order Received"
    LENS_SELECTION = "Lens Selection"
    LENS_SURFACING = "Lens Surfacing"
    POLISHING = "Polishing"
    COATING = "Coating"
    QUALITY_CHECK = "Quality Check"
    FULFILLMENT_READY = "Fulfillment Ready"
    DELIVERED = "Delivered"
```

#### 3. Prediction_Engine

**Responsibility**: Calculate SLA breach probability using rule-based ML logic

**Public Interface**:
```python
class PredictionEngine:
    def predict_breach(order: Order) -> PredictionResult:
        """Calculate breach probability and risk level"""
        
    def get_model_metrics() -> ModelMetrics:
        """Retrieve ML model performance metrics"""
        
    def retrain_model(samples: int):
        """Update model metrics with new training data"""
```

**Prediction Algorithm**:
```python
def calculate_breach_probability(order: Order) -> int:
    # 1. Calculate base remaining hours by stage
    stage_hours_remaining = {
        "Order Received": 40,
        "Lens Selection": 32,
        "Lens Surfacing": 24,
        "Polishing": 16,
        "Coating": 12,
        "Quality Check": 6,
        "Fulfillment Ready": 2,
        "Delivered": 0
    }
    
    estimated_hours = stage_hours_remaining[order.currentStage]
    
    # 2. Apply lens type multipliers
    if order.lensType == "Progressive":
        estimated_hours *= 1.4
    elif order.lensType == "Bifocal":
        estimated_hours *= 1.15
    
    # 3. Add prescription complexity penalty
    if abs(order.powerSphere) > 4.0 or abs(order.powerCylinder) > 1.5:
        estimated_hours += 8
    
    # 4. Add stock status delays
    if order.stockStatus == "Out of Stock":
        estimated_hours += 24
    elif order.stockStatus == "Low Stock":
        estimated_hours += 6
    
    # 5. Add active delay penalty
    if order.hasActiveDelay:
        estimated_hours += 14
    
    # 6. Calculate SLA variance
    elapsed_hours = (datetime.now() - order.createdAt).total_seconds() / 3600
    remaining_sla_hours = order.slaHours - elapsed_hours
    
    # 7. Determine breach probability
    if elapsed_hours > order.slaHours:
        return 100  # Already breached
    
    if remaining_sla_hours < estimated_hours:
        variance = (estimated_hours - remaining_sla_hours) / remaining_sla_hours
        breach_prob = 50 + min(variance * 50, 50)
        return int(breach_prob)
    
    return int(max(0, 30 - (remaining_sla_hours - estimated_hours) * 2))
```

**Data Structures**:
```python
class PredictionResult:
    breachProbability: int  # 0-100
    riskLevel: RiskLevel
    explanations: List[str]  # ["High complexity prescription", "Out of stock"]
    estimatedHoursRequired: float
    remainingSlaHours: float

class ModelMetrics:
    accuracy: float
    precision: float
    recall: float
    f1Score: float
    featureImportance: Dict[str, float]
    totalSamples: int
```

#### 4. Alert_Manager

**Responsibility**: Generate and log high-risk order alerts

**Public Interface**:
```python
class AlertManager:
    def generate_alert(order: Order, channel: AlertChannel) -> AlertLog:
        """Create alert log entry for high-risk order"""
        
    def get_all_alerts() -> List[AlertLog]:
        """Retrieve all alert log entries"""
        
    def format_alert_message(order: Order) -> str:
        """Format alert notification text"""
```

**Data Structures**:
```python
class AlertLog:
    id: str              # Format: "ALT-{number}"
    orderId: str
    customerName: str
    riskScore: int
    channel: AlertChannel  # "Email" | "WhatsApp"
    message: str
    sentAt: datetime

class AlertChannel(Enum):
    EMAIL = "Email"
    WHATSAPP = "WhatsApp"
```

#### 5. Gemini_Integration

**Responsibility**: Generate AI-powered remediation recommendations

**Public Interface**:
```python
class GeminiIntegration:
    def get_recommendation(order_id: str) -> RecommendationResponse:
        """Generate remediation recommendation for at-risk order"""
        
    def construct_prompt(order: Order) -> str:
        """Build detailed prompt with order context"""
```

### Frontend Components

#### 1. Dashboard (Metrics Tab)

**Responsibility**: Display aggregated metrics and system health indicators

**Props**: None (fetches data on mount)

**State**:
```typescript
interface DashboardMetrics {
  totalActiveOrders: number
  breachedOrders: number
  highRiskOrders: number
  mediumRiskOrders: number
  avgTAT: number
  locationDistribution: Record<string, number>
  lensTypeDistribution: Record<string, number>
}
```

**API Calls**: `GET /metrics`

#### 2. OrdersTab

**Responsibility**: Display, filter, and manage order lifecycle

**Props**: None

**State**:
```typescript
interface OrdersTabState {
  orders: Order[]
  filters: {
    stage: string | null
    lensType: string | null
    location: string | null
    search: string
  }
  selectedOrder: Order | null
  showUpdateModal: boolean
}
```

**API Calls**: 
- `GET /orders?stage=&lensType=&location=&search=`
- `POST /orders`
- `PUT /orders/:id/stage`

#### 3. InventoryTab

**Responsibility**: Display and manage lens blank inventory

**Props**: None

**State**:
```typescript
interface InventoryTabState {
  inventory: InventoryItem[]
  showCreateModal: boolean
  showUpdateModal: boolean
  selectedItem: InventoryItem | null
}
```

**API Calls**:
- `GET /inventory`
- `POST /inventory`
- `PUT /inventory/:id`

#### 4. PredictionsTab

**Responsibility**: Display ML model metrics and feature importance

**Props**: None

**State**:
```typescript
interface PredictionsTabState {
  metrics: ModelMetrics
  loading: boolean
}
```

**API Calls**: `GET /model-metrics`

#### 5. AlertsTab

**Responsibility**: Display alert log history

**Props**: None

**State**:
```typescript
interface AlertsTabState {
  alerts: AlertLog[]
  loading: boolean
}
```

**API Calls**: `GET /alerts`

## Data Models

### Database Schema

```sql
-- Inventory Table
CREATE TABLE inventory (
    id VARCHAR(20) PRIMARY KEY,
    lens_type VARCHAR(50) NOT NULL,
    power_sphere DECIMAL(4,2) NOT NULL,
    power_cylinder DECIMAL(4,2) NOT NULL,
    quantity INTEGER NOT NULL,
    min_threshold INTEGER NOT NULL,
    stock_status VARCHAR(20) NOT NULL,
    CHECK (stock_status IN ('In Stock', 'Low Stock', 'Out of Stock')),
    CHECK (lens_type IN ('Single Vision', 'Bifocal', 'Progressive'))
);

-- Orders Table
CREATE TABLE orders (
    id VARCHAR(20) PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    lens_type VARCHAR(50) NOT NULL,
    power_sphere DECIMAL(4,2) NOT NULL,
    power_cylinder DECIMAL(4,2) NOT NULL,
    location VARCHAR(100) NOT NULL,
    sla_hours INTEGER NOT NULL,
    sla_deadline TIMESTAMP NOT NULL,
    current_stage VARCHAR(50) NOT NULL,
    breach_probability INTEGER NOT NULL CHECK (breach_probability BETWEEN 0 AND 100),
    risk_level VARCHAR(20) NOT NULL,
    stock_status VARCHAR(20) NOT NULL,
    has_active_delay BOOLEAN DEFAULT FALSE,
    delay_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (risk_level IN ('Low', 'Medium', 'High')),
    CHECK (current_stage IN ('Order Received', 'Lens Selection', 'Lens Surfacing', 
                             'Polishing', 'Coating', 'Quality Check', 
                             'Fulfillment Ready', 'Delivered'))
);

-- Status History Table
CREATE TABLE status_history (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(20) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    stage VARCHAR(50) NOT NULL,
    operator_name VARCHAR(255) NOT NULL,
    notes TEXT,
    delay_reason TEXT,
    INDEX idx_order_id (order_id),
    INDEX idx_timestamp (timestamp)
);

-- Alert Logs Table
CREATE TABLE alert_logs (
    id VARCHAR(20) PRIMARY KEY,
    order_id VARCHAR(20) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    risk_score INTEGER NOT NULL,
    channel VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (channel IN ('Email', 'WhatsApp')),
    INDEX idx_order_id (order_id),
    INDEX idx_sent_at (sent_at DESC)
);
```

### API Endpoints

#### Inventory Endpoints

**GET /inventory**
- **Description**: Retrieve all lens blank inventory records
- **Response**: `{ inventory: InventoryItem[] }`

**POST /inventory**
- **Description**: Create new lens blank record
- **Request Body**: `{ lensType, powerSphere, powerCylinder, quantity, minThreshold }`
- **Response**: `{ success: true, inventory: InventoryItem }`

**PUT /inventory/:id**
- **Description**: Update lens blank quantity and trigger order sync
- **Request Body**: `{ quantity: number }`
- **Response**: `{ success: true, inventory: InventoryItem }`

#### Order Endpoints

**GET /orders**
- **Description**: Retrieve orders with optional filters
- **Query Parameters**: `stage?, lensType?, location?, search?`
- **Response**: `{ orders: Order[] }`

**POST /orders**
- **Description**: Create new order with stock verification
- **Request Body**: `{ customerName, lensType, powerSphere, powerCylinder, location, slaHours, operatorName }`
- **Response**: `{ success: true, order: Order, stockStatus: StockStatus, matchedInventory: InventoryItem | null }`

**PUT /orders/:id/stage**
- **Description**: Update order stage and recalculate predictions
- **Request Body**: `{ stage, operatorName, notes?, delayReason? }`
- **Response**: `{ success: true, order: Order, alertTriggered: boolean }`

**GET /orders/:id**
- **Description**: Retrieve single order by ID
- **Response**: `{ order: Order }`

#### Alert Endpoints

**GET /alerts**
- **Description**: Retrieve all alert log entries
- **Response**: `{ alerts: AlertLog[] }`

#### Metrics Endpoints

**GET /metrics**
- **Description**: Retrieve aggregated dashboard metrics
- **Response**: 
```json
{
  "totalActiveOrders": 45,
  "breachedOrders": 3,
  "highRiskOrders": 8,
  "mediumRiskOrders": 12,
  "avgTAT": 38.5,
  "locationDistribution": { "Mumbai": 15, "Delhi": 20, "Bangalore": 10 },
  "lensTypeDistribution": { "Single Vision": 30, "Bifocal": 10, "Progressive": 5 }
}
```

#### ML Endpoints

**GET /model-metrics**
- **Description**: Retrieve ML model performance metrics
- **Response**: `{ metrics: ModelMetrics }`

**POST /model/retrain**
- **Description**: Trigger model retraining
- **Request Body**: `{ samples: number }`
- **Response**: `{ success: true, metrics: ModelMetrics }`

#### AI Recommendation Endpoints

**POST /recommendations/:orderId**
- **Description**: Generate AI remediation recommendation
- **Response**: `{ recommendation: string }` (markdown format)

