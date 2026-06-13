# Implementation Plan: Eluno AI Order Management System

## Overview

This implementation plan breaks down the Eluno AI OMS into discrete coding tasks covering backend API development (Python FastAPI), frontend UI implementation (React TypeScript), ML prediction logic, and system integration. The plan follows an incremental approach where core data models and infrastructure are established first, followed by business logic modules, ML prediction engine, frontend UI, and finally AI integration features.

## Tasks

- [~] 1. Set up backend project structure and core infrastructure
  - Create FastAPI application with CORS middleware configuration
  - Set up PostgreSQL database connection with SQLAlchemy ORM
  - Implement database initialization with seed data for common lens prescriptions
  - Create base response models and error handling utilities
  - Configure environment variables for database URL, Gemini API key
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 11.1, 11.2, 11.3, 11.4_

- [ ]* 1.1 Set up pytest testing framework
  - Install pytest, pytest-asyncio, and httpx for async testing
  - Create test configuration and fixtures
  - _Requirements: General testing infrastructure_

- [~] 2. Implement database models and schema
  - Create SQLAlchemy models for inventory, orders, status_history, alert_logs tables
  - Define enums for OrderStage, StockStatus, RiskLevel, AlertChannel
  - Implement database migration scripts for schema creation
  - Add indexes for order_id and timestamp columns on status_history table
  - Add indexes for order_id and sent_at columns on alert_logs table
  - _Requirements: 1.1, 2.1, 2.5, 2.6, 2.7, 3.1, 3.2, 3.6, 5.3, 5.4, 5.5, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

- [ ]* 2.1 Write unit tests for database models
  - Test model validation and constraints
  - Test enum value validation
  - Test foreign key relationships
  - _Requirements: 2.1, 5.5, 12.1-12.8_

- [~] 3. Implement Inventory_Manager module
  - [ ] 3.1 Create InventoryManager class with database operations
    - Implement get_all_inventory() method
    - Implement create_inventory() method with stock status calculation
    - Implement update_inventory() method with quantity validation
    - Implement find_matching_inventory() with 0.1 tolerance matching for powerSphere and powerCylinder
    - Implement calculate_stock_status() logic (In Stock, Low Stock, Out of Stock)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.2_

  - [ ]* 3.2 Write unit tests for InventoryManager
    - Test stock status classification logic (In Stock, Low Stock, Out of Stock)
    - Test prescription matching with 0.1 tolerance
    - Test inventory creation and updates
    - _Requirements: 1.2, 1.3, 2.2_

  - [ ] 3.3 Implement sync_orders_with_inventory() for real-time synchronization
    - Query all active orders matching lens prescription parameters
    - Recalculate stock status for each matching order
    - Trigger breach probability recalculation via Prediction_Engine
    - Update Risk_Level classification
    - Persist updated order records
    - _Requirements: 1.7, 13.1, 13.2, 13.3, 13.4, 13.5_

  - [ ]* 3.4 Write integration tests for order synchronization
    - Test inventory update triggers order stock status recalculation
    - Test multiple orders updated when inventory changes
    - _Requirements: 13.1, 13.2, 13.3_

- [~] 4. Implement Prediction_Engine module
  - [ ] 4.1 Create PredictionEngine class with breach calculation logic
    - Implement calculate_breach_probability() with stage-based estimation
    - Apply lens type multipliers (Progressive: 1.4, Bifocal: 1.15)
    - Add prescription complexity penalty (8 hours for high power)
    - Add stock status delays (Out of Stock: 24h, Low Stock: 6h)
    - Add active delay penalty (14 hours)
    - Calculate SLA variance and breach probability (0-100 scale)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 15.1, 15.2, 15.3, 15.4_

  - [ ] 4.2 Implement risk level classification
    - Classify Low risk (≤30%), Medium risk (30-70%), High risk (>70%)
    - Generate explanatory reasons for breach risk factors
    - _Requirements: 4.12, 4.13, 4.14, 4.15_

  - [ ]* 4.3 Write unit tests for PredictionEngine
    - Test breach probability calculation for each order stage
    - Test lens type multiplier application
    - Test prescription complexity detection (powerSphere > 4.0, powerCylinder > 1.5)
    - Test stock status delay additions
    - Test risk level classification boundaries
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.11, 4.12, 4.13, 4.14, 15.1, 15.2_

  - [ ] 4.4 Implement ML model metrics tracking
    - Create ModelMetrics data class
    - Implement get_model_metrics() method with accuracy, precision, recall, f1Score
    - Implement feature importance rankings
    - Track total sample count for model training
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 15.5_

  - [ ]* 4.5 Write unit tests for model metrics
    - Test metrics initialization with default values
    - Test feature importance ranking structure
    - _Requirements: 8.1, 8.2, 8.3_

