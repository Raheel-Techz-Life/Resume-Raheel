"""
AFIF - Aadhaar Fraud Intelligence Framework
Business logic for fraud detection, network analysis, and governance.

Core Capabilities:
- Registration Hub Detection: Unusual spikes from centers/IPs
- Network Graph Analysis: Find linked suspicious identities
- Risk-Based Alerts: Soft warnings → audits → enforcement
- Tamper-Evident Logs: Immutable audit trail
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from dataclasses import dataclass, field, asdict
from enum import Enum
import uuid
import hashlib
import json
from collections import defaultdict
import random
import math


# =============================================================================
# Enums and Data Classes
# =============================================================================

class AlertLevel(str, Enum):
    """Risk-based alert levels for graduated response"""
    SOFT_WARNING = "soft_warning"  # Initial flag, low priority
    AUDIT_REQUIRED = "audit_required"  # Manual review needed
    ENFORCEMENT = "enforcement"  # Immediate action required
    CRITICAL = "critical"  # System-wide alert


class AnomalyType(str, Enum):
    """Types of anomalies detected by AFIF"""
    DUPLICATE_BIOMETRIC = "duplicate_biometric"
    ADDRESS_MISMATCH = "address_mismatch"
    MULTIPLE_REGISTRATIONS = "multiple_registrations"
    UNUSUAL_ACTIVITY = "unusual_activity"
    DOCUMENT_FORGERY = "document_forgery"
    REGISTRATION_SPIKE = "registration_spike"
    NETWORK_COLLUSION = "network_collusion"
    IP_ANOMALY = "ip_anomaly"
    TEMPORAL_ANOMALY = "temporal_anomaly"


class CaseStatus(str, Enum):
    """Investigation case status"""
    PENDING = "pending"
    INVESTIGATING = "investigating"
    CONFIRMED = "confirmed"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


@dataclass
class RegistrationHub:
    """Represents a registration center with activity metrics"""
    hub_id: str
    name: str
    location: str
    state: str
    ip_addresses: List[str] = field(default_factory=list)
    daily_registrations: int = 0
    weekly_registrations: int = 0
    avg_registrations_per_day: float = 0.0
    spike_detected: bool = False
    spike_factor: float = 1.0
    risk_score: float = 0.0
    last_activity: str = ""
    flagged_registrations: int = 0


@dataclass
class NetworkNode:
    """Node in the identity network graph"""
    uid: str
    connections: List[str] = field(default_factory=list)
    connection_types: Dict[str, str] = field(default_factory=dict)  # uid -> type
    cluster_id: Optional[str] = None
    centrality_score: float = 0.0
    risk_propagation: float = 0.0
    is_suspicious: bool = False


@dataclass
class AuditLogEntry:
    """Tamper-evident audit log entry"""
    log_id: str
    timestamp: str
    action: str
    actor: str
    target_uid: Optional[str]
    details: Dict[str, Any]
    previous_hash: str
    current_hash: str
    
    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class Anomaly:
    """Detected anomaly record"""
    id: str
    type: str
    uid: str
    region: str
    fraud_score: float
    status: str
    detected_at: str
    details: Dict[str, Any]
    alert_level: str = "soft_warning"
    hub_id: Optional[str] = None
    network_cluster: Optional[str] = None
    
    def to_dict(self) -> dict:
        return asdict(self)


# =============================================================================
# In-Memory Data Stores (Replace with database in production)
# =============================================================================

# Registration hubs database
_registration_hubs: Dict[str, RegistrationHub] = {}

# Network graph
_identity_network: Dict[str, NetworkNode] = {}

# Anomalies database
_anomalies: Dict[str, Anomaly] = {}

# Investigation cases
_cases: Dict[str, Dict[str, Any]] = {}

# Tamper-evident audit log (blockchain-like)
_audit_log: List[AuditLogEntry] = []
_last_hash: str = "GENESIS_BLOCK_0"

# Registration activity tracking
_registration_activity: Dict[str, List[Dict[str, Any]]] = defaultdict(list)

# IP activity tracking
_ip_activity: Dict[str, List[Dict[str, Any]]] = defaultdict(list)


# =============================================================================
# Initialization - Load from CSV files
# =============================================================================

def _initialize_from_csv():
    """
    Initialize data from CSV files in the data folder.
    
    Expected CSV files:
    - data/registration_hubs.csv
    - data/anomalies.csv
    - data/cases.csv
    - data/network_nodes.csv
    """
    global _registration_hubs, _anomalies, _identity_network, _cases
    
    try:
        from services.csv_loader import (
            load_registration_hubs, load_anomalies, 
            load_cases, load_network_nodes,
            generate_sample_templates
        )
        
        # Generate templates if they don't exist
        generate_sample_templates()
        
        # Load registration hubs
        hubs_data = load_registration_hubs()
        _registration_hubs = {}
        for row in hubs_data:
            hub = RegistrationHub(
                hub_id=row.get('hub_id', ''),
                name=row.get('name', ''),
                location=row.get('location', ''),
                state=row.get('state', ''),
                ip_addresses=row.get('ip_addresses', []),
                daily_registrations=int(row.get('daily_registrations', 0) or 0),
                weekly_registrations=int(row.get('weekly_registrations', 0) or 0),
                avg_registrations_per_day=float(row.get('avg_registrations_per_day', 0) or 0),
                spike_detected=bool(row.get('spike_detected', False)),
                spike_factor=float(row.get('spike_factor', 1.0) or 1.0),
                risk_score=float(row.get('risk_score', 0) or 0),
                last_activity=row.get('last_activity', ''),
                flagged_registrations=int(row.get('flagged_registrations', 0) or 0),
            )
            _registration_hubs[hub.hub_id] = hub
        
        # Load anomalies
        anomalies_data = load_anomalies()
        _anomalies = {}
        for row in anomalies_data:
            anomaly = Anomaly(
                id=row.get('id', ''),
                type=row.get('type', ''),
                uid=row.get('uid', ''),
                region=row.get('region', ''),
                fraud_score=float(row.get('fraud_score', 0) or 0),
                status=row.get('status', 'pending'),
                detected_at=row.get('detected_at', ''),
                details=row.get('details', {}),
                alert_level=row.get('alert_level', 'soft_warning'),
                hub_id=row.get('hub_id'),
                network_cluster=row.get('network_cluster'),
            )
            _anomalies[anomaly.id] = anomaly
        
        # Load cases
        cases_data = load_cases()
        _cases = {}
        for row in cases_data:
            _cases[row.get('case_id', '')] = {
                'case_id': row.get('case_id', ''),
                'anomaly_ids': row.get('anomaly_ids', []),
                'status': row.get('status', 'pending'),
                'priority': row.get('priority', 'medium'),
                'assigned_to': row.get('assigned_to', ''),
                'created_at': row.get('created_at', ''),
                'updated_at': row.get('updated_at', ''),
                'notes': row.get('notes', ''),
            }
        
        # Load network nodes
        nodes_data = load_network_nodes()
        _identity_network = {}
        for row in nodes_data:
            node = NetworkNode(
                uid=row.get('uid', ''),
                connections=row.get('connections', []),
                connection_types={},
                cluster_id=row.get('cluster_id'),
                centrality_score=float(row.get('centrality_score', 0) or 0),
                risk_propagation=float(row.get('risk_propagation', 0) or 0),
                is_suspicious=bool(row.get('is_suspicious', False)),
            )
            _identity_network[node.uid] = node
        
        print(f"AFIF: Loaded {len(_registration_hubs)} hubs, {len(_anomalies)} anomalies, {len(_cases)} cases, {len(_identity_network)} network nodes")
        
    except Exception as e:
        print(f"Error loading CSV data: {e}")
        # Fall back to empty initialization
        _registration_hubs = {}
        _anomalies = {}
        _identity_network = {}
        _cases = {}


def _initialize_mock_data():
    """Legacy function - now calls CSV loader"""
    _initialize_from_csv()


def _calculate_hub_risk(hub: RegistrationHub) -> float:
    """Calculate risk score for a registration hub"""
    risk = 0.0
    
    # Spike factor contribution
    if hub.spike_factor > 2.0:
        risk += 30
    elif hub.spike_factor > 1.5:
        risk += 15
    
    # Flagged registrations
    flag_ratio = hub.flagged_registrations / max(hub.daily_registrations, 1)
    risk += min(flag_ratio * 100, 40)
    
    # Deviation from average
    if hub.daily_registrations > hub.avg_registrations_per_day * 2:
        risk += 20
    
    return min(risk, 100)


def _determine_alert_level(fraud_score: float) -> str:
    """Determine alert level based on fraud score"""
    if fraud_score >= 90:
        return AlertLevel.CRITICAL.value
    elif fraud_score >= 75:
        return AlertLevel.ENFORCEMENT.value
    elif fraud_score >= 50:
        return AlertLevel.AUDIT_REQUIRED.value
    else:
        return AlertLevel.SOFT_WARNING.value


def _create_suspicious_networks():
    """Create mock suspicious identity networks"""
    global _identity_network
    
    # Create 5 suspicious clusters
    for cluster_num in range(5):
        cluster_id = f"CLUSTER-{cluster_num + 1:03d}"
        cluster_size = random.randint(3, 8)
        cluster_uids = [f"UID-{random.randint(1000000, 9999999)}" for _ in range(cluster_size)]
        
        for i, uid in enumerate(cluster_uids):
            connections = [u for u in cluster_uids if u != uid]
            node = NetworkNode(
                uid=uid,
                connections=connections,
                connection_types={u: random.choice(["shared_address", "shared_phone", "shared_device", "family"]) 
                                for u in connections},
                cluster_id=cluster_id,
                centrality_score=random.uniform(0.3, 0.9),
                risk_propagation=random.uniform(0.4, 0.95),
                is_suspicious=True,
            )
            _identity_network[uid] = node


# Initialize on module load
_initialize_mock_data()


# =============================================================================
# Tamper-Evident Audit Log Functions
# =============================================================================

def _compute_hash(data: str, previous_hash: str) -> str:
    """Compute SHA-256 hash for tamper-evident logging"""
    content = f"{previous_hash}|{data}"
    return hashlib.sha256(content.encode()).hexdigest()


def add_audit_log(
    action: str,
    actor: str,
    target_uid: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None
) -> AuditLogEntry:
    """Add a tamper-evident audit log entry"""
    global _last_hash
    
    timestamp = datetime.now().isoformat()
    log_id = f"LOG-{uuid.uuid4().hex[:12].upper()}"
    
    # Create hash of this entry
    data = json.dumps({
        "log_id": log_id,
        "timestamp": timestamp,
        "action": action,
        "actor": actor,
        "target_uid": target_uid,
        "details": details or {},
    }, sort_keys=True)
    
    current_hash = _compute_hash(data, _last_hash)
    
    entry = AuditLogEntry(
        log_id=log_id,
        timestamp=timestamp,
        action=action,
        actor=actor,
        target_uid=target_uid,
        details=details or {},
        previous_hash=_last_hash,
        current_hash=current_hash,
    )
    
    _audit_log.append(entry)
    _last_hash = current_hash
    
    return entry


def get_audit_log(
    limit: int = 100,
    actor: Optional[str] = None,
    action: Optional[str] = None,
    target_uid: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Get audit log entries with optional filters"""
    results = _audit_log.copy()
    
    if actor:
        results = [e for e in results if e.actor == actor]
    if action:
        results = [e for e in results if e.action == action]
    if target_uid:
        results = [e for e in results if e.target_uid == target_uid]
    
    # Return most recent first
    results = sorted(results, key=lambda x: x.timestamp, reverse=True)
    return [e.to_dict() for e in results[:limit]]


