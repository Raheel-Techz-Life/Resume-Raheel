"""
Create Test Subset - Filter Aadhaar Data by Geographic Radius
Reduces dataset size for faster testing and focused analysis
"""

import pandas as pd
from glob import glob
import os

class DataSubsetCreator:
    def __init__(self, output_dir='test-data'):
        self.output_dir = output_dir
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
    
    def filter_by_states(self, states_list):
        """
        Filter data by specific states
        
        Args:
            states_list: List of state names (e.g., ['Goa', 'Delhi', 'Sikkim'])
        """
        print(f"\n{'='*80}")
        print(f"CREATING TEST SUBSET - States: {', '.join(states_list)}")
        print(f"{'='*80}\n")
        
        # Load and filter enrolment data
        print("Processing Enrolment Data...")
        enrolment_files = glob('data-set/api_data_aadhar_enrolment/**/*.csv', recursive=True)
        enrolment_df = pd.concat([pd.read_csv(f) for f in enrolment_files], ignore_index=True)
        enrolment_subset = enrolment_df[enrolment_df['state'].isin(states_list)]
        
        output_file = f"{self.output_dir}/enrolment_subset.csv"
        enrolment_subset.to_csv(output_file, index=False)
        print(f"✓ Saved: {output_file}")
        print(f"  Original: {len(enrolment_df):,} records → Subset: {len(enrolment_subset):,} records")
        
        # Load and filter demographic data
        print("\nProcessing Demographic Data...")
        demographic_files = glob('data-set/api_data_aadhar_demographic/**/*.csv', recursive=True)
        demographic_df = pd.concat([pd.read_csv(f) for f in demographic_files], ignore_index=True)
        demographic_subset = demographic_df[demographic_df['state'].isin(states_list)]
        
        output_file = f"{self.output_dir}/demographic_subset.csv"
        demographic_subset.to_csv(output_file, index=False)
        print(f"✓ Saved: {output_file}")
        print(f"  Original: {len(demographic_df):,} records → Subset: {len(demographic_subset):,} records")
        
        # Load and filter biometric data
        print("\nProcessing Biometric Data...")
        biometric_files = glob('data-set/api_data_aadhar_biometric/**/*.csv', recursive=True)
        biometric_df = pd.concat([pd.read_csv(f) for f in biometric_files], ignore_index=True)
        biometric_subset = biometric_df[biometric_df['state'].isin(states_list)]
        
        output_file = f"{self.output_dir}/biometric_subset.csv"
        biometric_subset.to_csv(output_file, index=False)
        print(f"✓ Saved: {output_file}")
        print(f"  Original: {len(biometric_df):,} records → Subset: {len(biometric_subset):,} records")
        
        # Summary
        total_original = len(enrolment_df) + len(demographic_df) + len(biometric_df)
        total_subset = len(enrolment_subset) + len(demographic_subset) + len(biometric_subset)
        reduction = (1 - total_subset/total_original) * 100
        
        print(f"\n{'='*80}")
        print(f"SUMMARY")
        print(f"{'='*80}")
        print(f"States included: {', '.join(states_list)}")
        print(f"Total records: {total_original:,} → {total_subset:,}")
        print(f"Size reduction: {reduction:.1f}%")
        print(f"\nDistricts included:")
        for state in states_list:
            districts = enrolment_subset[enrolment_subset['state'] == state]['district'].unique()
            print(f"  {state}: {len(districts)} districts - {', '.join(sorted(districts)[:5])}{'...' if len(districts) > 5 else ''}")
        
        return enrolment_subset, demographic_subset, biometric_subset
    
    def filter_by_districts(self, state, districts_list):
        """
        Filter data by specific districts within a state
        
        Args:
            state: State name (e.g., 'Maharashtra')
            districts_list: List of district names
        """
        print(f"\n{'='*80}")
        print(f"CREATING TEST SUBSET - {state}: {', '.join(districts_list)}")
        print(f"{'='*80}\n")
        
        # Load and filter enrolment data
        print("Processing Enrolment Data...")
        enrolment_files = glob('data-set/api_data_aadhar_enrolment/**/*.csv', recursive=True)
        enrolment_df = pd.concat([pd.read_csv(f) for f in enrolment_files], ignore_index=True)
        enrolment_subset = enrolment_df[
            (enrolment_df['state'] == state) & 
            (enrolment_df['district'].isin(districts_list))
        ]
        
        output_file = f"{self.output_dir}/enrolment_subset.csv"
        enrolment_subset.to_csv(output_file, index=False)
        print(f"✓ Saved: {output_file} ({len(enrolment_subset):,} records)")
        
        # Load and filter demographic data
        print("Processing Demographic Data...")
        demographic_files = glob('data-set/api_data_aadhar_demographic/**/*.csv', recursive=True)
        demographic_df = pd.concat([pd.read_csv(f) for f in demographic_files], ignore_index=True)
        demographic_subset = demographic_df[
            (demographic_df['state'] == state) & 
            (demographic_df['district'].isin(districts_list))
        ]
        
        output_file = f"{self.output_dir}/demographic_subset.csv"
        demographic_subset.to_csv(output_file, index=False)
        print(f"✓ Saved: {output_file} ({len(demographic_subset):,} records)")
        
        # Load and filter biometric data
        print("Processing Biometric Data...")
        biometric_files = glob('data-set/api_data_aadhar_biometric/**/*.csv', recursive=True)
        biometric_df = pd.concat([pd.read_csv(f) for f in biometric_files], ignore_index=True)
        biometric_subset = biometric_df[
            (biometric_df['state'] == state) & 
            (biometric_df['district'].isin(districts_list))
        ]
        
        output_file = f"{self.output_dir}/biometric_subset.csv"
        biometric_subset.to_csv(output_file, index=False)
        print(f"✓ Saved: {output_file} ({len(biometric_subset):,} records)")
        
        total_subset = len(enrolment_subset) + len(demographic_subset) + len(biometric_subset)
        print(f"\n✓ Total subset records: {total_subset:,}")
        
        return enrolment_subset, demographic_subset, biometric_subset
    
    def create_sample(self, sample_size_percent=10):
        """
        Create random sample of full dataset
        
        Args:
            sample_size_percent: Percentage of data to sample (1-100)
        """
        print(f"\n{'='*80}")
        print(f"CREATING RANDOM SAMPLE - {sample_size_percent}% of full dataset")
        print(f"{'='*80}\n")
        
        # Enrolment
        print("Sampling Enrolment Data...")
        enrolment_files = glob('data-set/api_data_aadhar_enrolment/**/*.csv', recursive=True)
        enrolment_df = pd.concat([pd.read_csv(f) for f in enrolment_files], ignore_index=True)
        enrolment_sample = enrolment_df.sample(frac=sample_size_percent/100, random_state=42)
        
        output_file = f"{self.output_dir}/enrolment_sample_{sample_size_percent}pct.csv"
        enrolment_sample.to_csv(output_file, index=False)
        print(f"✓ Saved: {output_file} ({len(enrolment_sample):,} records)")
        
        # Demographic
        print("Sampling Demographic Data...")
        demographic_files = glob('data-set/api_data_aadhar_demographic/**/*.csv', recursive=True)
        demographic_df = pd.concat([pd.read_csv(f) for f in demographic_files], ignore_index=True)
        demographic_sample = demographic_df.sample(frac=sample_size_percent/100, random_state=42)
        
        output_file = f"{self.output_dir}/demographic_sample_{sample_size_percent}pct.csv"
        demographic_sample.to_csv(output_file, index=False)
        print(f"✓ Saved: {output_file} ({len(demographic_sample):,} records)")
        
        # Biometric
        print("Sampling Biometric Data...")
        biometric_files = glob('data-set/api_data_aadhar_biometric/**/*.csv', recursive=True)
        biometric_df = pd.concat([pd.read_csv(f) for f in biometric_files], ignore_index=True)
        biometric_sample = biometric_df.sample(frac=sample_size_percent/100, random_state=42)
        
        output_file = f"{self.output_dir}/biometric_sample_{sample_size_percent}pct.csv"
        biometric_sample.to_csv(output_file, index=False)
        print(f"✓ Saved: {output_file} ({len(biometric_sample):,} records)")
        
        return enrolment_sample, demographic_sample, biometric_sample


