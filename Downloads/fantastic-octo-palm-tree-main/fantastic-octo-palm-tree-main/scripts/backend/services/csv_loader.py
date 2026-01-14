"""
CSV Data Loader for AFIF and PROF frameworks.
Place your CSV files in the 'data' folder and call the load functions.
"""

import csv
import os
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime

# Get the data directory path
DATA_DIR = Path(__file__).parent.parent / "data"


def ensure_data_dir():
    """Create data directory if it doesn't exist"""
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def load_csv(filename: str) -> List[Dict[str, Any]]:
    """
    Load CSV file and return list of dictionaries.
    
    Args:
        filename: Name of the CSV file (with or without .csv extension)
    
    Returns:
        List of dictionaries with column headers as keys
    """
    if not filename.endswith('.csv'):
        filename = f"{filename}.csv"
    
    filepath = DATA_DIR / filename
    
    if not filepath.exists():
        print(f"CSV file not found: {filepath}")
        return []
    
    data = []
    try:
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Convert numeric fields
                cleaned_row = {}
                for key, value in row.items():
                    if value is None or value == '':
                        cleaned_row[key] = None
                    elif value.replace('.', '', 1).replace('-', '', 1).isdigit():
                        # Try to convert to int or float
                        try:
                            cleaned_row[key] = int(value) if '.' not in value else float(value)
                        except ValueError:
                            cleaned_row[key] = value
                    elif value.lower() in ('true', 'false'):
                        cleaned_row[key] = value.lower() == 'true'
                    else:
                        cleaned_row[key] = value
                data.append(cleaned_row)
        print(f"Loaded {len(data)} records from {filename}")
    except Exception as e:
        print(f"Error loading {filename}: {e}")
    
    return data


def save_csv(filename: str, data: List[Dict[str, Any]], fieldnames: Optional[List[str]] = None):
    """
    Save list of dictionaries to CSV file.
    
    Args:
        filename: Name of the CSV file
        data: List of dictionaries to save
        fieldnames: Optional list of column names (auto-detected if not provided)
    """
    if not filename.endswith('.csv'):
        filename = f"{filename}.csv"
    
    ensure_data_dir()
    filepath = DATA_DIR / filename
    
    if not data:
        print(f"No data to save to {filename}")
        return
    
    if fieldnames is None:
        fieldnames = list(data[0].keys())
    
    try:
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
        print(f"Saved {len(data)} records to {filename}")
    except Exception as e:
        print(f"Error saving {filename}: {e}")


# =============================================================================
# AFIF CSV Loaders
# =============================================================================

def load_registration_hubs() -> List[Dict[str, Any]]:
    """
    Load registration hubs from CSV.
    
    Expected columns:
    - hub_id, name, location, state, ip_addresses (comma-separated),
    - daily_registrations, weekly_registrations, avg_registrations_per_day,
    - spike_detected, spike_factor, risk_score, last_activity, flagged_registrations
    """
    data = load_csv("registration_hubs.csv")
    for row in data:
        # Parse comma-separated IP addresses
        if 'ip_addresses' in row and isinstance(row['ip_addresses'], str):
            row['ip_addresses'] = [ip.strip() for ip in row['ip_addresses'].split(',') if ip.strip()]
        elif 'ip_addresses' not in row:
            row['ip_addresses'] = []
    return data


def load_anomalies() -> List[Dict[str, Any]]:
    """
    Load anomalies from CSV.
    
    Expected columns:
    - id, type, uid, region, fraud_score, status, detected_at,
    - alert_level, hub_id, network_cluster, details (JSON string)
    """
    import json
    data = load_csv("anomalies.csv")
    for row in data:
        # Parse JSON details
        if 'details' in row and isinstance(row['details'], str):
            try:
                row['details'] = json.loads(row['details'])
            except:
                row['details'] = {}
        elif 'details' not in row:
            row['details'] = {}
    return data


def load_cases() -> List[Dict[str, Any]]:
    """
    Load investigation cases from CSV.
    
    Expected columns:
    - case_id, anomaly_ids (comma-separated), status, priority, assigned_to,
    - created_at, updated_at, notes
    """
    data = load_csv("cases.csv")
    for row in data:
        if 'anomaly_ids' in row and isinstance(row['anomaly_ids'], str):
            row['anomaly_ids'] = [aid.strip() for aid in row['anomaly_ids'].split(',') if aid.strip()]
        elif 'anomaly_ids' not in row:
            row['anomaly_ids'] = []
    return data


def load_network_nodes() -> List[Dict[str, Any]]:
    """
    Load identity network nodes from CSV.
    
    Expected columns:
    - uid, connections (comma-separated), cluster_id, centrality_score,
    - risk_propagation, is_suspicious
    """
    data = load_csv("network_nodes.csv")
    for row in data:
        if 'connections' in row and isinstance(row['connections'], str):
            row['connections'] = [c.strip() for c in row['connections'].split(',') if c.strip()]
        elif 'connections' not in row:
            row['connections'] = []
    return data


