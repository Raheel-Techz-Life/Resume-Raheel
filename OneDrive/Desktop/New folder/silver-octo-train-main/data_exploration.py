"""
UIDAI Data Hackathon 2026 - Data Exploration and Analysis
Problem: Unlocking Societal Trends in Aadhaar Enrolment and Updates
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from glob import glob
import warnings
warnings.filterwarnings('ignore')

# Set style for better visualizations
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (14, 8)

class AadhaarDataAnalyzer:
    def __init__(self, data_dir='data-set'):
        self.data_dir = data_dir
        self.enrolment_df = None
        self.demographic_df = None
        self.biometric_df = None
        
    def load_data(self):
        """Load all CSV files for each category"""
        print("Loading data...")
        
        # Load Enrolment Data
        enrolment_files = glob(f'{self.data_dir}/api_data_aadhar_enrolment/**/*.csv', recursive=True)
        self.enrolment_df = pd.concat([pd.read_csv(f) for f in enrolment_files], ignore_index=True)
        print(f"Enrolment data loaded: {len(self.enrolment_df):,} records")
        
        # Load Demographic Update Data
        demographic_files = glob(f'{self.data_dir}/api_data_aadhar_demographic/**/*.csv', recursive=True)
        self.demographic_df = pd.concat([pd.read_csv(f) for f in demographic_files], ignore_index=True)
        print(f"Demographic data loaded: {len(self.demographic_df):,} records")
        
        # Load Biometric Update Data
        biometric_files = glob(f'{self.data_dir}/api_data_aadhar_biometric/**/*.csv', recursive=True)
        self.biometric_df = pd.concat([pd.read_csv(f) for f in biometric_files], ignore_index=True)
        print(f"Biometric data loaded: {len(self.biometric_df):,} records")
        
    def preprocess_data(self):
        """Clean and preprocess the data"""
        print("\nPreprocessing data...")
        
        # Convert date columns to datetime
        for df in [self.enrolment_df, self.demographic_df, self.biometric_df]:
            df['date'] = pd.to_datetime(df['date'], format='%d-%m-%Y')
            df['year'] = df['date'].dt.year
            df['month'] = df['date'].dt.month
            df['day_of_week'] = df['date'].dt.day_name()
            df['week_of_year'] = df['date'].dt.isocalendar().week
        
        # Add total counts
        if 'age_0_5' in self.enrolment_df.columns:
            self.enrolment_df['total_enrolments'] = (
                self.enrolment_df['age_0_5'] + 
                self.enrolment_df['age_5_17'] + 
                self.enrolment_df['age_18_greater']
            )
        
        # Fix column names for demographic and biometric (they appear truncated)
        # Assuming demo_age_17_ means 17+ and bio_age_17_ means 17+
        if 'demo_age_5_17' in self.demographic_df.columns:
            self.demographic_df['total_updates'] = (
                self.demographic_df['demo_age_5_17'] + 
                self.demographic_df['demo_age_17_']
            )
        
        if 'bio_age_5_17' in self.biometric_df.columns:
            self.biometric_df['total_updates'] = (
                self.biometric_df['bio_age_5_17'] + 
                self.biometric_df['bio_age_17_']
            )
        
        print("Preprocessing complete!")
        
    def basic_statistics(self):
        """Generate basic statistics for all datasets"""
        print("\n" + "="*80)
        print("BASIC STATISTICS")
        print("="*80)
        
        print("\n1. ENROLMENT DATA")
        print(f"   Date range: {self.enrolment_df['date'].min()} to {self.enrolment_df['date'].max()}")
        print(f"   Total records: {len(self.enrolment_df):,}")
        print(f"   Unique states: {self.enrolment_df['state'].nunique()}")
        print(f"   Unique districts: {self.enrolment_df['district'].nunique()}")
        print(f"   Unique pincodes: {self.enrolment_df['pincode'].nunique()}")
        if 'total_enrolments' in self.enrolment_df.columns:
            print(f"   Total enrolments: {self.enrolment_df['total_enrolments'].sum():,}")
        
        print("\n2. DEMOGRAPHIC UPDATE DATA")
        print(f"   Date range: {self.demographic_df['date'].min()} to {self.demographic_df['date'].max()}")
        print(f"   Total records: {len(self.demographic_df):,}")
        print(f"   Unique states: {self.demographic_df['state'].nunique()}")
        print(f"   Unique districts: {self.demographic_df['district'].nunique()}")
        if 'total_updates' in self.demographic_df.columns:
            print(f"   Total updates: {self.demographic_df['total_updates'].sum():,}")
        
        print("\n3. BIOMETRIC UPDATE DATA")
        print(f"   Date range: {self.biometric_df['date'].min()} to {self.biometric_df['date'].max()}")
        print(f"   Total records: {len(self.biometric_df):,}")
        print(f"   Unique states: {self.biometric_df['state'].nunique()}")
        print(f"   Unique districts: {self.biometric_df['district'].nunique()}")
        if 'total_updates' in self.biometric_df.columns:
            print(f"   Total updates: {self.biometric_df['total_updates'].sum():,}")
        
    def temporal_analysis(self):
        """Analyze temporal patterns"""
        print("\n" + "="*80)
        print("TEMPORAL ANALYSIS")
        print("="*80)
        
        # Daily trends
        enrolment_daily = self.enrolment_df.groupby('date')['total_enrolments'].sum()
        demographic_daily = self.demographic_df.groupby('date')['total_updates'].sum()
        biometric_daily = self.biometric_df.groupby('date')['total_updates'].sum()
        
        fig, axes = plt.subplots(3, 1, figsize=(15, 12))
        
        enrolment_daily.plot(ax=axes[0], title='Daily Enrolment Trends', color='blue')
        axes[0].set_ylabel('Total Enrolments')
        
        demographic_daily.plot(ax=axes[1], title='Daily Demographic Update Trends', color='green')
        axes[1].set_ylabel('Total Updates')
        
        biometric_daily.plot(ax=axes[2], title='Daily Biometric Update Trends', color='orange')
        axes[2].set_ylabel('Total Updates')
        
        plt.tight_layout()
        plt.savefig('temporal_trends.png', dpi=300, bbox_inches='tight')
        print("\n✓ Saved: temporal_trends.png")
        
        # Day of week analysis
        dow_enrolment = self.enrolment_df.groupby('day_of_week')['total_enrolments'].sum()
        dow_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        dow_enrolment = dow_enrolment.reindex(dow_order)
        
        print("\nDay of Week Patterns (Enrolment):")
        print(dow_enrolment)
        
    def geographic_analysis(self):
        """Analyze geographic patterns"""
        print("\n" + "="*80)
        print("GEOGRAPHIC ANALYSIS")
        print("="*80)
        
        # Top states by enrolment
        state_enrolment = self.enrolment_df.groupby('state')['total_enrolments'].sum().sort_values(ascending=False)
        
        print("\nTop 10 States by Enrolment:")
        print(state_enrolment.head(10))
        
        # Visualization
        fig, axes = plt.subplots(1, 3, figsize=(20, 6))
        
        state_enrolment.head(10).plot(kind='barh', ax=axes[0], color='skyblue')
        axes[0].set_title('Top 10 States - Enrolment')
        axes[0].set_xlabel('Total Enrolments')
        
        state_demo = self.demographic_df.groupby('state')['total_updates'].sum().sort_values(ascending=False)
        state_demo.head(10).plot(kind='barh', ax=axes[1], color='lightgreen')
        axes[1].set_title('Top 10 States - Demographic Updates')
        axes[1].set_xlabel('Total Updates')
        
        state_bio = self.biometric_df.groupby('state')['total_updates'].sum().sort_values(ascending=False)
        state_bio.head(10).plot(kind='barh', ax=axes[2], color='lightcoral')
        axes[2].set_title('Top 10 States - Biometric Updates')
        axes[2].set_xlabel('Total Updates')
        
        plt.tight_layout()
        plt.savefig('geographic_analysis.png', dpi=300, bbox_inches='tight')
        print("\n✓ Saved: geographic_analysis.png")
        
    def age_group_analysis(self):
        """Analyze age group patterns"""
        print("\n" + "="*80)
        print("AGE GROUP ANALYSIS")
        print("="*80)
        
        # Enrolment by age group
        age_totals = {
            'Age 0-5': self.enrolment_df['age_0_5'].sum(),
            'Age 5-17': self.enrolment_df['age_5_17'].sum(),
            'Age 18+': self.enrolment_df['age_18_greater'].sum()
        }
        
        print("\nEnrolment by Age Group:")
        for age, count in age_totals.items():
            print(f"  {age}: {count:,} ({count/sum(age_totals.values())*100:.1f}%)")
        
        # Visualization
        fig, axes = plt.subplots(1, 2, figsize=(14, 6))
        
        # Pie chart
        axes[0].pie(age_totals.values(), labels=age_totals.keys(), autopct='%1.1f%%', startangle=90)
        axes[0].set_title('Enrolment Distribution by Age Group')
        
        # Comparison of updates by age
        demo_ages = {
            'Age 5-17': self.demographic_df['demo_age_5_17'].sum(),
            'Age 17+': self.demographic_df['demo_age_17_'].sum()
        }
        bio_ages = {
            'Age 5-17': self.biometric_df['bio_age_5_17'].sum(),
            'Age 17+': self.biometric_df['bio_age_17_'].sum()
        }
        
        x = np.arange(2)
        width = 0.35
        axes[1].bar(x - width/2, list(demo_ages.values()), width, label='Demographic', color='green', alpha=0.7)
        axes[1].bar(x + width/2, list(bio_ages.values()), width, label='Biometric', color='orange', alpha=0.7)
        axes[1].set_xlabel('Age Group')
        axes[1].set_ylabel('Total Updates')
        axes[1].set_title('Updates by Age Group and Type')
        axes[1].set_xticks(x)
        axes[1].set_xticklabels(['Age 5-17', 'Age 17+'])
        axes[1].legend()
        
        plt.tight_layout()
        plt.savefig('age_group_analysis.png', dpi=300, bbox_inches='tight')
        print("\n✓ Saved: age_group_analysis.png")
        
    def correlation_analysis(self):
        """Analyze correlations between different metrics"""
        print("\n" + "="*80)
        print("CORRELATION ANALYSIS")
        print("="*80)
        
        # Merge data by state and date for correlation
        enrol_state = self.enrolment_df.groupby(['state', 'date'])['total_enrolments'].sum().reset_index()
        demo_state = self.demographic_df.groupby(['state', 'date'])['total_updates'].sum().reset_index()
        bio_state = self.biometric_df.groupby(['state', 'date'])['total_updates'].sum().reset_index()
        
        merged = enrol_state.merge(demo_state, on=['state', 'date'], how='outer', suffixes=('_enrol', '_demo'))
        merged = merged.merge(bio_state, on=['state', 'date'], how='outer')
        merged.columns = ['state', 'date', 'enrolments', 'demographic_updates', 'biometric_updates']
        merged = merged.fillna(0)
        
        correlation = merged[['enrolments', 'demographic_updates', 'biometric_updates']].corr()
        print("\nCorrelation Matrix:")
        print(correlation)
        
        plt.figure(figsize=(8, 6))
        sns.heatmap(correlation, annot=True, cmap='coolwarm', center=0, 
                    square=True, linewidths=1, cbar_kws={"shrink": 0.8})
        plt.title('Correlation between Enrolments and Updates')
        plt.tight_layout()
        plt.savefig('correlation_analysis.png', dpi=300, bbox_inches='tight')
        print("\n✓ Saved: correlation_analysis.png")
        
    def run_full_analysis(self):
        """Run complete analysis pipeline"""
        self.load_data()
        self.preprocess_data()
        self.basic_statistics()
        self.temporal_analysis()
        self.geographic_analysis()
        self.age_group_analysis()
        self.correlation_analysis()
        
        print("\n" + "="*80)
        print("ANALYSIS COMPLETE!")
        print("="*80)
        print("\nGenerated files:")
        print("  - temporal_trends.png")
        print("  - geographic_analysis.png")
        print("  - age_group_analysis.png")
        print("  - correlation_analysis.png")


if __name__ == "__main__":
    analyzer = AadhaarDataAnalyzer()
    analyzer.run_full_analysis()