- [~] 5. Checkpoint - Ensure all tests pass
  - Run all unit and integration tests
  - Verify core inventory and prediction logic working correctly
  - Ask the user if questions arise

- [~] 6. Implement Alert_Manager module
  - [ ] 6.1 Create AlertManager class with alert generation logic
    - Implement generate_alert() method with unique alert ID generation (ALT-{number})
    - Implement format_alert_message() with order details and risk score
    - Support Email and WhatsApp channel options
    - Create alert log entries with orderId, customerName, riskScore, channel, message, sentAt
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.8, 14.2, 14.3, 14.5_

  - [ ] 6.2 Implement get_all_alerts() with chronological ordering
    - Query alert_logs table ordered by sentAt descending
    - Return all alert log entries
    - _Requirements: 5.7, 5.8, 14.1, 14.4_

  - [ ]* 6.3 Write unit tests for AlertManager
    - Test alert ID generation format
    - Test alert message formatting
    - Test channel validation (Email, WhatsApp)
    - Test chronological ordering
    - _Requirements: 5.3, 5.4, 5.5, 5.6_

- [~] 7. Implement Order_Lifecycle_Manager module
  - [ ] 7.1 Create OrderLifecycleManager class with order creation
    - Implement create_order() accepting customerName, lensType, powerSphere, powerCylinder, location, slaHours
    - Query Inventory_Manager to find matching lens blank within 0.1 tolerance
    - Decrement lens blank quantity by one if match found
    - Calculate slaDeadline by adding slaHours to current timestamp
    - Initialize currentStage to "Order Received"
    - Create first StatusHistoryEntry with timestamp, stage, operatorName
    - Generate unique order ID in format "EL-{number}"
    - Invoke Prediction_Engine to calculate initial breachProbability
    - Return order object, stockStatus, and matchedInventory
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 11.6_

  - [ ]* 7.2 Write unit tests for order creation
    - Test order ID generation format
    - Test SLA deadline calculation
    - Test initial stage assignment
    - Test status history initialization
    - Test stock matching and quantity decrement
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ] 7.3 Implement update_order_stage() with status history tracking
    - Accept orderId, stage, operatorName, notes, delayReason parameters
    - Append new StatusHistoryEntry with timestamp and all parameters
    - Store delayReason in order record if provided
    - Recalculate breachProbability using Prediction_Engine with current elapsed time
    - Set breachProbability to zero when stage transitions to "Delivered"
    - Generate alert via Alert_Manager if breachProbability exceeds 70
    - Return updated order and alertTriggered indicator
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 5.2, 11.7_

  - [ ]* 7.4 Write unit tests for order stage updates
    - Test status history entry creation
    - Test delay reason storage
    - Test breach probability recalculation on stage update
    - Test breach probability set to zero for "Delivered" stage
    - Test alert triggering when breach probability exceeds 70
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.2_

  - [ ] 7.5 Implement order filtering and search
    - Implement filter_orders() with stage, lensType, location parameters
    - Implement case-insensitive text search across orderId and customerName
    - Support combining multiple filter criteria simultaneously
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 7.6 Write unit tests for order filtering
    - Test single filter criteria (stage, lensType, location)
    - Test combined filter criteria
    - Test case-insensitive search
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [~] 8. Implement Dashboard metrics aggregation
  - [ ] 8.1 Create DashboardService class with metrics calculation
    - Calculate totalActiveOrders excluding "Delivered" stage
    - Calculate breachedOrders where current time exceeds slaDeadline
    - Calculate highRiskOrders with breachProbability > 70
    - Calculate mediumRiskOrders with breachProbability between 30 and 70
    - Calculate avgTAT for completed orders in "Delivered" stage
    - Calculate locationDistribution counts
    - Calculate lensTypeDistribution counts
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [ ]* 8.2 Write unit tests for dashboard metrics
    - Test active orders count excluding delivered
    - Test breached orders calculation
    - Test risk level counts
    - Test average TAT calculation
    - Test distribution calculations
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [~] 9. Implement FastAPI REST endpoints
  - [ ] 9.1 Create inventory endpoints
    - GET /inventory - retrieve all inventory records
    - POST /inventory - create new lens blank record
    - PUT /inventory/:id - update quantity and trigger sync
    - _Requirements: 1.4, 1.5, 1.6, 11.1, 11.5_

  - [ ] 9.2 Create order endpoints
    - GET /orders - retrieve orders with query filters (stage, lensType, location, search)
    - POST /orders - create new order with stock verification
    - PUT /orders/:id/stage - update order stage
    - GET /orders/:id - retrieve single order by ID
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 3.1, 3.2, 3.3, 3.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 11.1, 11.6, 11.7_

  - [ ] 9.3 Create alert endpoints
    - GET /alerts - retrieve all alert log entries
    - _Requirements: 5.7, 11.1, 14.1_

  - [ ] 9.4 Create metrics endpoints
    - GET /metrics - retrieve dashboard aggregated metrics
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 11.1_

  - [ ] 9.5 Create ML model endpoints
    - GET /model-metrics - retrieve model performance metrics
    - POST /model/retrain - trigger model retraining
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 11.1_

  - [ ]* 9.6 Write integration tests for API endpoints
    - Test all endpoint response formats
    - Test error handling (400, 404, 500 status codes)
    - Test filter combinations
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [~] 10. Checkpoint - Ensure backend tests pass
  - Run all backend unit and integration tests
  - Verify API endpoints return correct response formats
  - Test database persistence and recovery
  - Ask the user if questions arise