# Example usage functions
def test_small_states():
    """Test with smallest states for quick validation"""
    creator = DataSubsetCreator()
    creator.filter_by_states(['Goa', 'Sikkim', 'Mizoram'])

def test_single_state():
    """Test with single state"""
    creator = DataSubsetCreator()
    creator.filter_by_states(['Delhi'])

def test_specific_region():
    """Test with specific region (e.g., North-East states)"""
    creator = DataSubsetCreator()
    northeast_states = ['Assam', 'Meghalaya', 'Tripura', 'Mizoram', 'Manipur', 'Nagaland', 'Arunachal Pradesh']
    creator.filter_by_states(northeast_states)

def test_random_sample():
    """Create 10% random sample of full dataset"""
    creator = DataSubsetCreator()
    creator.create_sample(sample_size_percent=10)


if __name__ == "__main__":
    print("="*80)
    print("AADHAAR DATA SUBSET CREATOR")
    print("="*80)
    print("\nChoose an option:")
    print("1. Small states (Goa, Sikkim, Mizoram) - Fastest")
    print("2. Single state (Delhi)")
    print("3. North-East region (7 states)")
    print("4. Random 10% sample of full dataset")
    print("5. Custom states (you specify)")
    print("6. Custom districts (you specify)")
    
    choice = input("\nEnter choice (1-6): ").strip()
    
    creator = DataSubsetCreator()
    
    if choice == '1':
        test_small_states()
    elif choice == '2':
        test_single_state()
    elif choice == '3':
        test_specific_region()
    elif choice == '4':
        test_random_sample()
    elif choice == '5':
        states_input = input("Enter state names (comma-separated): ")
        states = [s.strip() for s in states_input.split(',')]
        creator.filter_by_states(states)
    elif choice == '6':
        state = input("Enter state name: ").strip()
        districts_input = input("Enter district names (comma-separated): ")
        districts = [d.strip() for d in districts_input.split(',')]
        creator.filter_by_districts(state, districts)
    else:
        print("Invalid choice. Running small states test...")
        test_small_states()
    
    print("\n" + "="*80)
    print("SUBSET CREATED SUCCESSFULLY!")
    print("="*80)
    print("\nTo use this subset in your analysis, modify the file paths in your scripts:")
    print("  OLD: glob('data-set/api_data_aadhar_enrolment/**/*.csv')")
    print("  NEW: pd.read_csv('test-data/enrolment_subset.csv')")
