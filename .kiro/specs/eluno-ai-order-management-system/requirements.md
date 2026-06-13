# Requirements Document

## Introduction

The Eluno AI Order Management System (OMS) is an intelligent fulfillment platform designed for eyewear production that integrates rule-based inventory management with predictive machine learning to proactively identify SLA breaches. The system addresses the complex, non-linear fulfillment paths inherent in eyewear manufacturing, including prescriptions, lens types, coatings, quality control failures, and re-processing scenarios, where current tracking methods lack predictive capabilities and result in missed SLA deadlines.

The system uses a modern open-source technology stack including React.js with Tailwind CSS for the frontend, Python FastAPI for backend async API operations, PostgreSQL for data persistence, Scikit-learn RandomForestClassifier for predictive TAT breach analysis, and n8n for alert workflow automation.

## Glossary

- **OMS**: Order Management System - The Eluno AI Order Management System
- **Inventory_Manager**: The module responsible for tracking lens blank inventory levels and stock status
- **Order_Lifecycle_Manager**: The module responsible for managing order state transitions and tracking
- **Prediction_Engine**: The machine learning module using RandomForestClassifier for SLA breach prediction
- **Alert_Manager**: The module responsible for generating and routing breach alerts via WhatsApp and Email
- **Dashboard**: The centralized user interface for filtering, tracking, and managing orders
- **Lens_Blank**: Physical lens material slab required for prescription fulfillment
- **SLA**: Service Level Agreement - The 48-hour turnaround time deadline for order fulfillment
- **TAT**: Turnaround Time - The actual time taken to complete an order from placement to delivery
- **Breach_Probability**: A numerical score (0-100) indicating the likelihood of missing the SLA deadline
- **Risk_Level**: A categorical classification of breach probability (Low: ≤30%, Medium: 30-70%, High: >70%)
- **Order_Stage**: The current production phase of an order (Order Received, Lens Selection, Lens Surfacing, Polishing, Coating, Quality Check, Fulfillment Ready, Delivered)
- **Stock_Status**: Inventory availability classification (In Stock, Low Stock, Out of Stock)
- **Status_History**: Audit trail of order stage transitions with timestamps and operator information
- **Prescription_Parameters**: Lens optical specifications including powerSphere and powerCylinder values
- **n8n_Workflow**: Self-hosted automation workflow for alert delivery via WhatsApp and Email channels

## Requirements

### Requirement 1: Lens Inventory Management

**User Story:** As a production manager, I want to track lens blank inventory levels in real-time, so that I can prevent stockouts and identify low stock situations before they impact order fulfillment.

#### Acceptance Criteria

1. THE Inventory_Manager SHALL store lens blank records with lensType, powerSphere, powerCylinder, quantity, and minThreshold attributes
2. WHEN a lens blank quantity falls to or below the minThreshold value, THE Inventory_Manager SHALL classify the Stock_Status as "Low Stock"
3. WHEN a lens blank quantity reaches zero, THE Inventory_Manager SHALL classify the Stock_Status as "Out of Stock"
4. THE Inventory_Manager SHALL provide retrieval of all inventory records via API endpoint
5. THE Inventory_Manager SHALL support creation of new lens blank inventory records with all required attributes
6. THE Inventory_Manager SHALL support updating quantity values for existing lens blank records
7. WHEN lens blank inventory is updated, THE Inventory_Manager SHALL recalculate Stock_Status for all active orders matching the prescription parameters

### Requirement 2: Order Creation with Automated Stock Verification

**User Story:** As a customer service representative, I want to create new orders with automatic stock verification, so that I can immediately identify potential delays due to inventory constraints.

#### Acceptance Criteria

1. WHEN an order is created, THE Order_Lifecycle_Manager SHALL accept customerName, lensType, powerSphere, powerCylinder, location, and slaHours as required parameters
2. WHEN an order is created, THE Order_Lifecycle_Manager SHALL query the Inventory_Manager to match lens blanks within 0.1 tolerance for powerSphere and powerCylinder
3. WHEN a matching lens blank is found with quantity greater than zero, THE Order_Lifecycle_Manager SHALL decrement the lens blank quantity by one
4. WHEN an order is created, THE Order_Lifecycle_Manager SHALL calculate the slaDeadline by adding slaHours to the current timestamp
5. WHEN an order is created, THE Order_Lifecycle_Manager SHALL initialize the Order_Stage to "Order Received"
6. WHEN an order is created, THE Order_Lifecycle_Manager SHALL create the first Status_History entry with stage, timestamp, and operatorName
7. WHEN an order is created, THE Order_Lifecycle_Manager SHALL assign a unique order identifier in format "EL-{number}"
8. WHEN an order is created, THE Order_Lifecycle_Manager SHALL invoke the Prediction_Engine to calculate initial Breach_Probability