def verify_audit_chain() -> Dict[str, Any]:
    """Verify integrity of the audit log chain"""
    if not _audit_log:
        return {"valid": True, "entries_checked": 0, "message": "Empty log"}
    
    previous_hash = "GENESIS_BLOCK_0"
    for i, entry in enumerate(_audit_log):
        if entry.previous_hash != previous_hash:
            return {
                "valid": False,
                "entries_checked": i,
                "error_at": entry.log_id,
                "message": "Chain broken - previous hash mismatch",
            }
        
        # Recompute hash
        data = json.dumps({
            "log_id": entry.log_id,
            "timestamp": entry.timestamp,
            "action": entry.action,
            "actor": entry.actor,
            "target_uid": entry.target_uid,
            "details": entry.details,
        }, sort_keys=True)
        
        computed_hash = _compute_hash(data, previous_hash)
        if computed_hash != entry.current_hash:
            return {
                "valid": False,
                "entries_checked": i,
                "error_at": entry.log_id,
                "message": "Chain broken - hash verification failed",
            }
        
        previous_hash = entry.current_hash
    
    return {
        "valid": True,
        "entries_checked": len(_audit_log),
        "message": "Audit chain integrity verified",
    }


# =============================================================================
# Registration Hub Detection Functions
# =============================================================================

