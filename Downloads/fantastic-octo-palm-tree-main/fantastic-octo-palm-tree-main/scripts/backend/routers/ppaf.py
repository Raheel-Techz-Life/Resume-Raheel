"""
PPAF - Privacy Preserving Analytics Framework Router
Handles differential privacy queries and audit logging.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from services.privacy_analytics import execute_private_query, get_audit_log

router = APIRouter()


class PrivacyQuery(BaseModel):
    query_type: str
    parameters: dict
    epsilon: float = 1.0
    delta: float = 1e-5


@router.post("/query")
async def query(request: PrivacyQuery):
    """
    Execute a differentially private query.
    
    Applies differential privacy mechanisms to ensure individual
    privacy while allowing aggregate analysis. Tracks privacy
    budget (epsilon) consumption.
    
    Supported query types:
    - count: Count records matching criteria
    - sum: Sum numeric fields
    - average: Calculate averages
    - histogram: Distribution analysis
    """
    try:
        result = execute_private_query(
            query_type=request.query_type,
            parameters=request.parameters,
            epsilon=request.epsilon,
            delta=request.delta,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/audit-log")
async def audit_log(
    limit: int = Query(50, description="Maximum entries to return"),
    user: Optional[str] = Query(None, description="Filter by user"),
):
    """
    Get audit log of privacy queries.
    
    Returns complete history of differential privacy queries
    for compliance and monitoring purposes.
    """
    try:
        result = get_audit_log(limit=limit, user=user)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