- [~] 11. Implement Gemini AI integration for remediation recommendations
  - [ ] 11.1 Create GeminiIntegration class with API client
    - Implement get_recommendation() method accepting orderId
    - Retrieve order details including prescription, stage, stock status, delay reason, status history
    - Construct detailed prompt with order context, elapsed time, production log
    - Invoke Gemini API with recommendation prompt
    - Generate fallback recommendation when API not configured
    - Return markdown formatted recommendation with root cause, remediation steps, inventory workarounds, customer communication
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [ ] 11.2 Create recommendation API endpoint
    - POST /recommendations/:orderId - generate AI recommendation
    - _Requirements: 10.1, 11.1_

  - [ ]* 11.3 Write unit tests for Gemini integration
    - Test prompt construction with order details
    - Test fallback recommendation generation
    - Test markdown formatting
    - _Requirements: 10.3, 10.5, 10.6, 10.7_

- [~] 12. Set up frontend React application structure
  - Configure Vite build with TypeScript support
  - Set up Tailwind CSS configuration
  - Create base App component with routing/tabs
  - Create Header component with application title
  - Create Sidebar component with tab navigation
  - Define TypeScript types matching backend API models
  - _Requirements: General frontend infrastructure_

- [ ]* 12.1 Set up frontend testing framework
  - Install Vitest and React Testing Library
  - Create test configuration and utilities
  - _Requirements: General testing infrastructure_

- [~] 13. Implement frontend Dashboard (Metrics Tab)
  - [ ] 13.1 Create Dashboard component with metrics display
    - Fetch metrics from GET /metrics endpoint on mount
    - Display totalActiveOrders, breachedOrders, highRiskOrders, mediumRiskOrders
    - Display avgTAT with hours formatting
    - Display locationDistribution and lensTypeDistribution charts/tables
    - Implement loading and error states
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [ ]* 13.2 Write component tests for Dashboard
    - Test metrics display rendering
    - Test loading state
    - Test error handling
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [~] 14. Implement frontend OrdersTab component
  - [ ] 14.1 Create OrdersTab with order list and filtering
    - Fetch orders from GET /orders endpoint with query filters
    - Implement filter controls for stage, lensType, location
    - Implement text search input for orderId and customerName
    - Display order cards with key details (ID, customer, stage, breach probability, risk level)
    - Implement order detail modal showing full order information and status history
    - _Requirements: 2.1, 2.5, 2.6, 2.7, 3.1, 3.6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ] 14.2 Create order creation form modal
    - Form fields for customerName, lensType, powerSphere, powerCylinder, location, slaHours, operatorName
    - Submit to POST /orders endpoint
    - Display stock status and matched inventory in response
    - Show validation errors
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.8, 11.6_

  - [ ] 14.3 Create order stage update form modal
    - Form fields for stage selection, operatorName, notes, delayReason
    - Submit to PUT /orders/:id/stage endpoint
    - Display alert triggered indicator
    - Show validation errors
    - _Requirements: 3.1, 3.2, 3.3, 11.7_

  - [ ]* 14.4 Write component tests for OrdersTab
    - Test order list rendering
    - Test filter controls
    - Test order creation form
    - Test order update form
    - _Requirements: 2.1, 3.1, 6.1, 6.4_

