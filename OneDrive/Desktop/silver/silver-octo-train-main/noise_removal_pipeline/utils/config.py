"""
Configuration Settings for Noise Removal Pipeline
UIDAI Hackathon 2026
"""

import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR.parent / 'data-set'
RAW_DATA_DIR = BASE_DIR.parent / 'data' / 'raw'
OUTPUT_DIR = BASE_DIR / 'outputs'

# Dataset paths
# Enrolment and Demographic are in data/raw, Biometric is in data-set
ENROLMENT_DATA = RAW_DATA_DIR / 'api_data_aadhar_enrolment' / 'api_data_aadhar_enrolment'
DEMOGRAPHIC_DATA = RAW_DATA_DIR / 'api_data_aadhar_demographic' / 'api_data_aadhar_demographic'
BIOMETRIC_DATA = DATA_DIR / 'api_data_aadhar_biometric' / 'api_data_aadhar_biometric'

# Output folders
PHASE1_OUTPUT = OUTPUT_DIR / 'phase1_complete'
PHASE2_OUTPUT = OUTPUT_DIR / 'phase2_complete'
PHASE3_OUTPUT = OUTPUT_DIR / 'phase3_complete'
FINAL_OUTPUT = OUTPUT_DIR / 'final_cleaned_data'
REPORTS_DIR = OUTPUT_DIR / 'reports'

# Create output directories
for directory in [PHASE1_OUTPUT, PHASE2_OUTPUT, PHASE3_OUTPUT, FINAL_OUTPUT, REPORTS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# Phase 1: Geographic Normalization
STATE_NORMALIZATION_MAP = {
    'Orissa': 'Odisha',
    'Pondicherry': 'Puducherry',
    'Uttaranchal': 'Uttarakhand',
}

DISTRICT_NORMALIZATION_MAP = {
    'Bangalore': 'Bengaluru',
    'Bombay': 'Mumbai',
    'Madras': 'Chennai',
    'Calcutta': 'Kolkata',
    'Banaras': 'Varanasi',
    'Poona': 'Pune',
}

EXPECTED_STATES = 36  # India has 28 states + 8 UTs

# Phase 2: Numerical Outlier Detection
ZSCORE_THRESHOLD = 3  # Standard deviations
IQR_MULTIPLIER = 1.5  # Interquartile range multiplier

# Phase 3: Structural Validation
PINCODE_PATTERN = r'^\d{6}$'  # Indian pincode format
DATE_FORMAT = '%d-%m-%Y'  # DD-MM-YYYY
MISSING_DATA_THRESHOLD = 5  # Percentage threshold for warnings
DUPLICATE_SUBSET = ['date', 'state', 'district', 'pincode']

# Phase 4: Quality Metrics
MIN_QUALITY_SCORE = 90  # Target quality score
MAX_DATA_LOSS = 10  # Maximum acceptable data loss percentage

# Logging
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
LOG_LEVEL = 'INFO'

# Team assignments
TEAM = {
    'phase1': 'Team Vidyut',
    'phase2': 'Team Vidyut',
    'phase3': 'Team Vidyut',
    'phase4': 'Team Vidyut'
}

# Column patterns
AGE_COLUMN_KEYWORDS = ['age', 'male', 'female', 'transgender']
