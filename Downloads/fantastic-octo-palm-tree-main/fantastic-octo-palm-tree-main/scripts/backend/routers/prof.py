"""
PROF Router - Public Resource Optimization Framework API Endpoints

Core Capabilities:
- Migration Pressure Index: Shows stressed districts
- Predictive Demand Forecasting: Health, ration, enrollment load
- Automated Recommendations: Vans, staff, funding
- Outcome Feedback Loop: Policy action effectiveness tracking
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from services import resource_optimization as prof

router = APIRouter(tags=["PROF - Resource Optimization"])


# =============================================================================
# Migration Pressure Index Endpoints
# =============================================================================

@router.get("/districts")
async def get_all_districts():
    """Get all districts with migration and resource data"""
    return prof.get_all_districts()


@router.get("/districts/stressed")
async def get_stressed_districts(threshold: float = Query(60.0, description="Pressure index threshold")):
    """Get districts with high migration pressure"""
    return prof.get_stressed_districts(threshold)


@router.get("/districts/{district_id}")
async def get_district(district_id: str):
    """Get specific district details"""
    district = prof.get_district(district_id)
    if not district:
        raise HTTPException(status_code=404, detail="District not found")
    return district


@router.get("/migration/summary")
async def get_migration_summary():
    """Get migration pressure summary across all regions"""
    return prof.get_migration_pressure_summary()


# =============================================================================
# Predictive Demand Forecasting Endpoints
# =============================================================================

@router.get("/forecasts")
async def get_all_forecasts():
    """Get all demand forecasts"""
    return prof.get_all_forecasts()


@router.get("/forecasts/summary")
async def get_demand_summary():
    """Get summary of all demand forecasts"""
    return prof.get_demand_summary()


@router.get("/forecasts/district/{district_id}")
async def get_forecasts_by_district(district_id: str):
    """Get demand forecasts for a specific district"""
    return prof.get_forecasts_by_district(district_id)


@router.get("/forecasts/category/{category}")
async def get_forecasts_by_category(category: str):
    """Get demand forecasts by category (healthcare, ration, education, banking, social_welfare)"""
    return prof.get_forecasts_by_category(category)


# =============================================================================
# Automated Recommendations Endpoints
# =============================================================================

@router.get("/recommendations")
async def get_all_recommendations():
    """Get all resource allocation recommendations"""
    return prof.get_all_recommendations()


@router.get("/recommendations/pending")
async def get_pending_recommendations():
    """Get pending recommendations awaiting approval"""
    return prof.get_pending_recommendations()


@router.get("/recommendations/summary")
async def get_recommendations_summary():
    """Get summary of all recommendations"""
    return prof.get_recommendations_summary()


@router.get("/recommendations/district/{district_id}")
async def get_recommendations_by_district(district_id: str):
    """Get recommendations for a specific district"""
    return prof.get_recommendations_by_district(district_id)


@router.get("/recommendations/priority/{priority}")
async def get_recommendations_by_priority(priority: str):
    """Get recommendations by priority (low, medium, high, critical)"""
    return prof.get_recommendations_by_priority(priority)


# =============================================================================
# Outcome Feedback Loop Endpoints
# =============================================================================

@router.get("/policies")
async def get_all_policies():
    """Get all policy actions"""
    return prof.get_all_policy_actions()


@router.get("/policies/active")
async def get_active_policies():
    """Get currently active policy actions"""
    return prof.get_active_policies()


@router.get("/policies/outcomes")
async def get_policy_outcomes():
    """Get policy actions with their outcomes"""
    return prof.get_policy_outcomes()


@router.get("/policies/effectiveness")
async def get_policy_effectiveness():
    """Get policy effectiveness summary"""
    return prof.get_policy_effectiveness_summary()


@router.get("/policies/{action_id}")
async def get_policy_action(action_id: str):
    """Get specific policy action details"""
    action = prof.get_policy_action(action_id)
    if not action:
        raise HTTPException(status_code=404, detail="Policy action not found")
    return action


# =============================================================================
# Dashboard Endpoint
# =============================================================================

@router.get("/dashboard")
async def get_dashboard():
    """Get comprehensive PROF dashboard statistics"""
    return prof.get_dashboard_stats()


@router.post("/reload")
async def reload_data():
    """
    Reload all data from CSV files.
    
    Call this endpoint after updating CSV files to refresh the data
    without restarting the server.
    """
    try:
        from services.resource_optimization import _initialize_from_csv
        _initialize_from_csv()
        return {"status": "success", "message": "PROF data reloaded from CSV files"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