- [~] 15. Implement frontend InventoryTab component
  - [ ] 15.1 Create InventoryTab with inventory list
    - Fetch inventory from GET /inventory endpoint
    - Display inventory items with lensType, prescription, quantity, minThreshold, stockStatus
    - Color-code stock status (In Stock: green, Low Stock: yellow, Out of Stock: red)
    - Implement loading and error states
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 15.2 Create inventory creation form modal
    - Form fields for lensType, powerSphere, powerCylinder, quantity, minThreshold
    - Submit to POST /inventory endpoint
    - Show validation errors
    - _Requirements: 1.5_

  - [ ] 15.3 Create inventory update form modal
    - Form field for quantity update
    - Submit to PUT /inventory/:id endpoint
    - Show validation errors
    - _Requirements: 1.6_

  - [ ]* 15.4 Write component tests for InventoryTab
    - Test inventory list rendering
    - Test stock status color coding
    - Test creation form
    - Test update form
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_

- [~] 16. Implement frontend PredictionsTab component
  - [ ] 16.1 Create PredictionsTab with model metrics display
    - Fetch metrics from GET /model-metrics endpoint
    - Display accuracy, precision, recall, f1Score
    - Display feature importance rankings in table or chart
    - Display totalSamples
    - Implement loading and error states
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 16.2 Write component tests for PredictionsTab
    - Test metrics display rendering
    - Test feature importance table
    - Test loading state
    - _Requirements: 8.1, 8.2, 8.3_

- [~] 17. Implement frontend AlertsTab component
  - [ ] 17.1 Create AlertsTab with alerts list
    - Fetch alerts from GET /alerts endpoint
    - Display alert cards with orderId, customerName, riskScore, channel, message, sentAt
    - Format timestamps in readable format
    - Implement loading and error states
    - _Requirements: 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [ ]* 17.2 Write component tests for AlertsTab
    - Test alerts list rendering
    - Test timestamp formatting
    - Test loading state
    - _Requirements: 5.7, 5.8_

- [~] 18. Implement AI recommendation feature in OrdersTab
  - [ ] 18.1 Add recommendation button to order detail modal
    - Button triggers POST /recommendations/:orderId endpoint
    - Display loading state while fetching recommendation
    - Render markdown recommendation response
    - Show error message if recommendation fails
    - _Requirements: 10.1, 10.2, 10.6_

  - [ ]* 18.2 Write component tests for recommendation feature
    - Test recommendation button click
    - Test loading state
    - Test markdown rendering
    - _Requirements: 10.1, 10.6_

- [~] 19. Final integration and wiring
  - [ ] 19.1 Connect all frontend components to backend API
    - Verify all API endpoints called correctly
    - Test error handling for network failures
    - Test loading states across all components
    - Implement API client with proper error handling
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ] 19.2 Implement data persistence and recovery
    - Test database initialization with seed data on first run
    - Test database state persistence after inventory, order, alert operations
    - Test system recovery after restart
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 19.3 Write end-to-end integration tests
    - Test complete order lifecycle from creation to delivery
    - Test inventory update triggering order stock status recalculation
    - Test alert generation on high-risk orders
    - Test recommendation generation for at-risk orders
    - _Requirements: 1.7, 2.8, 3.4, 5.1, 5.2, 10.1, 13.1, 13.2, 13.3_

- [~] 20. Final checkpoint - Ensure all tests pass
  - Run all backend unit and integration tests
  - Run all frontend component tests
  - Test complete workflows end-to-end
  - Verify API response formats match frontend expectations
  - Ensure all acceptance criteria covered
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Backend implementation (Tasks 1-11) should be completed before frontend (Tasks 12-18)
- Checkpoints ensure incremental validation at key milestones
- Database schema must be created before implementing business logic modules
- Prediction_Engine has no dependencies and can be implemented independently
- Order_Lifecycle_Manager depends on Inventory_Manager, Prediction_Engine, and Alert_Manager
- Frontend components depend on completed backend API endpoints
- All persistence operations automatically trigger database saves per Requirement 9
