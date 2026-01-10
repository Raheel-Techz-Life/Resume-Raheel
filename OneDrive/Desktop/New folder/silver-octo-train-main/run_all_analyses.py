"""
Master Script - Run All Analyses for UIDAI Hackathon
This script runs all analysis steps in sequence
"""

import subprocess
import sys
import time
from datetime import datetime

def print_header(text):
    """Print formatted header"""
    print("\n" + "="*80)
    print(f"  {text}")
    print("="*80 + "\n")

def run_script(script_name, description):
    """Run a Python script and handle errors"""
    print(f"▶ Running: {script_name}")
    print(f"  {description}")
    print("-" * 80)
    
    start_time = time.time()
    
    try:
        result = subprocess.run(
            [sys.executable, script_name],
            capture_output=True,
            text=True,
            timeout=600  # 10 minute timeout
        )
        
        elapsed = time.time() - start_time
        
        if result.returncode == 0:
            print(f"✓ Completed in {elapsed:.1f} seconds")
            print(result.stdout)
            return True
        else:
            print(f"✗ Failed with error code {result.returncode}")
            print(result.stderr)
            return False
            
    except subprocess.TimeoutExpired:
        print(f"✗ Timed out after 10 minutes")
        return False
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False

def main():
    """Run all analysis scripts"""
    print_header("UIDAI DATA HACKATHON 2026 - MASTER ANALYSIS PIPELINE")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    total_start = time.time()
    results = {}
    
    # Script execution plan
    scripts = [
        ("data_exploration.py", "Basic Exploratory Data Analysis"),
        ("advanced_analytics.py", "Advanced Analytics (ML, Clustering, Forecasting)"),
        ("insights_generator.py", "Key Insights Report Generation"),
        ("interactive_dashboard.py", "Interactive Dashboard Creation")
    ]
    
    # Run each script
    for script_name, description in scripts:
        success = run_script(script_name, description)
        results[script_name] = success
        
        if not success:
            print(f"\n⚠️  Warning: {script_name} failed, but continuing with next steps...\n")
        
        time.sleep(1)  # Brief pause between scripts
    
    # Summary
    total_elapsed = time.time() - total_start
    
    print_header("ANALYSIS PIPELINE COMPLETE")
    
    print("📊 RESULTS SUMMARY:\n")
    for script_name, success in results.items():
        status = "✓ SUCCESS" if success else "✗ FAILED"
        print(f"  {status:12} | {script_name}")
    
    print(f"\n⏱  Total execution time: {total_elapsed:.1f} seconds ({total_elapsed/60:.1f} minutes)")
    
    # List generated files
    print("\n📁 GENERATED FILES:")
    print("\nStatic Visualizations (PNG):")
    print("  • temporal_trends.png")
    print("  • geographic_analysis.png")
    print("  • age_group_analysis.png")
    print("  • correlation_analysis.png")
    print("  • clustering_analysis.png")
    print("  • forecast_analysis.png")
    print("  • migration_analysis.png")
    print("  • update_comparison.png")
    
    print("\nInteractive Dashboards (HTML):")
    print("  • dashboard_summary.html")
    print("  • dashboard_temporal.html")
    print("  • dashboard_geographic.html")
    print("  • dashboard_comparison.html")
    print("  • dashboard_heatmap.html")
    print("  • dashboard_districts.html")
    print("  • dashboard_age_trends.html")
    
    print("\nReports & Data (TXT/JSON/CSV):")
    print("  • insights_report.txt")
    print("  • insights_report.json")
    print("  • anomalies_detected.csv")
    print("  • state_clusters.csv")
    
    print("\n" + "="*80)
    
    success_count = sum(1 for v in results.values() if v)
    total_count = len(results)
    
    if success_count == total_count:
        print("🎉 ALL ANALYSES COMPLETED SUCCESSFULLY!")
        print("\nYou're ready for the hackathon presentation!")
        print("\nNext steps:")
        print("  1. Review all generated visualizations")
        print("  2. Open HTML dashboards in your browser")
        print("  3. Read insights_report.txt for key findings")
        print("  4. Check PRESENTATION_SCRIPT.md for talk guidance")
        print("  5. Review QUICK_REFERENCE.md before presenting")
    else:
        print(f"⚠️  {total_count - success_count} script(s) failed. Review errors above.")
        print("   You may still have partial results you can use.")
    
    print("\n" + "="*80)
    print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80 + "\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Analysis interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n✗ Unexpected error: {str(e)}")
        sys.exit(1)