def get_registration_hubs(
    state: Optional[str] = None,
    spike_only: bool = False,
    min_risk: Optional[float] = None,
    limit: int = 50,
) -> List[Dict[str, Any]]:
    """Get registration hubs with optional filters"""
    hubs = list(_registration_hubs.values())
    
    if state:
        hubs = [h for h in hubs if h.state.lower() == state.lower()]
    if spike_only:
        hubs = [h for h in hubs if h.spike_detected]
    if min_risk is not None:
        hubs = [h for h in hubs if h.risk_score >= min_risk]
    
    # Sort by risk score descending
    hubs = sorted(hubs, key=lambda x: x.risk_score, reverse=True)
    
    # Log this query
    add_audit_log(
        action="QUERY_REGISTRATION_HUBS",
        actor="system",
        details={"state": state, "spike_only": spike_only, "min_risk": min_risk},
    )
    
    return [asdict(h) for h in hubs[:limit]]


def detect_registration_spikes(threshold: float = 2.0) -> List[Dict[str, Any]]:
    """Detect unusual registration spikes from centers"""
    spikes = []
    
    for hub in _registration_hubs.values():
        if hub.daily_registrations > hub.avg_registrations_per_day * threshold:
            spike_info = {
                "hub_id": hub.hub_id,
                "name": hub.name,
                "location": hub.location,
                "state": hub.state,
                "current_registrations": hub.daily_registrations,
                "average_registrations": hub.avg_registrations_per_day,
                "spike_factor": hub.daily_registrations / max(hub.avg_registrations_per_day, 1),
                "risk_score": hub.risk_score,
                "ip_addresses": hub.ip_addresses,
                "alert_level": _determine_alert_level(hub.risk_score),
            }
            spikes.append(spike_info)
    
    # Sort by spike factor
    spikes = sorted(spikes, key=lambda x: x["spike_factor"], reverse=True)
    
    # Log detection
    add_audit_log(
        action="DETECT_REGISTRATION_SPIKES",
        actor="system",
        details={"threshold": threshold, "spikes_found": len(spikes)},
    )
    
    return spikes


