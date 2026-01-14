"""
AFIF - Aadhaar Fraud Intelligence Framework Router

Core Capabilities:
- Registration Hub Detection: Unusual spikes from centers/IPs
- Network Graph Analysis: Find linked suspicious identities
- Risk-Based Alerts: Soft warnings → audits → enforcement
- Tamper-Evident Logs: Immutable audit trail
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any
from services.fraud_intelligence import (
    # Core functions
    get_anomalies,
    get_fraud_score,
    flag_record,
    # Registration hub detection
    get_registration_hubs,
    detect_registration_spikes,
    get_ip_analysis,
    # Network graph analysis
    get_network_clusters,
    get_linked_identities,
    analyze_network_risk,
    # Case management
    get_cases,
    update_case_status,
    # Audit trail
    get_audit_log,
    verify_audit_chain,
    # Dashboard
    get_dashboard_stats,
)

router = APIRouter()


# =============================================================================
# Request/Response Models
# =============================================================================

class FlagRequest(BaseModel):
    uid: str
    reason: str
    evidence: Optional[Dict[str, Any]] = None


class CaseUpdateRequest(BaseModel):
    new_status: str
    resolution: Optional[str] = None


# =============================================================================
# Core Anomaly Detection Endpoints
# =============================================================================

@router.get("/anomalies")
async def anomalies(
    status: Optional[str] = Query(None, description="Filter by status"),
    type: Optional[str] = Query(None, description="Filter by anomaly type"),
    region: Optional[str] = Query(None, description="Filter by region"),
    min_score: Optional[float] = Query(None, description="Minimum fraud score"),
    alert_level: Optional[str] = Query(None, description="Filter by alert level"),
    limit: int = Query(50, description="Maximum results"),
):
    """
    Get list of detected anomalies with optional filters.
    
    Returns anomalies detected by ML models including:
    - Duplicate biometrics
    - Address inconsistencies
    - Multiple registrations
    - Unusual activity patterns
    - Registration spikes
    - Network collusion
    """
    try:
        result = get_anomalies(
            status=status,
            anomaly_type=type,
            region=region,
            min_score=min_score,
            alert_level=alert_level,
            limit=limit,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/fraud-score/{uid}")
async def fraud_score(uid: str):
    """
    Get composite fraud score for a specific UID.
    
    Returns a risk assessment including:
    - Composite risk score (0-100)
    - Risk level (low/medium/high/critical)
    - Risk factors identified
    - Alert level for graduated response
    - Network analysis summary
    """
    try:
        result = get_fraud_score(uid)
        if not result:
            raise HTTPException(status_code=404, detail="UID not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/flag")
async def flag(request: FlagRequest):
    """
    Flag a record for investigation.
    
    Creates a case in the investigation queue with:
    - Automatic priority assignment based on fraud score
    - Alert level determination
    - Audit trail entry
    """
    try:
        result = flag_record(request.uid, request.reason, request.evidence)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# Registration Hub Detection Endpoints
# =============================================================================

@router.get("/hubs")
async def registration_hubs(
    state: Optional[str] = Query(None, description="Filter by state"),
    spike_only: bool = Query(False, description="Only show hubs with spikes"),
    min_risk: Optional[float] = Query(None, description="Minimum risk score"),
    limit: int = Query(50, description="Maximum results"),
):
    """
    Get registration hubs with activity metrics.
    
    Returns hub data including:
    - Daily/weekly registration counts
    - Spike detection status
    - Risk scores
    - Associated IP addresses
    """
    try:
        result = get_registration_hubs(
            state=state,
            spike_only=spike_only,
            min_risk=min_risk,
            limit=limit,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/hubs/spikes")
async def registration_spikes(
    threshold: float = Query(2.0, description="Spike detection threshold (multiplier)"),
):
    """
    Detect unusual registration spikes from centers.
    
    Identifies hubs where daily registrations exceed
    the historical average by the specified threshold.
    """
    try:
        result = detect_registration_spikes(threshold=threshold)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ip-analysis")
async def ip_analysis(
    ip_address: Optional[str] = Query(None, description="Specific IP to analyze"),
):
    """
    Analyze IP address patterns for anomalies.
    
    Detects:
    - Multi-state activity from single IP
    - Multiple hub access
    - High volume activity
    """
    try:
        result = get_ip_analysis(ip_address=ip_address)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# Network Graph Analysis Endpoints
# =============================================================================

@router.get("/network/clusters")
async def network_clusters(
    min_size: int = Query(2, description="Minimum cluster size"),
    suspicious_only: bool = Query(False, description="Only suspicious clusters"),
):
    """
    Get identity network clusters.
    
    Returns clusters of linked identities with:
    - Cluster size and members
    - Suspicion status
    - Average risk propagation
    - Connection types (shared_address, shared_phone, etc.)
    """
    try:
        result = get_network_clusters(
            min_size=min_size,
            suspicious_only=suspicious_only,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/network/linked/{uid}")
async def linked_identities(uid: str):
    """
    Get all identities linked to a given UID.
    
    Returns direct connections with:
    - Connection type
    - Suspicion status
    - Risk propagation score
    """
    try:
        result = get_linked_identities(uid)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/network/risk/{uid}")
async def network_risk(
    uid: str,
    depth: int = Query(2, description="Analysis depth (hops)"),
):
    """
    Analyze network-based risk for a UID.
    
    Performs graph traversal to calculate:
    - Network risk score with decay
    - Connected suspicious identities
    - Total network size analyzed
    """
    try:
        result = analyze_network_risk(uid, depth=depth)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# Case Management Endpoints
# =============================================================================

@router.get("/cases")
async def cases(
    status: Optional[str] = Query(None, description="Filter by case status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    limit: int = Query(50, description="Maximum results"),
):
    """
    Get investigation cases.
    
    Returns cases with status, priority, and assignment info.
    """
    try:
        result = get_cases(status=status, priority=priority, limit=limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/cases/{case_id}")
async def update_case(case_id: str, request: CaseUpdateRequest):
    """
    Update investigation case status.
    
    Status transitions: pending → investigating → confirmed/resolved/dismissed
    """
    try:
        result = update_case_status(
            case_id=case_id,
            new_status=request.new_status,
            resolution=request.resolution,
        )
        if not result.get("success"):
            raise HTTPException(status_code=404, detail=result.get("error", "Case not found"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# Tamper-Evident Audit Trail Endpoints
# =============================================================================

@router.get("/audit-log")
async def audit_log(
    limit: int = Query(100, description="Maximum entries"),
    actor: Optional[str] = Query(None, description="Filter by actor"),
    action: Optional[str] = Query(None, description="Filter by action type"),
    target_uid: Optional[str] = Query(None, description="Filter by target UID"),
):
    """
    Get tamper-evident audit log entries.
    
    Each entry includes:
    - Timestamp and action details
    - Previous and current hash for chain verification
    """
    try:
        result = get_audit_log(
            limit=limit,
            actor=actor,
            action=action,
            target_uid=target_uid,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/audit-log/verify")
async def verify_audit():
    """
    Verify integrity of the audit log chain.
    
    Checks hash chain integrity to detect any tampering.
    """
    try:
        result = verify_audit_chain()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# Dashboard & Statistics Endpoints
# =============================================================================

@router.get("/dashboard")
async def dashboard():
    """
    Get comprehensive dashboard statistics.
    
    Returns:
    - Anomaly counts and breakdowns
    - Hub statistics
    - Network analysis summary
    - Alert level distribution
    """
    try:
        result = get_dashboard_stats()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reload")
async def reload_data():
    """
    Reload all data from CSV files.
    
    Call this endpoint after updating CSV files to refresh the data
    without restarting the server.
    """
    try:
        from services.fraud_intelligence import _initialize_from_csv
        _initialize_from_csv()
        return {"status": "success", "message": "AFIF data reloaded from CSV files"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
