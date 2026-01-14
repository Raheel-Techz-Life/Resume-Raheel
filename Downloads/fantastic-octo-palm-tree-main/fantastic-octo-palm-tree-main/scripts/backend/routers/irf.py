"""
IRF - Identity Resolution Framework Router
Handles identity matching and linking across records.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.identity_resolution import match_identities, get_linked_identities

router = APIRouter()


class MatchRequest(BaseModel):
    query_record: dict
    match_threshold: float = 0.8
    max_results: int = 10


@router.post("/match")
async def match(request: MatchRequest):
    """
    Find matching identities based on query parameters.
    
    Performs probabilistic record linkage using multiple fields
    (name, address, DOB, biometrics) with configurable threshold.
    """
    try:
        result = match_identities(
            request.query_record,
            request.match_threshold,
            request.max_results,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/linked-identities/{uid}")
async def linked_identities(uid: str):
    """
    Get all linked identities for a given UID.
    
    Returns family members, same-address residents, and other
    linked identities with confidence scores.
    """
    try:
        result = get_linked_identities(uid)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