def get_ip_analysis(ip_address: Optional[str] = None) -> Dict[str, Any]:
    """Analyze IP address patterns for anomalies"""
    ip_stats = defaultdict(lambda: {
        "total_registrations": 0,
        "unique_hubs": set(),
        "states": set(),
        "risk_indicators": [],
    })
    
    # Aggregate IP data from hubs
    for hub in _registration_hubs.values():
        for ip in hub.ip_addresses:
            ip_stats[ip]["total_registrations"] += hub.daily_registrations // len(hub.ip_addresses)
            ip_stats[ip]["unique_hubs"].add(hub.hub_id)
            ip_stats[ip]["states"].add(hub.state)
    
    # Convert sets to lists for JSON serialization
    results = []
    for ip, stats in ip_stats.items():
        if ip_address and ip != ip_address:
            continue
            
        # Calculate risk indicators
        risk_indicators = []
        if len(stats["states"]) > 1:
            risk_indicators.append("multi_state_activity")
        if len(stats["unique_hubs"]) > 3:
            risk_indicators.append("multiple_hub_access")
        if stats["total_registrations"] > 500:
            risk_indicators.append("high_volume")
        
        results.append({
            "ip_address": ip,
            "total_registrations": stats["total_registrations"],
            "unique_hubs": list(stats["unique_hubs"]),
            "states": list(stats["states"]),
            "risk_indicators": risk_indicators,
            "risk_score": len(risk_indicators) * 25,
        })
    
    return {
        "ip_analysis": sorted(results, key=lambda x: x["risk_score"], reverse=True),
        "total_ips_analyzed": len(results),
    }