### Requirement 3: Order State Transition Management

**User Story:** As a production operator, I want to update order stages and log delays, so that I can maintain an accurate audit trail of production progress and bottlenecks.

#### Acceptance Criteria

1. WHEN an order stage is updated, THE Order_Lifecycle_Manager SHALL accept orderId, stage, operatorName, notes, and delayReason as parameters
2. WHEN an order stage is updated, THE Order_Lifecycle_Manager SHALL append a new Status_History entry with timestamp, stage, operatorName, notes, and delayReason
3. WHEN a delayReason is provided, THE Order_Lifecycle_Manager SHALL store it in the order record
4. WHEN an order stage is updated, THE Order_Lifecycle_Manager SHALL recalculate Breach_Probability using current elapsed time
5. WHEN an order transitions to "Delivered" stage, THE Prediction_Engine SHALL set Breach_Probability to zero
6. THE Order_Lifecycle_Manager SHALL persist all Status_History entries for audit trail purposes

### Requirement 4: Predictive SLA Breach Analysis

**User Story:** As a production manager, I want machine learning predictions of SLA breach probability, so that I can proactively intervene on at-risk orders before deadlines are missed.

#### Acceptance Criteria

1. WHEN a breach prediction is requested, THE Prediction_Engine SHALL accept lensType, powerSphere, powerCylinder, currentStage, elapsedHours, stockStatus, and hasActiveDelay as input features
2. THE Prediction_Engine SHALL calculate estimated remaining hours based on the current Order_Stage
3. WHEN lensType is "Progressive", THE Prediction_Engine SHALL apply a 1.4 multiplier to estimated processing duration
4. WHEN lensType is "Bifocal", THE Prediction_Engine SHALL apply a 1.15 multiplier to estimated processing duration
5. WHEN powerSphere absolute value exceeds 4.0 OR powerCylinder absolute value exceeds 1.5, THE Prediction_Engine SHALL add 8 hours to estimated processing duration
6. WHEN Stock_Status is "Out of Stock", THE Prediction_Engine SHALL add 24 hours to estimated processing duration
7. WHEN Stock_Status is "Low Stock", THE Prediction_Engine SHALL add 6 hours to estimated processing duration
8. WHEN hasActiveDelay is true, THE Prediction_Engine SHALL add 14 hours to estimated processing duration
9. WHEN remaining SLA hours are less than estimated required hours, THE Prediction_Engine SHALL calculate Breach_Probability as 50 plus variance ratio scaled to 50
10. WHEN elapsed time exceeds SLA deadline, THE Prediction_Engine SHALL return Breach_Probability of 100
11. THE Prediction_Engine SHALL return Breach_Probability as an integer value between 0 and 100
12. THE Prediction_Engine SHALL classify Risk_Level as "Low" WHEN Breach_Probability is 30 or less
13. THE Prediction_Engine SHALL classify Risk_Level as "Medium" WHEN Breach_Probability is greater than 30 and less than or equal to 70
14. THE Prediction_Engine SHALL classify Risk_Level as "High" WHEN Breach_Probability exceeds 70
15. THE Prediction_Engine SHALL provide explanatory reasons for breach risk factors in prediction responses

### Requirement 5: Automated Alert Generation

**User Story:** As a customer service manager, I want automated alerts for high-risk orders, so that I can proactively communicate with customers and take corrective action before SLA breaches occur.

#### Acceptance Criteria

1. WHEN a new order is created with Breach_Probability exceeding 70, THE Alert_Manager SHALL generate an alert log entry
2. WHEN an order is updated and Breach_Probability exceeds 70, THE Alert_Manager SHALL generate an alert log entry
3. THE Alert_Manager SHALL assign a unique alert identifier in format "ALT-{number}"
4. THE Alert_Manager SHALL include orderId, customerName, riskScore, channel, message, and sentAt timestamp in alert log entries
5. THE Alert_Manager SHALL support "Email" and "WhatsApp" as alert channel options
6. THE Alert_Manager SHALL format alert messages with order identifier, customer name, risk score, and trigger reason
7. THE Alert_Manager SHALL provide retrieval of all alert log entries via API endpoint
8. THE Alert_Manager SHALL store alert log entries in chronological order with most recent first

