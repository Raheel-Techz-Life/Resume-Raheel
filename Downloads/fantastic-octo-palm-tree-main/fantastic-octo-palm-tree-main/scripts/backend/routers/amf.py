"""
AMF - Anomaly & Migration Framework Router
Handles migration pattern analysis and mobility scoring.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from services.anomaly_detection import get_migration_patterns, get_mobility_score

router = APIRouter()


@router.get("/migration-patterns")
async def migration_patterns(
    origin: Optional[str] = Query(None, description="Filter by origin state"),
    destination: Optional[str] = Query(None, description="Filter by destination state"),
    pattern_type: Optional[str] = Query(None, description="Filter by pattern type"),
    limit: int = Query(50, description="Maximum results to return"),
):
    """
    Get migration patterns with optional filters.
    
    Analyzes address change patterns to identify migration corridors,
    seasonal movements, and economic migration trends.
    """
    try:
        result = get_migration_patterns(
            origin=origin,
            destination=destination,
            pattern_type=pattern_type,
            limit=limit,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/mobility-score/{uid}")
async def mobility_score(uid: str):
    """
    Get mobility score for a specific UID.
    
    Calculates a mobility index based on address changes,
    service usage locations, and authentication patterns.
    """
    try:
        result = get_mobility_score(uid)
        if not result:
            raise HTTPException(status_code=404, detail="UID not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