# =============================================================================
# Network Graph Analysis Functions
# =============================================================================

def get_network_clusters(
    min_size: int = 2,
    suspicious_only: bool = False,
) -> List[Dict[str, Any]]:
    """Get identity network clusters"""
    clusters = defaultdict(list)
    
    for uid, node in _identity_network.items():
        if node.cluster_id:
            clusters[node.cluster_id].append(node)
    
    results = []
    for cluster_id, nodes in clusters.items():
        if len(nodes) < min_size:
            continue
        
        is_suspicious = any(n.is_suspicious for n in nodes)
        if suspicious_only and not is_suspicious:
            continue
        
        avg_risk = sum(n.risk_propagation for n in nodes) / len(nodes)
        
        results.append({
            "cluster_id": cluster_id,
            "size": len(nodes),
            "members": [n.uid for n in nodes],
            "is_suspicious": is_suspicious,
            "avg_risk_propagation": round(avg_risk, 3),
            "connection_types": list(set(
                ct for n in nodes for ct in n.connection_types.values()
            )),
            "alert_level": _determine_alert_level(avg_risk * 100),
        })
    
    return sorted(results, key=lambda x: x["avg_risk_propagation"], reverse=True)


def get_linked_identities(uid: str) -> Dict[str, Any]:
    """Get all identities linked to a given UID"""
    if uid not in _identity_network:
        # Create a new node for UIDs not in network
        return {
            "uid": uid,
            "linked_identities": [],
            "cluster_id": None,
            "is_suspicious": False,
            "risk_propagation": 0.0,
        }
    
    node = _identity_network[uid]
    
    linked = []
    for connected_uid in node.connections:
        connected_node = _identity_network.get(connected_uid)
        if connected_node:
            linked.append({
                "uid": connected_uid,
                "connection_type": node.connection_types.get(connected_uid, "unknown"),
                "is_suspicious": connected_node.is_suspicious,
                "risk_propagation": connected_node.risk_propagation,
            })
    
    # Log query
    add_audit_log(
        action="QUERY_LINKED_IDENTITIES",
        actor="system",
        target_uid=uid,
        details={"linked_count": len(linked)},
    )
    
    return {
        "uid": uid,
        "linked_identities": linked,
        "cluster_id": node.cluster_id,
        "centrality_score": node.centrality_score,
        "is_suspicious": node.is_suspicious,
        "risk_propagation": node.risk_propagation,
    }


def analyze_network_risk(uid: str, depth: int = 2) -> Dict[str, Any]:
    """Analyze network-based risk for a UID"""
    if uid not in _identity_network:
        return {
            "uid": uid,
            "network_risk_score": 0,
            "risk_factors": [],
            "network_size": 0,
            "depth_analyzed": depth,
        }
    
    visited = set()
    queue = [(uid, 0)]
    risk_factors = []
    total_risk = 0
    
    while queue:
        current_uid, current_depth = queue.pop(0)
        if current_uid in visited or current_depth > depth:
            continue
        
        visited.add(current_uid)
        node = _identity_network.get(current_uid)
        
        if node:
            # Decay factor based on depth
            decay = 1.0 / (current_depth + 1)
            total_risk += node.risk_propagation * decay
            
            if node.is_suspicious and current_uid != uid:
                risk_factors.append(f"Connected to suspicious identity {current_uid} at depth {current_depth}")
            
            for connected_uid in node.connections:
                if connected_uid not in visited:
                    queue.append((connected_uid, current_depth + 1))
    
    network_score = min(total_risk * 50, 100)
    
    return {
        "uid": uid,
        "network_risk_score": round(network_score, 2),
        "risk_factors": risk_factors,
        "network_size": len(visited),
        "depth_analyzed": depth,
        "alert_level": _determine_alert_level(network_score),
    }


# =============================================================================
# Anomaly & Fraud Scoring Functions
# =============================================================================