### Requirement 6: Order Filtering and Search

**User Story:** As a production supervisor, I want to filter and search orders by multiple criteria, so that I can quickly locate specific orders and monitor production segments.

#### Acceptance Criteria

1. THE Order_Lifecycle_Manager SHALL support filtering orders by Order_Stage parameter
2. THE Order_Lifecycle_Manager SHALL support filtering orders by lensType parameter
3. THE Order_Lifecycle_Manager SHALL support filtering orders by location parameter
4. THE Order_Lifecycle_Manager SHALL support text search across orderId and customerName fields with case-insensitive matching
5. THE Order_Lifecycle_Manager SHALL support combining multiple filter criteria simultaneously
6. THE Order_Lifecycle_Manager SHALL return filtered order collections via API endpoint

### Requirement 7: Dashboard Metrics and Analytics

**User Story:** As an operations executive, I want aggregated metrics on order status, risk distribution, and TAT performance, so that I can monitor system health and identify process improvements.

#### Acceptance Criteria

1. THE Dashboard SHALL calculate total count of active orders excluding "Delivered" stage
2. THE Dashboard SHALL calculate count of breached orders where current time exceeds slaDeadline
3. THE Dashboard SHALL calculate count of high risk orders with Breach_Probability exceeding 70
4. THE Dashboard SHALL calculate count of medium risk orders with Breach_Probability between 30 and 70
5. THE Dashboard SHALL calculate average TAT in hours for completed orders in "Delivered" stage
6. THE Dashboard SHALL provide distribution counts of orders by location
7. THE Dashboard SHALL provide distribution counts of orders by lensType
8. THE Dashboard SHALL expose aggregated metrics via API endpoint

### Requirement 8: Machine Learning Model Performance Tracking

**User Story:** As a data scientist, I want to track ML model performance metrics, so that I can monitor prediction accuracy and identify when retraining is needed.

#### Acceptance Criteria

1. THE Prediction_Engine SHALL maintain accuracy, precision, recall, and f1Score performance metrics
2. THE Prediction_Engine SHALL maintain feature importance rankings for all prediction input features
3. THE Prediction_Engine SHALL track total sample count used for model training
4. THE Prediction_Engine SHALL expose model performance metrics via API endpoint
5. THE Prediction_Engine SHALL support model retraining operations that update performance metrics
6. WHEN model retraining is requested, THE Prediction_Engine SHALL increment total sample count

### Requirement 9: Data Persistence and Recovery

**User Story:** As a system administrator, I want persistent storage of all orders, inventory, and alerts, so that I can recover system state after restarts and maintain historical records.

#### Acceptance Criteria

1. THE OMS SHALL persist inventory records, order records, and alert log entries to a database file
2. WHEN inventory is created or updated, THE OMS SHALL save the database state
3. WHEN orders are created or updated, THE OMS SHALL save the database state
4. WHEN alerts are generated, THE OMS SHALL save the database state
5. WHEN the system starts, THE OMS SHALL load inventory, orders, and alerts from the database file
6. WHEN the database file does not exist, THE OMS SHALL initialize with seed data covering common lens prescriptions

### Requirement 10: AI-Powered Remediation Recommendations

**User Story:** As a production manager, I want AI-generated recommendations for at-risk orders, so that I can receive expert guidance on mitigation strategies and customer communication.

#### Acceptance Criteria

1. WHEN a recommendation is requested, THE OMS SHALL accept orderId as input parameter
2. WHEN a recommendation is requested, THE OMS SHALL retrieve order details including prescription parameters, current stage, stock status, delay reason, and status history
3. WHEN a recommendation is requested, THE OMS SHALL construct a detailed prompt including order details, elapsed time, and production log audit trail
4. WHERE Gemini API is configured, THE OMS SHALL invoke Gemini model with the recommendation prompt
5. WHERE Gemini API is not configured, THE OMS SHALL generate a fallback recommendation with diagnostic factors and remediation plan
6. THE OMS SHALL return recommendations in markdown format with root cause diagnosis, production remediation steps, inventory workarounds, and customer communication drafts
7. THE OMS SHALL include prescription severity, stage characteristics, and stock availability in root cause analysis

