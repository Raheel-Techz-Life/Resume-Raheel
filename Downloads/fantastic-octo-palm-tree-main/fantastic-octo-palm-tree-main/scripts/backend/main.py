"""
AFIF - Aadhaar Fraud Intelligence Framework
FastAPI Backend for Fraud Detection & National Integrity

Run with: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import afif

app = FastAPI(
    title="AFIF - Aadhaar Fraud Intelligence Framework",
    description="Fraud detection, network analysis, and governance platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include AFIF router only
app.include_router(afif.router, prefix="/afif", tags=["AFIF - Fraud Intelligence"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AFIF - Aadhaar Fraud Intelligence Framework",
        "version": "1.0.0",
        "capabilities": [
            "Registration Hub Detection",
            "Network Graph Analysis", 
            "Risk-Based Alerts",
            "Tamper-Evident Logs"
        ],
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "framework": "AFIF",
        "components": {
            "anomaly_detection": {"status": "operational"},
            "fraud_scoring": {"status": "operational"},
            "network_analysis": {"status": "operational"},
            "hub_monitoring": {"status": "operational"},
            "audit_log": {"status": "operational"},
        },
    }
