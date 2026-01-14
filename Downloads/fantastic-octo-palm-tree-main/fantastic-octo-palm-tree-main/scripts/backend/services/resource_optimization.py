"""
PROF - Public Resource Optimization Framework
Business logic for resource allocation, migration analysis, and policy optimization.

Core Capabilities:
- Migration Pressure Index: Shows stressed districts
- Predictive Demand Forecasting: Health, ration, enrollment load
- Automated Recommendations: Vans, staff, funding
- Outcome Feedback Loop: Policy action effectiveness tracking
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from dataclasses import dataclass, field, asdict
from enum import Enum
import uuid
import json
from collections import defaultdict


# =============================================================================
# Enums and Data Classes
# =============================================================================

class ResourceType(str, Enum):
    """Types of resources that can be allocated"""
    MOBILE_VANS = "mobile_vans"
    STAFF = "staff"
    FUNDING = "funding"
    MEDICAL_SUPPLIES = "medical_supplies"
    RATION_SUPPLIES = "ration_supplies"
    INFRASTRUCTURE = "infrastructure"


class DemandCategory(str, Enum):
    """Categories for demand forecasting"""
    HEALTHCARE = "healthcare"
    RATION = "ration"
    EDUCATION = "education"
    BANKING = "banking"
    SOCIAL_WELFARE = "social_welfare"


class PolicyStatus(str, Enum):
    """Status of policy actions"""
    PROPOSED = "proposed"
    APPROVED = "approved"
    IMPLEMENTED = "implemented"
    MONITORING = "monitoring"
    COMPLETED = "completed"
    FAILED = "failed"


class PressureLevel(str, Enum):
    """Migration pressure levels"""
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class District:
    """District with resource and migration data"""
    district_id: str
    name: str
    state: str
    population: int = 0
    migration_inflow: int = 0
    migration_outflow: int = 0
    pressure_index: float = 0.0
    pressure_level: str = "low"
    resource_score: float = 0.0
    infrastructure_gap: float = 0.0
    last_updated: str = ""
    
    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class DemandForecast:
    """Predictive demand forecast for a region"""
    forecast_id: str
    district_id: str
    category: str
    current_demand: int = 0
    predicted_demand: int = 0
    forecast_period: str = ""  # e.g., "Q1 2026"
    confidence: float = 0.0
    growth_rate: float = 0.0
    factors: List[str] = field(default_factory=list)
    created_at: str = ""
    
    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class ResourceRecommendation:
    """Automated resource allocation recommendation"""
    recommendation_id: str
    district_id: str
    resource_type: str
    quantity: int = 0
    priority: str = "medium"
    justification: str = ""
    estimated_impact: float = 0.0
    estimated_cost: float = 0.0
    status: str = "proposed"
    created_at: str = ""
    
    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class PolicyAction:
    """Policy action with outcome tracking"""
    action_id: str
    title: str
    description: str
    district_ids: List[str] = field(default_factory=list)
    resource_type: str = ""
    budget_allocated: float = 0.0
    status: str = "proposed"
    start_date: str = ""
    end_date: str = ""
    kpis: Dict[str, Any] = field(default_factory=dict)
    outcomes: Dict[str, Any] = field(default_factory=dict)
    effectiveness_score: float = 0.0
    created_at: str = ""
    
    def to_dict(self) -> dict:
        return asdict(self)


# =============================================================================
# In-Memory Data Stores (Empty - integrate your dataset)
# =============================================================================

_districts: Dict[str, District] = {}
_demand_forecasts: Dict[str, DemandForecast] = {}
_recommendations: Dict[str, ResourceRecommendation] = {}
_policy_actions: Dict[str, PolicyAction] = {}
_migration_history: List[Dict[str, Any]] = []


# =============================================================================
# Initialization - Load from CSV files
# =============================================================================

def _initialize_from_csv():
    """
    Initialize data from CSV files in the data folder.
    
    Expected CSV files:
    - data/districts.csv
    - data/demand_forecasts.csv
    - data/recommendations.csv
    - data/policy_actions.csv
    """
    global _districts, _demand_forecasts, _recommendations, _policy_actions
    
    try:
        from services.csv_loader import (
            load_districts, load_demand_forecasts,
            load_recommendations, load_policy_actions,
            generate_sample_templates
        )
        
        # Generate templates if they don't exist
        generate_sample_templates()
        
        # Load districts
        districts_data = load_districts()
        _districts = {}
        for row in districts_data:
            district = District(
                district_id=row.get('district_id', ''),
                name=row.get('name', ''),
                state=row.get('state', ''),
                population=int(row.get('population', 0) or 0),
                migration_inflow=int(row.get('migration_inflow', 0) or 0),
                migration_outflow=int(row.get('migration_outflow', 0) or 0),
                pressure_index=float(row.get('pressure_index', 0) or 0),
                pressure_level=row.get('pressure_level', 'low'),
                resource_score=float(row.get('resource_score', 0) or 0),
                infrastructure_gap=float(row.get('infrastructure_gap', 0) or 0),
                last_updated=row.get('last_updated', ''),
            )
            _districts[district.district_id] = district
        
        # Load demand forecasts
        forecasts_data = load_demand_forecasts()
        _demand_forecasts = {}
        for row in forecasts_data:
            forecast = DemandForecast(
                forecast_id=row.get('forecast_id', ''),
                district_id=row.get('district_id', ''),
                category=row.get('category', ''),
                current_demand=int(row.get('current_demand', 0) or 0),
                predicted_demand=int(row.get('predicted_demand', 0) or 0),
                forecast_period=row.get('forecast_period', ''),
                confidence=float(row.get('confidence', 0) or 0),
                growth_rate=float(row.get('growth_rate', 0) or 0),
                factors=row.get('factors', []),
                created_at=row.get('created_at', ''),
            )
            _demand_forecasts[forecast.forecast_id] = forecast
        
        # Load recommendations
        recs_data = load_recommendations()
        _recommendations = {}
        for row in recs_data:
            rec = ResourceRecommendation(
                recommendation_id=row.get('recommendation_id', ''),
                district_id=row.get('district_id', ''),
                resource_type=row.get('resource_type', ''),
                quantity=int(row.get('quantity', 0) or 0),
                priority=row.get('priority', 'medium'),
                justification=row.get('justification', ''),
                estimated_impact=float(row.get('estimated_impact', 0) or 0),
                estimated_cost=float(row.get('estimated_cost', 0) or 0),
                status=row.get('status', 'proposed'),
                created_at=row.get('created_at', ''),
            )
            _recommendations[rec.recommendation_id] = rec
        
        # Load policy actions
        policies_data = load_policy_actions()
        _policy_actions = {}
        for row in policies_data:
            policy = PolicyAction(
                action_id=row.get('action_id', ''),
                title=row.get('title', ''),
                description=row.get('description', ''),
                district_ids=row.get('district_ids', []),
                resource_type=row.get('resource_type', ''),
                budget_allocated=float(row.get('budget_allocated', 0) or 0),
                status=row.get('status', 'proposed'),
                start_date=row.get('start_date', ''),
                end_date=row.get('end_date', ''),
                kpis=row.get('kpis', {}),
                outcomes=row.get('outcomes', {}),
                effectiveness_score=float(row.get('effectiveness_score', 0) or 0),
                created_at=row.get('created_at', ''),
            )
            _policy_actions[policy.action_id] = policy
        
        print(f"PROF: Loaded {len(_districts)} districts, {len(_demand_forecasts)} forecasts, {len(_recommendations)} recommendations, {len(_policy_actions)} policies")
        
    except Exception as e:
        print(f"Error loading CSV data: {e}")
        # Fall back to empty initialization
        _districts = {}
        _demand_forecasts = {}
        _recommendations = {}
        _policy_actions = {}


def _initialize_data():
    """Legacy function - now calls CSV loader"""
    _initialize_from_csv()


# Initialize on module load
_initialize_data()


# =============================================================================
# Migration Pressure Index Functions
# =============================================================================

def get_all_districts() -> List[Dict[str, Any]]:
    """Get all districts with migration pressure data"""
    return [d.to_dict() for d in _districts.values()]


def get_district(district_id: str) -> Optional[Dict[str, Any]]:
    """Get specific district details"""
    district = _districts.get(district_id)
    return district.to_dict() if district else None


def get_stressed_districts(threshold: float = 60.0) -> List[Dict[str, Any]]:
    """Get districts with pressure index above threshold"""
    stressed = [d for d in _districts.values() if d.pressure_index >= threshold]
    return [d.to_dict() for d in sorted(stressed, key=lambda x: x.pressure_index, reverse=True)]


def get_migration_pressure_summary() -> Dict[str, Any]:
    """Get summary of migration pressure across regions"""
    if not _districts:
        return {
            "total_districts": 0,
            "pressure_breakdown": {"low": 0, "moderate": 0, "high": 0, "critical": 0},
            "avg_pressure_index": 0,
            "top_stressed": [],
            "total_migration_inflow": 0,
            "total_migration_outflow": 0,
        }
    
    pressure_counts = defaultdict(int)
    total_pressure = 0
    total_inflow = 0
    total_outflow = 0
    
    for d in _districts.values():
        pressure_counts[d.pressure_level] += 1
        total_pressure += d.pressure_index
        total_inflow += d.migration_inflow
        total_outflow += d.migration_outflow
    
    stressed = get_stressed_districts(60.0)[:5]
    
    return {
        "total_districts": len(_districts),
        "pressure_breakdown": dict(pressure_counts),
        "avg_pressure_index": total_pressure / len(_districts) if _districts else 0,
        "top_stressed": stressed,
        "total_migration_inflow": total_inflow,
        "total_migration_outflow": total_outflow,
    }


# =============================================================================
# Predictive Demand Forecasting Functions
# =============================================================================

def get_all_forecasts() -> List[Dict[str, Any]]:
    """Get all demand forecasts"""
    return [f.to_dict() for f in _demand_forecasts.values()]


def get_forecasts_by_district(district_id: str) -> List[Dict[str, Any]]:
    """Get forecasts for a specific district"""
    forecasts = [f for f in _demand_forecasts.values() if f.district_id == district_id]
    return [f.to_dict() for f in forecasts]


def get_forecasts_by_category(category: str) -> List[Dict[str, Any]]:
    """Get forecasts for a specific category"""
    forecasts = [f for f in _demand_forecasts.values() if f.category == category]
    return [f.to_dict() for f in forecasts]


def get_demand_summary() -> Dict[str, Any]:
    """Get summary of demand forecasts"""
    if not _demand_forecasts:
        return {
            "total_forecasts": 0,
            "by_category": {},
            "high_growth_areas": [],
            "avg_confidence": 0,
        }
    
    category_counts = defaultdict(int)
    category_growth = defaultdict(list)
    total_confidence = 0
    
    for f in _demand_forecasts.values():
        category_counts[f.category] += 1
        category_growth[f.category].append(f.growth_rate)
        total_confidence += f.confidence
    
    by_category = {}
    for cat, count in category_counts.items():
        growth_rates = category_growth[cat]
        by_category[cat] = {
            "count": count,
            "avg_growth_rate": sum(growth_rates) / len(growth_rates) if growth_rates else 0,
        }
    
    # High growth areas
    high_growth = [f for f in _demand_forecasts.values() if f.growth_rate > 15]
    
    return {
        "total_forecasts": len(_demand_forecasts),
        "by_category": by_category,
        "high_growth_areas": [f.to_dict() for f in high_growth[:10]],
        "avg_confidence": total_confidence / len(_demand_forecasts) if _demand_forecasts else 0,
    }


# =============================================================================
# Automated Recommendations Functions
# =============================================================================

def get_all_recommendations() -> List[Dict[str, Any]]:
    """Get all resource recommendations"""
    return [r.to_dict() for r in _recommendations.values()]


def get_recommendations_by_district(district_id: str) -> List[Dict[str, Any]]:
    """Get recommendations for a specific district"""
    recs = [r for r in _recommendations.values() if r.district_id == district_id]
    return [r.to_dict() for r in recs]


def get_recommendations_by_priority(priority: str) -> List[Dict[str, Any]]:
    """Get recommendations by priority level"""
    recs = [r for r in _recommendations.values() if r.priority == priority]
    return [r.to_dict() for r in recs]


def get_pending_recommendations() -> List[Dict[str, Any]]:
    """Get recommendations that are pending approval"""
    pending = [r for r in _recommendations.values() if r.status == "proposed"]
    return [r.to_dict() for r in sorted(pending, key=lambda x: x.estimated_impact, reverse=True)]


def get_recommendations_summary() -> Dict[str, Any]:
    """Get summary of resource recommendations"""
    if not _recommendations:
        return {
            "total_recommendations": 0,
            "by_status": {},
            "by_priority": {},
            "by_resource_type": {},
            "total_estimated_cost": 0,
            "pending_count": 0,
        }
    
    status_counts = defaultdict(int)
    priority_counts = defaultdict(int)
    type_counts = defaultdict(int)
    total_cost = 0
    
    for r in _recommendations.values():
        status_counts[r.status] += 1
        priority_counts[r.priority] += 1
        type_counts[r.resource_type] += 1
        total_cost += r.estimated_cost
    
    return {
        "total_recommendations": len(_recommendations),
        "by_status": dict(status_counts),
        "by_priority": dict(priority_counts),
        "by_resource_type": dict(type_counts),
        "total_estimated_cost": total_cost,
        "pending_count": status_counts.get("proposed", 0),
    }


# =============================================================================
# Outcome Feedback Loop Functions
# =============================================================================

def get_all_policy_actions() -> List[Dict[str, Any]]:
    """Get all policy actions"""
    return [p.to_dict() for p in _policy_actions.values()]


def get_policy_action(action_id: str) -> Optional[Dict[str, Any]]:
    """Get specific policy action details"""
    action = _policy_actions.get(action_id)
    return action.to_dict() if action else None


def get_active_policies() -> List[Dict[str, Any]]:
    """Get currently active policy actions"""
    active = [p for p in _policy_actions.values() 
              if p.status in ["approved", "implemented", "monitoring"]]
    return [p.to_dict() for p in active]


def get_policy_outcomes() -> List[Dict[str, Any]]:
    """Get policy actions with their outcomes"""
    completed = [p for p in _policy_actions.values() 
                 if p.status in ["completed", "monitoring"] and p.outcomes]
    return [p.to_dict() for p in completed]


def get_policy_effectiveness_summary() -> Dict[str, Any]:
    """Get summary of policy effectiveness"""
    if not _policy_actions:
        return {
            "total_policies": 0,
            "by_status": {},
            "avg_effectiveness": 0,
            "total_budget": 0,
            "successful_policies": 0,
            "failed_policies": 0,
        }
    
    status_counts = defaultdict(int)
    total_effectiveness = 0
    total_budget = 0
    effective_count = 0
    successful = 0
    failed = 0
    
    for p in _policy_actions.values():
        status_counts[p.status] += 1
        total_budget += p.budget_allocated
        
        if p.effectiveness_score > 0:
            total_effectiveness += p.effectiveness_score
            effective_count += 1
            
            if p.effectiveness_score >= 70:
                successful += 1
            elif p.effectiveness_score < 40:
                failed += 1
    
    return {
        "total_policies": len(_policy_actions),
        "by_status": dict(status_counts),
        "avg_effectiveness": total_effectiveness / effective_count if effective_count else 0,
        "total_budget": total_budget,
        "successful_policies": successful,
        "failed_policies": failed,
    }


# =============================================================================
# Dashboard Statistics
# =============================================================================

def get_dashboard_stats() -> Dict[str, Any]:
    """Get comprehensive dashboard statistics for PROF"""
    migration = get_migration_pressure_summary()
    demand = get_demand_summary()
    recommendations = get_recommendations_summary()
    policy = get_policy_effectiveness_summary()
    
    return {
        "migration_pressure": migration,
        "demand_forecasting": demand,
        "recommendations": recommendations,
        "policy_effectiveness": policy,
        "last_updated": datetime.now().isoformat(),
    }