### Requirement 11: API Response Standards

**User Story:** As a frontend developer, I want consistent API response formats with appropriate error handling, so that I can build a reliable user interface.

#### Acceptance Criteria

1. WHEN an API request succeeds, THE OMS SHALL return HTTP status code 200 or 201 with response payload
2. WHEN an API request fails due to missing required parameters, THE OMS SHALL return HTTP status code 400 with error message
3. WHEN an API request references a non-existent resource, THE OMS SHALL return HTTP status code 404 with error message
4. WHEN an API request fails due to server error, THE OMS SHALL return HTTP status code 500 with error description
5. THE OMS SHALL return inventory operations with success indicator and updated inventory data
6. THE OMS SHALL return order creation with success indicator, order object, stock status, and matched inventory item
7. THE OMS SHALL return order updates with success indicator, updated order object, and alert triggered indicator

### Requirement 12: Order Stage Definitions

**User Story:** As a process engineer, I want clearly defined order stages that reflect the eyewear production workflow, so that I can track progress through manufacturing steps.

#### Acceptance Criteria

1. THE Order_Lifecycle_Manager SHALL support "Order Received" as the initial order stage
2. THE Order_Lifecycle_Manager SHALL support "Lens Selection" as a valid order stage
3. THE Order_Lifecycle_Manager SHALL support "Lens Surfacing" as a valid order stage
4. THE Order_Lifecycle_Manager SHALL support "Polishing" as a valid order stage
5. THE Order_Lifecycle_Manager SHALL support "Coating" as a valid order stage
6. THE Order_Lifecycle_Manager SHALL support "Quality Check" as a valid order stage
7. THE Order_Lifecycle_Manager SHALL support "Fulfillment Ready" as a valid order stage
8. THE Order_Lifecycle_Manager SHALL support "Delivered" as the final order stage

### Requirement 13: Real-time Stock Status Synchronization

**User Story:** As an inventory clerk, I want order stock status to update automatically when inventory changes, so that breach predictions reflect current material availability.

#### Acceptance Criteria

1. WHEN lens blank inventory quantity is updated, THE Inventory_Manager SHALL identify all active orders matching the lensType, powerSphere, and powerCylinder within 0.1 tolerance
2. WHEN matching orders are identified, THE Inventory_Manager SHALL recalculate Stock_Status for each order
3. WHEN Stock_Status changes, THE Inventory_Manager SHALL invoke the Prediction_Engine to recalculate Breach_Probability
4. WHEN Breach_Probability is recalculated, THE Inventory_Manager SHALL update Risk_Level classification
5. THE Inventory_Manager SHALL persist updated order records after stock synchronization

### Requirement 14: Alert Channel Integration Readiness

**User Story:** As an IT administrator, I want the system to provide alert data in a format compatible with n8n workflows, so that I can integrate WhatsApp and Email delivery automation.

#### Acceptance Criteria

1. THE Alert_Manager SHALL expose alert log entries via API endpoint for consumption by external workflow tools
2. THE Alert_Manager SHALL include all required fields for alert routing (orderId, customerName, riskScore, message, channel)
3. THE Alert_Manager SHALL format alert messages as complete notification text ready for delivery
4. THE Alert_Manager SHALL maintain chronological ordering of alerts for workflow processing
5. THE Alert_Manager SHALL support both "WhatsApp" and "Email" channel identifiers for routing logic

### Requirement 15: Prescription Complexity Analysis

**User Story:** As a technical specialist, I want the system to identify high-complexity prescriptions, so that appropriate processing time and resources can be allocated.

#### Acceptance Criteria

1. WHEN powerSphere absolute value exceeds 4.0, THE Prediction_Engine SHALL classify the prescription as high power
2. WHEN powerCylinder absolute value exceeds 1.5, THE Prediction_Engine SHALL classify the prescription as high power
3. WHEN a prescription is classified as high power, THE Prediction_Engine SHALL include prescription complexity in breach probability explanations
4. THE Prediction_Engine SHALL use prescription complexity as a feature in breach probability calculations
5. THE Prediction_Engine SHALL rank prescription severity in feature importance metrics
