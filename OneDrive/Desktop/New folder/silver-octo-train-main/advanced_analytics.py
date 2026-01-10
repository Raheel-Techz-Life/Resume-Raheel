"""
Advanced Analytics: Anomaly Detection and Predictive Modeling
UIDAI Data Hackathon 2026
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import IsolationForest, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

class AdvancedAadhaarAnalytics:
    def __init__(self, enrolment_df, demographic_df, biometric_df):
        self.enrolment_df = enrolment_df
        self.demographic_df = demographic_df
        self.biometric_df = biometric_df
        
    def detect_anomalies(self):
        """Detect anomalies in enrolment patterns"""
        print("\n" + "="*80)
        print("ANOMALY DETECTION")
        print("="*80)
        
        # Prepare data for anomaly detection
        daily_data = self.enrolment_df.groupby(['date', 'state']).agg({
            'total_enrolments': 'sum'
        }).reset_index()
        
        # Statistical anomaly detection (Z-score method)
        state_stats = self.enrolment_df.groupby('state').agg({
            'total_enrolments': ['mean', 'std']
        })
        state_stats.columns = ['mean', 'std']
        
        # Find outliers using Z-score
        anomalies = []
        for state in self.enrolment_df['state'].unique():
            state_data = self.enrolment_df[self.enrolment_df['state'] == state]
            mean = state_stats.loc[state, 'mean']
            std = state_stats.loc[state, 'std']
            
            if std > 0:
                z_scores = np.abs((state_data['total_enrolments'] - mean) / std)
                outliers = state_data[z_scores > 3]
                if len(outliers) > 0:
                    anomalies.append(outliers)
        
        if anomalies:
            anomaly_df = pd.concat(anomalies, ignore_index=True)
            print(f"\n✓ Found {len(anomaly_df)} anomalous records (Z-score > 3)")
            print("\nTop 10 Anomalies:")
            print(anomaly_df.nlargest(10, 'total_enrolments')[['date', 'state', 'district', 'total_enrolments']])
            
            # Save anomalies
            anomaly_df.to_csv('anomalies_detected.csv', index=False)
            print("\n✓ Saved: anomalies_detected.csv")
        
        # Isolation Forest for multivariate anomaly detection
        features_df = self.enrolment_df.groupby(['state', 'date']).agg({
            'age_0_5': 'sum',
            'age_5_17': 'sum',
            'age_18_greater': 'sum'
        }).reset_index()
        
        X = features_df[['age_0_5', 'age_5_17', 'age_18_greater']].values
        iso_forest = IsolationForest(contamination=0.05, random_state=42)
        predictions = iso_forest.fit_predict(X)
        
        features_df['anomaly'] = predictions
        anomalies_iso = features_df[features_df['anomaly'] == -1]
        print(f"\n✓ Isolation Forest detected {len(anomalies_iso)} anomalies")
        
        return anomaly_df if anomalies else None
        
    def clustering_analysis(self):
        """Cluster states by enrolment patterns"""
        print("\n" + "="*80)
        print("CLUSTERING ANALYSIS")
        print("="*80)
        
        # Aggregate features by state
        state_features = self.enrolment_df.groupby('state').agg({
            'age_0_5': 'mean',
            'age_5_17': 'mean',
            'age_18_greater': 'mean',
            'total_enrolments': ['mean', 'std']
        }).reset_index()
        
        state_features.columns = ['state', 'avg_age_0_5', 'avg_age_5_17', 'avg_age_18_plus', 
                                   'avg_total', 'std_total']
        
        # Handle NaN values before clustering
        feature_cols = ['avg_age_0_5', 'avg_age_5_17', 'avg_age_18_plus', 'std_total']
        state_features[feature_cols] = state_features[feature_cols].fillna(0)
        
        # Normalize features
        scaler = StandardScaler()
        X = scaler.fit_transform(state_features[feature_cols])
        
        # K-means clustering
        kmeans = KMeans(n_clusters=4, random_state=42)
        state_features['cluster'] = kmeans.fit_predict(X)
        
        print("\nState Clusters:")
        for cluster in range(4):
            states = state_features[state_features['cluster'] == cluster]['state'].tolist()
            print(f"\nCluster {cluster} ({len(states)} states):")
            print(", ".join(states[:10]) + ("..." if len(states) > 10 else ""))
        
        # Visualize clusters
        fig, ax = plt.subplots(figsize=(12, 8))
        scatter = ax.scatter(state_features['avg_total'], state_features['std_total'], 
                           c=state_features['cluster'], cmap='viridis', s=100, alpha=0.6)
        
        # Add state labels for some points
        for idx, row in state_features.head(15).iterrows():
            ax.annotate(row['state'], (row['avg_total'], row['std_total']), 
                       fontsize=8, alpha=0.7)
        
        ax.set_xlabel('Average Daily Enrolments')
        ax.set_ylabel('Standard Deviation')
        ax.set_title('State Clustering by Enrolment Patterns')
        plt.colorbar(scatter, label='Cluster')
        plt.tight_layout()
        plt.savefig('clustering_analysis.png', dpi=300, bbox_inches='tight')
        print("\n✓ Saved: clustering_analysis.png")
        
        state_features.to_csv('state_clusters.csv', index=False)
        print("✓ Saved: state_clusters.csv")
        
    def trend_forecasting(self):
        """Forecast future enrolment trends"""
        print("\n" + "="*80)
        print("TREND FORECASTING")
        print("="*80)
        
        # Aggregate daily enrolments
        daily_enrolments = self.enrolment_df.groupby('date').agg({
            'total_enrolments': 'sum'
        }).reset_index()
        daily_enrolments = daily_enrolments.sort_values('date')
        
        # Feature engineering for time series
        daily_enrolments['day_num'] = (daily_enrolments['date'] - daily_enrolments['date'].min()).dt.days
        daily_enrolments['day_of_week'] = daily_enrolments['date'].dt.dayofweek
        daily_enrolments['day_of_month'] = daily_enrolments['date'].dt.day
        daily_enrolments['month'] = daily_enrolments['date'].dt.month
        
        # Simple moving average
        daily_enrolments['MA_7'] = daily_enrolments['total_enrolments'].rolling(window=7).mean()
        
        # Train-test split
        train_size = int(len(daily_enrolments) * 0.8)
        train = daily_enrolments[:train_size]
        test = daily_enrolments[train_size:]
        
        # Random Forest for forecasting
        features = ['day_num', 'day_of_week', 'day_of_month', 'month']
        X_train = train[features]
        y_train = train['total_enrolments']
        X_test = test[features]
        y_test = test['total_enrolments']
        
        rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
        rf_model.fit(X_train, y_train)
        predictions = rf_model.predict(X_test)
        
        # Calculate error
        mape = np.mean(np.abs((y_test - predictions) / y_test)) * 100
        print(f"\nModel Performance (MAPE): {mape:.2f}%")
        
        # Visualize forecast
        fig, ax = plt.subplots(figsize=(15, 6))
        ax.plot(train['date'], train['total_enrolments'], label='Training Data', color='blue')
        ax.plot(test['date'], y_test, label='Actual', color='green')
        ax.plot(test['date'], predictions, label='Predicted', color='red', linestyle='--')
        ax.set_xlabel('Date')
        ax.set_ylabel('Total Enrolments')
        ax.set_title('Enrolment Forecast - Random Forest Model')
        ax.legend()
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig('forecast_analysis.png', dpi=300, bbox_inches='tight')
        print("✓ Saved: forecast_analysis.png")
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': features,
            'importance': rf_model.feature_importances_
        }).sort_values('importance', ascending=False)
        print("\nFeature Importance:")
        print(feature_importance)
        
    def migration_analysis(self):
        """Analyze migration patterns from demographic updates"""
        print("\n" + "="*80)
        print("MIGRATION PATTERN ANALYSIS")
        print("="*80)
        
        # High demographic updates might indicate migration
        state_demo = self.demographic_df.groupby('state').agg({
            'total_updates': 'sum'
        }).reset_index()
        
        state_enrol = self.enrolment_df.groupby('state').agg({
            'total_enrolments': 'sum'
        }).reset_index()
        
        migration_df = state_demo.merge(state_enrol, on='state')
        migration_df['update_to_enrolment_ratio'] = (
            migration_df['total_updates'] / migration_df['total_enrolments']
        )
        
        # High ratio might indicate high mobility
        migration_df = migration_df.sort_values('update_to_enrolment_ratio', ascending=False)
        
        print("\nTop 10 States by Update-to-Enrolment Ratio (Potential High Migration):")
        print(migration_df.head(10)[['state', 'update_to_enrolment_ratio']])
        
        # Visualize
        fig, ax = plt.subplots(figsize=(12, 8))
        top_states = migration_df.head(15)
        ax.barh(top_states['state'], top_states['update_to_enrolment_ratio'], color='coral')
        ax.set_xlabel('Update to Enrolment Ratio')
        ax.set_title('States with High Demographic Update Rates (Possible Migration Indicators)')
        ax.invert_yaxis()
        plt.tight_layout()
        plt.savefig('migration_analysis.png', dpi=300, bbox_inches='tight')
        print("\n✓ Saved: migration_analysis.png")
        
    def comparative_analysis(self):
        """Compare biometric vs demographic updates"""
        print("\n" + "="*80)
        print("BIOMETRIC VS DEMOGRAPHIC UPDATE ANALYSIS")
        print("="*80)
        
        # Aggregate by state
        demo_state = self.demographic_df.groupby('state')['total_updates'].sum()
        bio_state = self.biometric_df.groupby('state')['total_updates'].sum()
        
        comparison = pd.DataFrame({
            'demographic': demo_state,
            'biometric': bio_state
        }).fillna(0)
        
        comparison['bio_to_demo_ratio'] = comparison['biometric'] / (comparison['demographic'] + 1)
        comparison = comparison.sort_values('bio_to_demo_ratio', ascending=False)
        
        print("\nTop 10 States with High Biometric-to-Demographic Ratio:")
        print("(May indicate regions with aging population or manual labor)")
        print(comparison.head(10))
        
        # Scatter plot
        fig, ax = plt.subplots(figsize=(12, 8))
        ax.scatter(comparison['demographic'], comparison['biometric'], alpha=0.6, s=100)
        
        # Add diagonal line
        max_val = max(comparison['demographic'].max(), comparison['biometric'].max())
        ax.plot([0, max_val], [0, max_val], 'r--', alpha=0.5, label='Equal Updates')
        
        # Label some points
        for state in comparison.head(10).index:
            ax.annotate(state, (comparison.loc[state, 'demographic'], 
                               comparison.loc[state, 'biometric']), 
                       fontsize=8, alpha=0.7)
        
        ax.set_xlabel('Demographic Updates')
        ax.set_ylabel('Biometric Updates')
        ax.set_title('Biometric vs Demographic Updates by State')
        ax.legend()
        plt.tight_layout()
        plt.savefig('update_comparison.png', dpi=300, bbox_inches='tight')
        print("\n✓ Saved: update_comparison.png")
    
    def senior_citizens_biometric_analysis(self):
        """Analyze biometric failure patterns for senior citizens (Meeting Observation #1)"""
        print("\n" + "="*80)
        print("SENIOR CITIZENS BIOMETRIC FAILURE ANALYSIS")
        print("Meeting Observation: High biometric update rates may indicate authentication failures")
        print("="*80)
        
        # Analyze biometric updates for age 17+ (which includes seniors)
        bio_by_state = self.biometric_df.groupby('state').agg({
            'bio_age_17_': 'sum',
            'bio_age_5_17': 'sum'
        }).reset_index()
        
        bio_by_state['senior_ratio'] = bio_by_state['bio_age_17_'] / (bio_by_state['bio_age_17_'] + bio_by_state['bio_age_5_17'])
        bio_by_state = bio_by_state.sort_values('bio_age_17_', ascending=False)
        
        print("\n⚠️ Top 10 States with Highest Senior Citizen Biometric Updates:")
        print("(These states may benefit from nominee-based secondary authentication)")
        print(bio_by_state[['state', 'bio_age_17_', 'senior_ratio']].head(10))
        
        # Visualize
        fig, axes = plt.subplots(1, 2, figsize=(16, 6))
        
        top_states = bio_by_state.head(15)
        axes[0].barh(top_states['state'], top_states['bio_age_17_'], color='coral')
        axes[0].set_xlabel('Total Biometric Updates (Age 17+)')
        axes[0].set_title('States with High Senior Biometric Update Rates')
        axes[0].invert_yaxis()
        
        axes[1].barh(top_states['state'], top_states['senior_ratio'], color='indianred')
        axes[1].set_xlabel('Senior Age Ratio in Biometric Updates')
        axes[1].set_title('Proportion of Senior Citizen Updates')
        axes[1].invert_yaxis()
        
        plt.tight_layout()
        plt.savefig('senior_biometric_analysis.png', dpi=300, bbox_inches='tight')
        print("\n✓ Saved: senior_biometric_analysis.png")
        
        # Save recommendations
        bio_by_state.to_csv('senior_biometric_hotspots.csv', index=False)
        print("✓ Saved: senior_biometric_hotspots.csv")
        print("\n💡 RECOMMENDATION: Implement nominee-based secondary authentication in top 10 states")
    
    def rural_accessibility_analysis(self):
        """Analyze rural area enrolment patterns (Meeting Observation #3)"""
        print("\n" + "="*80)
        print("RURAL AREA ACCESSIBILITY ANALYSIS")
        print("Meeting Observation: Limited access in rural areas affects enrolment")
        print("="*80)
        
        # Analyze enrolment density by district
        district_enrol = self.enrolment_df.groupby(['state', 'district']).agg({
            'total_enrolments': 'sum'
        }).reset_index()
        
        # Calculate state averages
        state_avg = self.enrolment_df.groupby('state')['total_enrolments'].mean()
        
        # Identify low-enrolment districts (potential rural areas)
        district_enrol['state_avg'] = district_enrol['state'].map(state_avg)
        district_enrol['below_avg_pct'] = ((district_enrol['state_avg'] - district_enrol['total_enrolments']) / district_enrol['state_avg'] * 100)
        
        low_enrolment_districts = district_enrol[district_enrol['total_enrolments'] < district_enrol['state_avg'] * 0.3]
        low_enrolment_districts = low_enrolment_districts.sort_values('total_enrolments')
        
        print(f"\n⚠️ Identified {len(low_enrolment_districts)} low-enrolment districts (< 30% of state average)")
        print("\nBottom 20 Districts (Priority for Mobile Aadhaar Vans & ASHA Workers):")
        print(low_enrolment_districts[['state', 'district', 'total_enrolments']].head(20))
        
        # State-wise count of underserved districts
        underserved_by_state = low_enrolment_districts.groupby('state').size().sort_values(ascending=False)
        
        print("\nStates with Most Underserved Districts:")
        print(underserved_by_state.head(10))
        
        # Visualize
        fig, axes = plt.subplots(1, 2, figsize=(16, 6))
        
        # Bottom 20 districts
        bottom_20 = low_enrolment_districts.head(20)
        axes[0].barh(range(len(bottom_20)), bottom_20['total_enrolments'], color='crimson')
        axes[0].set_yticks(range(len(bottom_20)))
        axes[0].set_yticklabels([f"{row['district']}, {row['state']}" for _, row in bottom_20.iterrows()], fontsize=8)
        axes[0].set_xlabel('Total Enrolments')
        axes[0].set_title('20 Lowest Enrolment Districts (Rural Areas)')
        axes[0].invert_yaxis()
        
        # States with most underserved districts
        axes[1].barh(underserved_by_state.head(15).index, underserved_by_state.head(15).values, color='orangered')
        axes[1].set_xlabel('Number of Underserved Districts')
        axes[1].set_title('States Requiring Mobile Enrolment Units')
        axes[1].invert_yaxis()
        
        plt.tight_layout()
        plt.savefig('rural_accessibility_analysis.png', dpi=300, bbox_inches='tight')
        print("\n✓ Saved: rural_accessibility_analysis.png")
        
        low_enrolment_districts.to_csv('rural_priority_districts.csv', index=False)
        print("✓ Saved: rural_priority_districts.csv")
        print("\n💡 RECOMMENDATION: Deploy mobile Aadhaar vans and ASHA workers to these districts")
    
    def biometric_duplicate_analysis(self):
        """Analyze potential biometric duplication issues (Meeting Observations #2 & #4)"""
        print("\n" + "="*80)
        print("BIOMETRIC DUPLICATION & IMPERSONATION ANALYSIS")
        print("Meeting Observations: Twins with similar biometrics & Identity impersonation")
        print("="*80)
        
        # Analyze regions with unusual biometric patterns
        bio_district = self.biometric_df.groupby(['state', 'district', 'date']).agg({
            'total_updates': 'sum'
        }).reset_index()
        
        # Find districts with sudden spikes (potential impersonation)
        district_stats = bio_district.groupby(['state', 'district'])['total_updates'].agg(['mean', 'std']).reset_index()
        bio_district = bio_district.merge(district_stats, on=['state', 'district'])
        
        # Calculate z-scores
        bio_district['z_score'] = np.abs((bio_district['total_updates'] - bio_district['mean']) / (bio_district['std'] + 1))
        
        suspicious_updates = bio_district[bio_district['z_score'] > 3].sort_values('z_score', ascending=False)
        
        print(f"\n⚠️ Found {len(suspicious_updates)} suspicious biometric update events (Z-score > 3)")
        print("\nTop 15 Suspicious Events (Potential Impersonation):")
        print(suspicious_updates[['date', 'state', 'district', 'total_updates', 'mean', 'z_score']].head(15))
        
        # Count of suspicious districts by state
        suspicious_by_state = suspicious_updates.groupby('state')['district'].nunique().sort_values(ascending=False)
        
        print("\nStates with Most Suspicious Biometric Activity:")
        print(suspicious_by_state.head(10))
        
        # Visualize
        fig, axes = plt.subplots(2, 1, figsize=(14, 10))
        
        # Timeline of suspicious events
        daily_suspicious = suspicious_updates.groupby('date')['total_updates'].sum().sort_index()
        axes[0].plot(daily_suspicious.index, daily_suspicious.values, color='red', linewidth=2)
        axes[0].set_xlabel('Date')
        axes[0].set_ylabel('Suspicious Update Count')
        axes[0].set_title('Timeline of Suspicious Biometric Updates')
        axes[0].grid(True, alpha=0.3)
        
        # States with suspicious activity
        top_suspicious_states = suspicious_by_state.head(15)
        axes[1].barh(top_suspicious_states.index, top_suspicious_states.values, color='darkred')
        axes[1].set_xlabel('Number of Districts with Suspicious Activity')
        axes[1].set_title('States Requiring Enhanced Biometric Verification')
        axes[1].invert_yaxis()
        
        plt.tight_layout()
        plt.savefig('biometric_security_analysis.png', dpi=300, bbox_inches='tight')
        print("\n✓ Saved: biometric_security_analysis.png")
        
        suspicious_updates.to_csv('suspicious_biometric_activity.csv', index=False)
        print("✓ Saved: suspicious_biometric_activity.csv")
        print("\n💡 RECOMMENDATIONS:")
        print("   1. Implement stronger verification mechanisms in flagged districts")
        print("   2. Investigate twin biometric patterns in high-update regions")
        print("   3. Deploy additional security measures for authentication")


def run_advanced_analysis():
    """Load data and run all advanced analyses"""
    from glob import glob
    
    print("Loading data for advanced analysis...")
    
    # Load all data
    enrolment_files = glob('data-set/api_data_aadhar_enrolment/**/*.csv', recursive=True)
    enrolment_df = pd.concat([pd.read_csv(f) for f in enrolment_files], ignore_index=True)
    enrolment_df['date'] = pd.to_datetime(enrolment_df['date'], format='%d-%m-%Y')
    enrolment_df['total_enrolments'] = (enrolment_df['age_0_5'] + 
                                       enrolment_df['age_5_17'] + 
                                       enrolment_df['age_18_greater'])
    
    demographic_files = glob('data-set/api_data_aadhar_demographic/**/*.csv', recursive=True)
    demographic_df = pd.concat([pd.read_csv(f) for f in demographic_files], ignore_index=True)
    demographic_df['date'] = pd.to_datetime(demographic_df['date'], format='%d-%m-%Y')
    demographic_df['total_updates'] = (demographic_df['demo_age_5_17'] + 
                                      demographic_df['demo_age_17_'])
    
    biometric_files = glob('data-set/api_data_aadhar_biometric/**/*.csv', recursive=True)
    biometric_df = pd.concat([pd.read_csv(f) for f in biometric_files], ignore_index=True)
    biometric_df['date'] = pd.to_datetime(biometric_df['date'], format='%d-%m-%Y')
    biometric_df['total_updates'] = (biometric_df['bio_age_5_17'] + 
                                    biometric_df['bio_age_17_'])
    
    print("Data loaded successfully!\n")
    
    # Run analyses
    analyzer = AdvancedAadhaarAnalytics(enrolment_df, demographic_df, biometric_df)
    
    analyzer.detect_anomalies()
    analyzer.clustering_analysis()
    analyzer.trend_forecasting()
    analyzer.migration_analysis()
    analyzer.comparative_analysis()
    
    # Meeting observations analyses (Jan 9, 2026)
    print("\n" + "="*80)
    print("ANALYZING MEETING OBSERVATIONS (JAN 9, 2026)")
    print("="*80)
    analyzer.senior_citizens_biometric_analysis()
    analyzer.rural_accessibility_analysis()
    analyzer.biometric_duplicate_analysis()
    
    print("\n" + "="*80)
    print("ADVANCED ANALYSIS COMPLETE!")
    print("="*80)


if __name__ == "__main__":
    run_advanced_analysis()
