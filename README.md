# Eluno AI Order Management System

An intelligent fulfillment platform for eyewear production with predictive machine learning capabilities.

## Overview

The Eluno AI OMS is designed to optimize eyewear production by integrating rule-based inventory management with predictive machine learning. The system proactively identifies SLA breaches to enable immediate operational intervention.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Python FastAPI
- **Database**: SQLite (development) / PostgreSQL (production)
- **ML**: Scikit-learn for TAT breach prediction
- **AI**: Google Gemini API for recommendations

## Features

- **Inventory Management**: Track lens types, prescriptions, and stock levels
- **Order Lifecycle Tracking**: Monitor orders through all production stages
- **ML-Based Breach Prediction**: Predict SLA violations before they occur
- **Alert System**: Automated notifications for high-risk orders
- **AI Recommendations**: Get intelligent remediation suggestions

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables (create `backend/.env`):
   ```
   DATABASE_URL=sqlite:///./eluno_oms.db
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the backend server:
   ```bash
   python main.py
   ```

   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. Install dependencies from project root:
   ```bash
   npm install
   ```

2. Set up environment variables (create `.env`):
   ```
   VITE_API_URL=http://localhost:8000/api
   ```

3. Start the frontend development server:
   ```bash
   npm run dev:frontend
   ```

   Frontend will be available at `http://localhost:3000`

## API Endpoints

### Inventory
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Create new inventory item

### Orders
- `GET /api/orders` - Get all orders (with filters)
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/stage` - Update order stage

### Alerts
- `GET /api/alerts` - Get all alerts

### Metrics
- `GET /api/dashboard/metrics` - Get dashboard metrics

### ML Model
- `GET /api/model-metrics` - Get model performance metrics
- `POST /api/model/retrain` - Retrain the ML model

### Recommendations
- `POST /api/recommendations` - Get AI recommendations for an order

## Project Structure

```
.
├── backend/                 # Python FastAPI backend
│   ├── main.py             # Application entry point
│   ├── database.py         # Database configuration
│   ├── models.py           # SQLAlchemy models
│   ├── schemas.py          # Pydantic schemas
│   ├── routers/            # API route handlers
│   └── services/           # Business logic services
├── src/                    # React frontend
│   ├── App.tsx            # Main application component
│   ├── components/        # React components
│   └── types.ts           # TypeScript type definitions
├── .env                   # Frontend environment variables
└── package.json          # Node.js dependencies

```

## Development

### Run Tests

Backend tests:
```bash
cd backend
pytest
```

### Database

The system uses SQLite for development. Database file: `backend/eluno_oms.db`

To reset the database, delete the file and restart the backend.

## Deployment

See `docker-compose.yml` for containerized deployment configuration.

## License

MIT
