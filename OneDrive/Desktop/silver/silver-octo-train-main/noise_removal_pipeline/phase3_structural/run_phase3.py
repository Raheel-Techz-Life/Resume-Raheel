"""
Phase 3: Structural Format Validation - Main Runner
Owner: @bhumika0115

Executes all structural validation checks.
"""

import pandas as pd
from pathlib import Path
import sys
from datetime import datetime

sys.path.append(str(Path(__file__).parent.parent))
from utils.logger import get_logger
from utils.data_loader import save_cleaned_data
from utils.config import PHASE1_OUTPUT, PHASE3_OUTPUT, REPORTS_DIR
from phase3_structural.validate_pincodes import validate_pincodes, clean_invalid_pincodes
from phase3_structural.validate_dates import validate_dates, apply_date_parsing
from phase3_structural.check_duplicates import detect_duplicates, remove_duplicates, analyze_missing_data

logger = get_logger(__name__)


def process_dataset(input_file, output_file, dataset_name):
    """Process a single dataset through structural validation"""
    logger.info(f"\n{'='*70}")
    logger.info(f"Processing {dataset_name}")
    logger.info(f"{'='*70}")
    
    # Load Phase 2 output
    df = pd.read_csv(input_file)
    initial_records = len(df)
    logger.info(f"[LOADING] Loaded: {initial_records:,} records")
    
    # 1. Validate pincodes
    df, invalid_pincodes, invalid_pin_df = validate_pincodes(df)
    if invalid_pincodes > 0:
        invalid_pin_file = REPORTS_DIR / f'{dataset_name.lower()}_invalid_pincodes.csv'
        invalid_pin_df.to_csv(invalid_pin_file, index=False)
        logger.info(f"   [SAVED] Invalid pincodes saved: {invalid_pin_file.name}")
    df = clean_invalid_pincodes(df, remove=True)
    
    # 2. Validate dates
    df, invalid_dates, invalid_date_df = validate_dates(df)
    if invalid_dates > 0:
        invalid_date_file = REPORTS_DIR / f'{dataset_name.lower()}_invalid_dates.csv'
        invalid_date_df.to_csv(invalid_date_file, index=False)
        logger.info(f"   [SAVED] Invalid dates saved: {invalid_date_file.name}")
    df = apply_date_parsing(df)
    
    # 3. Analyze missing data
    missing_summary = analyze_missing_data(df)
    missing_file = REPORTS_DIR / f'{dataset_name.lower()}_missing_data.csv'
    missing_summary.to_csv(missing_file, index=False)
    logger.info(f"   [SAVED] Missing data report: {missing_file.name}")
    
    # 4. Detect and remove duplicates
    dup_mask, dup_count, dup_df = detect_duplicates(df)
    if dup_count > 0:
        dup_file = REPORTS_DIR / f'{dataset_name.lower()}_duplicates.csv'
        dup_df.to_csv(dup_file, index=False)
        logger.info(f"   [SAVED] Duplicate records saved: {dup_file.name}")
        df = remove_duplicates(df)
    
    # Save cleaned data
    save_cleaned_data(df, output_file, dataset_name)
    
    return {
        'initial': initial_records,
        'final': len(df),
        'invalid_pincodes': invalid_pincodes,
        'invalid_dates': invalid_dates,
        'duplicates': dup_count,
        'removed': initial_records - len(df)
    }


def create_structural_log(stats, output_file):
    """Create detailed structural validation log"""
    output_file = Path(output_file)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("STRUCTURAL VALIDATION LOG\n")
        f.write("=" * 70 + "\n")
        f.write(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Owner: @bhumika0115\n\n")
        
        f.write("VALIDATION CHECKS PERFORMED\n")
        f.write("-" * 70 + "\n")
        f.write("• Pincode format validation (6-digit Indian format)\n")
        f.write("• Date format validation (DD-MM-YYYY)\n")
        f.write("• Missing data analysis (>5% threshold)\n")
        f.write("• Duplicate detection (date + state + district + pincode)\n\n")
        
        f.write("DATASET STATISTICS\n")
        f.write("-" * 70 + "\n")
        for name, stat in stats.items():
            f.write(f"\n{name}:\n")
            f.write(f"  Initial records: {stat['initial']:,}\n")
            f.write(f"  Final records: {stat['final']:,}\n")
            f.write(f"  Total removed: {stat['removed']:,} ({stat['removed']/stat['initial']*100:.2f}%)\n")
            f.write(f"    - Invalid pincodes: {stat['invalid_pincodes']:,}\n")
            f.write(f"    - Invalid dates: {stat['invalid_dates']:,}\n")
            f.write(f"    - Duplicates: {stat['duplicates']:,}\n")
    
    logger.info(f"[SAVED] Structural validation log saved: {output_file}")


def run_phase3():
    """Execute Phase 3: Structural Validation"""
    logger.info("=" * 80)
    logger.info("PHASE 3: STRUCTURAL FORMAT VALIDATION")
    logger.info("Owner: @bhumika0115")
    logger.info("=" * 80)
    
    stats = {}
    
    # Process Enrolment dataset
    stats['Enrolment'] = process_dataset(
        PHASE1_OUTPUT / 'cleaned_enrolment_geo.csv',
        PHASE3_OUTPUT / 'cleaned_enrolment_geo.csv',
        'Enrolment'
    )
    
    # Process Demographic dataset
    stats['Demographic'] = process_dataset(
        PHASE1_OUTPUT / 'cleaned_demographic_geo.csv',
        PHASE3_OUTPUT / 'cleaned_demographic_geo.csv',
        'Demographic'
    )
    
    # Process Biometric dataset
    stats['Biometric'] = process_dataset(
        PHASE1_OUTPUT / 'cleaned_biometric_geo.csv',
        PHASE3_OUTPUT / 'cleaned_biometric_geo.csv',
        'Biometric'
    )
    
    # Create structural validation log
    log_file = REPORTS_DIR / 'phase3_structural_validation_log.txt'
    create_structural_log(stats, log_file)
    
    logger.info("\n" + "=" * 80)
    logger.info("[SUCCESS] PHASE 3 COMPLETE - Handoff to Phase 4")
    logger.info(f"   Output folder: {PHASE3_OUTPUT}")
    logger.info("=" * 80)


if __name__ == '__main__':
    run_phase3()
