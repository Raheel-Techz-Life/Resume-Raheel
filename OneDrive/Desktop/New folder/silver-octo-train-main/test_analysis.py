"""
Test Analysis on Data Subset
Fast testing version using geographic subset
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

class QuickTestAnalysis:
    def __init__(self, use_subset=True, subset_dir='test-data'):
        self.use_subset = use_subset
        self.subset_dir = subset_dir
        
        if use_subset:
            print("Loading SUBSET data for quick testing...")
            self.enrolment_df = pd.read_csv(f'{subset_dir}/enrolment_subset.csv')
            self.demographic_df = pd.read_csv(f'{subset_dir}/demographic_subset.csv')
            self.biometric_df = pd.read_csv(f'{subset_dir}/biometric_subset.csv')
        else:
            print("Loading FULL dataset...")
            from glob import glob
            enrolment_files = glob('data-set/api_data_aadhar_enrolment/**/*.csv', recursive=True)
            self.enrolment_df = pd.concat([pd.read_csv(f) for f in enrolment_files], ignore_index=True)
            
            demographic_files = glob('data-set/api_data_aadhar_demographic/**/*.csv', recursive=True)
            self.demographic_df = pd.concat([pd.read_csv(f) for f in demographic_files], ignore_index=True)
            
            biometric_files = glob('data-set/api_data_aadhar_biometric/**/*.csv', recursive=True)
            self.biometric_df = pd.concat([pd.read_csv(f) for f in biometric_files], ignore_index=True)
        
        # Preprocess
        self._preprocess()
        
    def _preprocess(self):
        """Basic preprocessing"""
        for df in [self.enrolment_df, self.demographic_df, self.biometric_df]:
            df['date'] = pd.to_datetime(df['date'], format='%d-%m-%Y')
        
        self.enrolment_df['total_enrolments'] = (
            self.enrolment_df['age_0_5'] + 
            self.enrolment_df['age_5_17'] + 
            self.enrolment_df['age_18_greater']
        )
        
        self.demographic_df['total_updates'] = (
            self.demographic_df['demo_age_5_17'] + 
            self.demographic_df['demo_age_17_']
        )
        
        self.biometric_df['total_updates'] = (
            self.biometric_df['bio_age_5_17'] + 
            self.biometric_df['bio_age_17_']
        )
        
    def quick_summary(self):
        """Quick dataset summary"""
        print("\n" + "="*80)
        print("QUICK DATA SUMMARY")
        print("="*80)
        
        print(f"\nEnrolment: {len(self.enrolment_df):,} records")
        print(f"  States: {self.enrolment_df['state'].nunique()}")
        print(f"  Districts: {self.enrolment_df['district'].nunique()}")
        print(f"  Date range: {self.enrolment_df['date'].min()} to {self.enrolment_df['date'].max()}")
        
        print(f"\nDemographic: {len(self.demographic_df):,} records")
        print(f"  States: {self.demographic_df['state'].nunique()}")
        
        print(f"\nBiometric: {len(self.biometric_df):,} records")
        print(f"  States: {self.biometric_df['state'].nunique()}")
        
        print(f"\nStates in dataset:")
        for state in sorted(self.enrolment_df['state'].unique()):
            districts = self.enrolment_df[self.enrolment_df['state'] == state]['district'].nunique()
            enrol = self.enrolment_df[self.enrolment_df['state'] == state]['total_enrolments'].sum()
            print(f"  {state}: {districts} districts, {enrol:,} enrolments")
    
    def test_geographic_analysis(self):
        """Test geographic pattern detection"""
        print("\n" + "="*80)
        print("GEOGRAPHIC ANALYSIS TEST")
        print("="*80)
        
        state_enrol = self.enrolment_df.groupby('state')['total_enrolments'].sum().sort_values(ascending=False)
        
        print("\nState Rankings:")
        for i, (state, count) in enumerate(state_enrol.items(), 1):
            print(f"  {i}. {state}: {count:,} enrolments")
        
        # District analysis
        district_enrol = self.enrolment_df.groupby(['state', 'district']).agg({
            'total_enrolments': 'sum'
        }).reset_index()
        
        print(f"\nDistrict-level insights:")
        print(f"  Total districts: {len(district_enrol)}")
        print(f"  Top district: {district_enrol.nlargest(1, 'total_enrolments').iloc[0]['district']}")
        print(f"  Bottom district: {district_enrol.nsmallest(1, 'total_enrolments').iloc[0]['district']}")
    
    def test_temporal_analysis(self):
        """Test temporal pattern detection"""
        print("\n" + "="*80)
        print("TEMPORAL ANALYSIS TEST")
        print("="*80)
        
        daily = self.enrolment_df.groupby('date')['total_enrolments'].sum()
        
        print(f"\nTemporal stats:")
        print(f"  Total days: {len(daily)}")
        print(f"  Avg daily enrolments: {daily.mean():,.0f}")
        print(f"  Peak day: {daily.idxmax()} ({daily.max():,} enrolments)")
        print(f"  Lowest day: {daily.idxmin()} ({daily.min():,} enrolments)")
        
        # Month patterns
        self.enrolment_df['month'] = self.enrolment_df['date'].dt.month
        monthly = self.enrolment_df.groupby('month')['total_enrolments'].sum()
        
        print(f"\nMonthly patterns:")
        print(f"  Peak month: {monthly.idxmax()} ({monthly.max():,} enrolments)")
        print(f"  Lowest month: {monthly.idxmin()} ({monthly.min():,} enrolments)")
    
    def test_meeting_observations(self):
        """Test meeting observation analyses on subset"""
        print("\n" + "="*80)
        print("MEETING OBSERVATIONS TEST")
        print("="*80)
        
        # Senior citizens analysis
        print("\n1. SENIOR CITIZENS ANALYSIS:")
        bio_age_17 = self.biometric_df.groupby('state')['bio_age_17_'].sum().sort_values(ascending=False)
        print(f"  States with high senior updates:")
        for state, count in bio_age_17.head(3).items():
            print(f"    {state}: {count:,}")
        
        # Rural accessibility
        print("\n2. RURAL ACCESSIBILITY:")
        district_enrol = self.enrolment_df.groupby(['state', 'district']).agg({
            'total_enrolments': 'sum'
        }).reset_index()
        
        state_avg = self.enrolment_df.groupby('state')['total_enrolments'].mean()
        district_enrol['state_avg'] = district_enrol['state'].map(state_avg)
        low_districts = district_enrol[district_enrol['total_enrolments'] < district_enrol['state_avg'] * 0.3]
        
        print(f"  Low-enrolment districts found: {len(low_districts)}")
        if len(low_districts) > 0:
            print(f"  Bottom 3:")
            for _, row in low_districts.nsmallest(3, 'total_enrolments').iterrows():
                print(f"    {row['district']}, {row['state']}: {row['total_enrolments']:,}")
        
        # Anomaly detection
        print("\n3. ANOMALY DETECTION:")
        bio_daily = self.biometric_df.groupby(['state', 'date'])['total_updates'].sum()
        bio_mean = bio_daily.mean()
        bio_std = bio_daily.std()
        anomalies = bio_daily[bio_daily > bio_mean + 3 * bio_std]
        
        print(f"  Suspicious events (Z > 3): {len(anomalies)}")
        if len(anomalies) > 0:
            print(f"  Top anomalies:")
            for idx, val in anomalies.nlargest(3).items():
                print(f"    {idx}: {val:,} updates")
    
    def run_all_tests(self):
        """Run all quick tests"""
        self.quick_summary()
        self.test_geographic_analysis()
        self.test_temporal_analysis()
        self.test_meeting_observations()
        
        print("\n" + "="*80)
        print("✓ ALL TESTS COMPLETED")
        print("="*80)
        print("\nReady to run on full dataset!" if self.use_subset else "Full analysis complete!")


if __name__ == "__main__":
    print("="*80)
    print("QUICK TEST ANALYSIS")
    print("="*80)
    print("\nThis will run fast tests on the subset data.")
    print("Make sure you've created a subset first using: python create_test_subset.py")
    
    input("\nPress Enter to continue...")
    
    analyzer = QuickTestAnalysis(use_subset=True)
    analyzer.run_all_tests()