def get_anomalies(
    status: Optional[str] = None,
    anomaly_type: Optional[str] = None,
    region: Optional[str] = None,
    min_score: Optional[float] = None,
    alert_level: Optional[str] = None,
    limit: int = 50,
) -> List[Dict[str, Any]]:
    """Get detected anomalies with optional filters"""
    anomalies = list(_anomalies.values())
    
    if status:
        anomalies = [a for a in anomalies if a.status == status]
    if anomaly_type:
        anomalies = [a for a in anomalies if a.type == anomaly_type]
    if region:
        anomalies = [a for a in anomalies if a.region.lower() == region.lower()]
    if min_score is not None:
        anomalies = [a for a in anomalies if a.fraud_score >= min_score]
    if alert_level:
        anomalies = [a for a in anomalies if a.alert_level == alert_level]
    
    # Sort by fraud score descending
    anomalies = sorted(anomalies, key=lambda x: x.fraud_score, reverse=True)
    
    # Log query
    add_audit_log(
        action="QUERY_ANOMALIES",
        actor="system",
        details={
            "filters": {
                "status": status,
                "type": anomaly_type,
                "region": region,
                "min_score": min_score,
            },
            "results_count": min(len(anomalies), limit),
        },
    )
    
    return [a.to_dict() for a in anomalies[:limit]]


def get_fraud_score(uid: str) -> Optional[Dict[str, Any]]:
    """Calculate composite fraud risk score for a UID"""
    # Check if UID has anomalies
    uid_anomalies = [a for a in _anomalies.values() if a.uid == uid]
    
    # Get network risk
    network_analysis = analyze_network_risk(uid)
    
    # Calculate composite score
    base_score = 10  # Base risk
    
    # Add anomaly-based score
    if uid_anomalies:
        anomaly_score = max(a.fraud_score for a in uid_anomalies)
        base_score += anomaly_score * 0.5
    
    # Add network risk
    base_score += network_analysis["network_risk_score"] * 0.3
    
    # Determine risk factors
    risk_factors = []
    if uid_anomalies:
        risk_factors.extend([f"Anomaly detected: {a.type}" for a in uid_anomalies[:3]])
    risk_factors.extend(network_analysis["risk_factors"][:3])
    
    # Determine risk level
    final_score = min(base_score, 100)
    if final_score >= 80:
        risk_level = "critical"
    elif final_score >= 60:
        risk_level = "high"
    elif final_score >= 40:
        risk_level = "medium"
    else:
        risk_level = "low"
    
    # Log query
    add_audit_log(
        action="QUERY_FRAUD_SCORE",
        actor="system",
        target_uid=uid,
        details={"score": final_score, "risk_level": risk_level},
    )
    
    return {
        "uid": uid,
        "score": round(final_score, 2),
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "alert_level": _determine_alert_level(final_score),
        "network_analysis": {
            "network_size": network_analysis["network_size"],
            "network_risk": network_analysis["network_risk_score"],
        },
        "anomalies_count": len(uid_anomalies),
        "last_updated": datetime.now().isoformat(),
    }


def flag_record(uid: str, reason: str, evidence: Optional[Dict] = None) -> Dict[str, Any]:
    """Flag a record for investigation and create a case"""
    case_id = f"CASE-{uuid.uuid4().hex[:8].upper()}"
    
    # Determine initial priority based on fraud score
    fraud_data = get_fraud_score(uid)
    priority = "high" if fraud_data and fraud_data["score"] >= 70 else "medium"
    
    case = {
        "case_id": case_id,
        "uid": uid,
        "reason": reason,
        "evidence": evidence or {},
        "status": CaseStatus.PENDING.value,
        "priority": priority,
        "alert_level": fraud_data["alert_level"] if fraud_data else AlertLevel.SOFT_WARNING.value,
        "fraud_score": fraud_data["score"] if fraud_data else 0,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "assigned_to": None,
        "resolution": None,
    }
    
    _cases[case_id] = case
    
    # Create anomaly if not exists
    anomaly = Anomaly(
        id=f"ANM-{uuid.uuid4().hex[:8].upper()}",
        type="manual_flag",
        uid=uid,
        region="Unknown",
        fraud_score=fraud_data["score"] if fraud_data else 25,
        status=CaseStatus.PENDING.value,
        detected_at=datetime.now().isoformat(),
        details={"reason": reason, "evidence": evidence, "case_id": case_id},
        alert_level=case["alert_level"],
    )
    _anomalies[anomaly.id] = anomaly
    
    # Log flag action
    add_audit_log(
        action="FLAG_RECORD",
        actor="analyst",
        target_uid=uid,
        details={"case_id": case_id, "reason": reason, "priority": priority},
    )
    
    return {
        "success": True,
        "case_id": case_id,
        "priority": priority,
        "alert_level": case["alert_level"],
        "message": f"Case created with {priority} priority",
    }


