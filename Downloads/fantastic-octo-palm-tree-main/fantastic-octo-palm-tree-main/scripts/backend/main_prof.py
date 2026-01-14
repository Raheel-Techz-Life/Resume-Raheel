"""
PROF - Public Resource Optimization Framework
FastAPI Backend Server (Port 8001)

Core Capabilities:
- Migration Pressure Index: Shows stressed districts
- Predictive Demand Forecasting: Health, ration, enrollment load
- Automated Recommendations: Vans, staff, funding
- Outcome Feedback Loop: Policy action effectiveness tracking
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import prof

app = FastAPI(
    title="PROF - Public Resource Optimization Framework",
    description="Policy-maker toolkit for resource allocation using Aadhaar insights",
    version="1.0.0",
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include PROF router
app.include_router(prof.router, prefix="/prof")


@app.get("/")
async def root():
    return {
        "framework": "PROF - Public Resource Optimization Framework",
        "version": "1.0.0",
        "capabilities": [
            "Migration Pressure Index",
            "Predictive Demand Forecasting",
            "Automated Recommendations",
            "Outcome Feedback Loop"
        ],
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "framework": "PROF"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001, reload=True)
