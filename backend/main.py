from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from database import engine, Base, get_db
from routers import inventory, orders, alerts, metrics, ml_model, recommendations

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: cleanup if needed

app = FastAPI(
    title="Eluno AI Order Management System",
    description="Intelligent fulfillment platform for eyewear production with predictive ML",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(inventory.router, prefix="/api", tags=["Inventory"])
app.include_router(orders.router, prefix="/api", tags=["Orders"])
app.include_router(alerts.router, prefix="/api", tags=["Alerts"])
app.include_router(metrics.router, prefix="/api", tags=["Metrics"])
app.include_router(ml_model.router, prefix="/api", tags=["ML Model"])
app.include_router(recommendations.router, prefix="/api", tags=["Recommendations"])

@app.get("/")
def read_root():
    return {"message": "Eluno AI OMS Backend API", "status": "running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