def get_cases(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = 50,
) -> List[Dict[str, Any]]:
    """Get investigation cases"""
    cases = list(_cases.values())
    
    if status:
        cases = [c for c in cases if c["status"] == status]
    if priority:
        cases = [c for c in cases if c["priority"] == priority]
    
    # Sort by created_at descending
    cases = sorted(cases, key=lambda x: x["created_at"], reverse=True)
    
    return cases[:limit]


def update_case_status(case_id: str, new_status: str, resolution: Optional[str] = None) -> Dict[str, Any]:
    """Update investigation case status"""
    if case_id not in _cases:
        return {"success": False, "error": "Case not found"}
    
    old_status = _cases[case_id]["status"]
    _cases[case_id]["status"] = new_status
    _cases[case_id]["updated_at"] = datetime.now().isoformat()
    
    if resolution:
        _cases[case_id]["resolution"] = resolution
    
    # Log status change
    add_audit_log(
        action="UPDATE_CASE_STATUS",
        actor="analyst",
        target_uid=_cases[case_id]["uid"],
        details={
            "case_id": case_id,
            "old_status": old_status,
            "new_status": new_status,
            "resolution": resolution,
        },
    )
    
    return {
        "success": True,
        "case_id": case_id,
        "old_status": old_status,
        "new_status": new_status,
    }


# =============================================================================
# Dashboard Statistics
# =============================================================================

def get_dashboard_stats() -> Dict[str, Any]:
    """Get comprehensive dashboard statistics for AFIF"""
    total_anomalies = len(_anomalies)
    
    # Status breakdown
    status_counts = defaultdict(int)
    type_counts = defaultdict(int)
    region_counts = defaultdict(int)
    alert_level_counts = defaultdict(int)
    
    high_risk_count = 0
    score_distribution = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}
    
    for anomaly in _anomalies.values():
        status_counts[anomaly.status] += 1
        type_counts[anomaly.type] += 1
        region_counts[anomaly.region] += 1
        alert_level_counts[anomaly.alert_level] += 1
        
        if anomaly.fraud_score >= 70:
            high_risk_count += 1
        
        if anomaly.fraud_score <= 20:
            score_distribution["0-20"] += 1
        elif anomaly.fraud_score <= 40:
            score_distribution["21-40"] += 1
        elif anomaly.fraud_score <= 60:
            score_distribution["41-60"] += 1
        elif anomaly.fraud_score <= 80:
            score_distribution["61-80"] += 1
        else:
            score_distribution["81-100"] += 1
    
    # Hub statistics
    spike_hubs = len([h for h in _registration_hubs.values() if h.spike_detected])
    high_risk_hubs = len([h for h in _registration_hubs.values() if h.risk_score >= 50])
    
    # Network statistics
    suspicious_clusters = len([
        c for c in get_network_clusters(suspicious_only=True)
    ])
    
    return {
        "total_anomalies": total_anomalies,
        "high_risk_cases": high_risk_count,
        "cases_pending": status_counts.get("pending", 0),
        "cases_resolved": status_counts.get("resolved", 0),
        "status_breakdown": dict(status_counts),
        "type_breakdown": dict(type_counts),
        "region_breakdown": dict(region_counts),
        "alert_level_breakdown": dict(alert_level_counts),
        "score_distribution": score_distribution,
        "hub_statistics": {
            "total_hubs": len(_registration_hubs),
            "spike_detected": spike_hubs,
            "high_risk": high_risk_hubs,
        },
        "network_statistics": {
            "total_nodes": len(_identity_network),
            "suspicious_clusters": suspicious_clusters,
        },
        "audit_log_entries": len(_audit_log),
        "last_updated": datetime.now().isoformat(),
    }
