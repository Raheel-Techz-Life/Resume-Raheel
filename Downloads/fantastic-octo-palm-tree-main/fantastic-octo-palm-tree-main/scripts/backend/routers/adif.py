"""
ADIF - Aadhaar Data Integrity Framework Router
Handles data normalization, deduplication, and confidence scoring.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.data_integrity import (
    normalize_records,
    deduplicate_records,
    get_confidence_score,
)

router = APIRouter()


class AadhaarRecord(BaseModel):
    uid: str
    name: str
    address: str
    dob: str
    biometric_hash: Optional[str] = None
    created_at: Optional[str] = None


class NormalizeRequest(BaseModel):
    records: list[AadhaarRecord]


class DeduplicateRequest(BaseModel):
    records: list[AadhaarRecord]
    threshold: float = 0.85


@router.post("/normalize")
async def normalize(request: NormalizeRequest):
    """
    Normalize Aadhaar records by standardizing formats.
    
    - Standardizes name formats (title case, removes extra spaces)
    - Normalizes addresses (abbreviation expansion, formatting)
    - Validates and formats dates
    - Computes confidence scores for each field
    """
    try:
        result = normalize_records(request.records)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/deduplicate")
async def deduplicate(request: DeduplicateRequest):
    """
    Find and flag duplicate records based on similarity threshold.
    
    Uses fuzzy matching on name, address, DOB, and biometric hash
    to identify potential duplicates above the specified threshold.
    """
    try:
        result = deduplicate_records(request.records, request.threshold)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/confidence/{uid}")
async def confidence_score(uid: str):
    """
    Get confidence score for a specific Aadhaar UID.
    
    Returns overall confidence and per-field scores based on
    data quality, verification history, and consistency checks.
    """
    try:
        result = get_confidence_score(uid)
        if not result:
            raise HTTPException(status_code=404, detail="UID not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