# =============================================================================
# PROF CSV Loaders
# =============================================================================

def load_districts() -> List[Dict[str, Any]]:
    """
    Load districts from CSV.
    
    Expected columns:
    - district_id, name, state, population, migration_inflow, migration_outflow,
    - pressure_index, pressure_level, resource_score, infrastructure_gap, last_updated
    """
    return load_csv("districts.csv")


def load_demand_forecasts() -> List[Dict[str, Any]]:
    """
    Load demand forecasts from CSV.
    
    Expected columns:
    - forecast_id, district_id, category, current_demand, predicted_demand,
    - forecast_period, confidence, growth_rate, factors (comma-separated), created_at
    """
    data = load_csv("demand_forecasts.csv")
    for row in data:
        if 'factors' in row and isinstance(row['factors'], str):
            row['factors'] = [f.strip() for f in row['factors'].split(',') if f.strip()]
        elif 'factors' not in row:
            row['factors'] = []
    return data


def load_recommendations() -> List[Dict[str, Any]]:
    """
    Load resource recommendations from CSV.
    
    Expected columns:
    - recommendation_id, district_id, resource_type, quantity, priority,
    - justification, estimated_impact, estimated_cost, status, created_at
    """
    return load_csv("recommendations.csv")


def load_policy_actions() -> List[Dict[str, Any]]:
    """
    Load policy actions from CSV.
    
    Expected columns:
    - action_id, title, description, district_ids (comma-separated),
    - resource_type, budget_allocated, status, start_date, end_date,
    - kpis (JSON), outcomes (JSON), effectiveness_score, created_at
    """
    import json
    data = load_csv("policy_actions.csv")
    for row in data:
        if 'district_ids' in row and isinstance(row['district_ids'], str):
            row['district_ids'] = [d.strip() for d in row['district_ids'].split(',') if d.strip()]
        elif 'district_ids' not in row:
            row['district_ids'] = []
        
        for field in ['kpis', 'outcomes']:
            if field in row and isinstance(row[field], str):
                try:
                    row[field] = json.loads(row[field])
                except:
                    row[field] = {}
            elif field not in row:
                row[field] = {}
    return data


# =============================================================================
# Helper to generate sample CSV templates
# =============================================================================

def generate_sample_templates():
    """Generate empty CSV templates with correct headers"""
    ensure_data_dir()
    
    templates = {
        "registration_hubs.csv": [
            "hub_id", "name", "location", "state", "ip_addresses",
            "daily_registrations", "weekly_registrations", "avg_registrations_per_day",
            "spike_detected", "spike_factor", "risk_score", "last_activity", "flagged_registrations"
        ],
        "anomalies.csv": [
            "id", "type", "uid", "region", "fraud_score", "status", "detected_at",
            "alert_level", "hub_id", "network_cluster", "details"
        ],
        "cases.csv": [
            "case_id", "anomaly_ids", "status", "priority", "assigned_to",
            "created_at", "updated_at", "notes"
        ],
        "network_nodes.csv": [
            "uid", "connections", "cluster_id", "centrality_score",
            "risk_propagation", "is_suspicious"
        ],
        "districts.csv": [
            "district_id", "name", "state", "population", "migration_inflow", "migration_outflow",
            "pressure_index", "pressure_level", "resource_score", "infrastructure_gap", "last_updated"
        ],
        "demand_forecasts.csv": [
            "forecast_id", "district_id", "category", "current_demand", "predicted_demand",
            "forecast_period", "confidence", "growth_rate", "factors", "created_at"
        ],
        "recommendations.csv": [
            "recommendation_id", "district_id", "resource_type", "quantity", "priority",
            "justification", "estimated_impact", "estimated_cost", "status", "created_at"
        ],
        "policy_actions.csv": [
            "action_id", "title", "description", "district_ids", "resource_type",
            "budget_allocated", "status", "start_date", "end_date",
            "kpis", "outcomes", "effectiveness_score", "created_at"
        ]
    }
    
    for filename, headers in templates.items():
        filepath = DATA_DIR / filename
        if not filepath.exists():
            with open(filepath, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(headers)
            print(f"Created template: {filename}")
        else:
            print(f"Template already exists: {filename}")


if __name__ == "__main__":
    print("Generating CSV templates...")
    generate_sample_templates()
    print(f"\nCSV templates created in: {DATA_DIR}")
    print("\nExpected CSV files for AFIF:")
    print("  - registration_hubs.csv")
    print("  - anomalies.csv") 
    print("  - cases.csv")
    print("  - network_nodes.csv")
    print("\nExpected CSV files for PROF:")
    print("  - districts.csv")
    print("  - demand_forecasts.csv")
    print("  - recommendations.csv")
    print("  - policy_actions.csv")
