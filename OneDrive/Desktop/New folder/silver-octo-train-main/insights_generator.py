"""
Key Insights Generator for UIDAI Hackathon Presentation
Generates actionable insights and recommendations
"""

import pandas as pd
from glob import glob
import json

class InsightsGenerator:
    def __init__(self):
        self.insights = {
            "temporal_insights": [],
            "geographic_insights": [],
            "demographic_insights": [],
            "anomalies": [],
            "recommendations": [],
            "meeting_observations": []  # Added for Jan 9, 2026 meeting
        }
        
    def load_and_analyze(self):
        """Load data and generate all insights"""
        print("Loading data and generating insights...\n")
        
        # Load enrolment data
        enrolment_files = glob('data-set/api_data_aadhar_enrolment/**/*.csv', recursive=True)
        enrolment_df = pd.concat([pd.read_csv(f) for f in enrolment_files], ignore_index=True)
        enrolment_df['date'] = pd.to_datetime(enrolment_df['date'], format='%d-%m-%Y')
        enrolment_df['total_enrolments'] = (enrolment_df['age_0_5'] + 
                                           enrolment_df['age_5_17'] + 
                                           enrolment_df['age_18_greater'])
        
        # Load demographic data
        demographic_files = glob('data-set/api_data_aadhar_demographic/**/*.csv', recursive=True)
        demographic_df = pd.concat([pd.read_csv(f) for f in demographic_files], ignore_index=True)
        demographic_df['date'] = pd.to_datetime(demographic_df['date'], format='%d-%m-%Y')
        demographic_df['total_updates'] = (demographic_df['demo_age_5_17'] + 
                                          demographic_df['demo_age_17_'])
        
        # Load biometric data
        biometric_files = glob('data-set/api_data_aadhar_biometric/**/*.csv', recursive=True)
        biometric_df = pd.concat([pd.read_csv(f) for f in biometric_files], ignore_index=True)
        biometric_df['date'] = pd.to_datetime(biometric_df['date'], format='%d-%m-%Y')
        biometric_df['total_updates'] = (biometric_df['bio_age_5_17'] + 
                                        biometric_df['bio_age_17_'])
        
        # Generate insights
        self._temporal_insights(enrolment_df, demographic_df, biometric_df)
        self._geographic_insights(enrolment_df, demographic_df, biometric_df)
        self._demographic_insights(enrolment_df)
        self._behavioral_insights(demographic_df, biometric_df)
        self._meeting_observations_insights(enrolment_df, demographic_df, biometric_df)  # New
        self._generate_recommendations(enrolment_df, demographic_df, biometric_df)
        
        return self.insights
        
    def _temporal_insights(self, enrol, demo, bio):
        """Generate temporal insights"""
        # Date range
        date_range = f"{enrol['date'].min().strftime('%Y-%m-%d')} to {enrol['date'].max().strftime('%Y-%m-%d')}"
        
        # Daily trends
        daily_enrol = enrol.groupby('date')['total_enrolments'].sum()
        peak_day = daily_enrol.idxmax()
        peak_count = daily_enrol.max()
        
        self.insights["temporal_insights"].extend([
            f"Data covers period: {date_range}",
            f"Peak enrolment day: {peak_day.strftime('%Y-%m-%d')} with {peak_count:,} enrolments",
            f"Average daily enrolments: {daily_enrol.mean():,.0f}",
        ])
        
        # Day of week patterns
        enrol['day_of_week'] = enrol['date'].dt.day_name()
        dow_avg = enrol.groupby('day_of_week')['total_enrolments'].mean()
        busiest_day = dow_avg.idxmax()
        slowest_day = dow_avg.idxmin()
        
        self.insights["temporal_insights"].append(
            f"Busiest day: {busiest_day}, Slowest day: {slowest_day}"
        )
        
        # Month patterns
        enrol['month'] = enrol['date'].dt.month_name()
        month_total = enrol.groupby('month')['total_enrolments'].sum()
        peak_month = month_total.idxmax()
        
        self.insights["temporal_insights"].append(
            f"Peak month: {peak_month}"
        )
        
    def _geographic_insights(self, enrol, demo, bio):
        """Generate geographic insights"""
        # Top states
        state_enrol = enrol.groupby('state')['total_enrolments'].sum().sort_values(ascending=False)
        top_3_states = state_enrol.head(3)
        
        self.insights["geographic_insights"].append(
            f"Top 3 states: {', '.join([f'{s} ({v:,})' for s, v in top_3_states.items()])}"
        )
        
        # State coverage
        self.insights["geographic_insights"].append(
            f"Total states covered: {enrol['state'].nunique()}"
        )
        
        # District analysis
        self.insights["geographic_insights"].append(
            f"Total districts covered: {enrol['district'].nunique()}"
        )
        
        # Low enrolment areas
        state_avg = state_enrol.mean()
        low_states = state_enrol[state_enrol < state_avg * 0.5]
        
        if len(low_states) > 0:
            self.insights["geographic_insights"].append(
                f"⚠️ {len(low_states)} states have <50% of average enrolments (require attention)"
            )
        
    def _demographic_insights(self, enrol):
        """Generate demographic insights"""
        # Age distribution
        total_0_5 = enrol['age_0_5'].sum()
        total_5_17 = enrol['age_5_17'].sum()
        total_18_plus = enrol['age_18_greater'].sum()
        total = total_0_5 + total_5_17 + total_18_plus
        
        self.insights["demographic_insights"].extend([
            f"Age 0-5: {total_0_5:,} ({total_0_5/total*100:.1f}%)",
            f"Age 5-17: {total_5_17:,} ({total_5_17/total*100:.1f}%)",
            f"Age 18+: {total_18_plus:,} ({total_18_plus/total*100:.1f}%)",
        ])
        
        # Child enrolment focus
        child_ratio = (total_0_5 + total_5_17) / total * 100
        self.insights["demographic_insights"].append(
            f"Children (<18) account for {child_ratio:.1f}% of enrolments"
        )
        
    def _behavioral_insights(self, demo, bio):
        """Generate behavioral insights"""
        # Update patterns
        total_demo = demo['total_updates'].sum()
        total_bio = bio['total_updates'].sum()
        
        self.insights["demographic_insights"].extend([
            f"Total demographic updates: {total_demo:,}",
            f"Total biometric updates: {total_bio:,}",
            f"Bio-to-Demo ratio: {total_bio/total_demo:.2f}",
        ])
        
        # State-level update behavior
        demo_state = demo.groupby('state')['total_updates'].sum()
        bio_state = bio.groupby('state')['total_updates'].sum()
        
        # States with high biometric updates (potential manual labor regions)
        comparison = pd.DataFrame({'demo': demo_state, 'bio': bio_state}).fillna(0)
        comparison['ratio'] = comparison['bio'] / (comparison['demo'] + 1)
        high_bio_states = comparison[comparison['ratio'] > comparison['ratio'].quantile(0.75)]
        
        if len(high_bio_states) > 0:
            self.insights["demographic_insights"].append(
                f"🔍 {len(high_bio_states)} states show unusually high biometric updates (aging/labor-intensive regions)"
            )
    
    def _meeting_observations_insights(self, enrol, demo, bio):
        """Generate insights based on Jan 9, 2026 meeting observations"""
        # Observation #1: Senior Citizens Biometric Failure
        bio_age_17_total = bio['bio_age_17_'].sum()
        bio_total = bio['total_updates'].sum()
        senior_update_pct = (bio_age_17_total / bio_total * 100) if bio_total > 0 else 0
        
        self.insights["meeting_observations"].append({
            "issue": "Senior Citizens - Biometric Failure",
            "observation": f"Age 17+ accounts for {senior_update_pct:.1f}% of biometric updates",
            "solution": "Nominee-based secondary authentication for failed biometrics",
            "priority": "High"
        })
        
        # Observation #2: Twins with Similar Biometrics
        self.insights["meeting_observations"].append({
            "issue": "Twins with Similar Biometrics",
            "observation": "Rare cases of highly similar fingerprints/retinal patterns in twins",
            "solution": "No solution identified - requires further research",
            "priority": "Medium"
        })
        
        # Observation #3: Rural Area Accessibility
        district_enrol = enrol.groupby('district')['total_enrolments'].sum()
        low_enrol_districts = (district_enrol < district_enrol.quantile(0.25)).sum()
        
        self.insights["meeting_observations"].append({
            "issue": "Rural Area Accessibility",
            "observation": f"{low_enrol_districts} districts show low enrolment (bottom 25%) - likely rural areas",
            "solution": "Deploy ASHA workers and mobile Aadhaar vans for doorstep enrolment",
            "priority": "High"
        })
        
        # Observation #4: Impersonation and Biometric Misuse
        # Detect anomalous biometric updates (potential impersonation)
        bio_by_date = bio.groupby('date')['total_updates'].sum()
        bio_mean = bio_by_date.mean()
        bio_std = bio_by_date.std()
        anomalies = (bio_by_date > bio_mean + 3 * bio_std).sum()
        
        self.insights["meeting_observations"].append({
            "issue": "Impersonation & Biometric Misuse",
            "observation": f"{anomalies} days with anomalous biometric update spikes detected",
            "solution": "No finalized solution - requires stronger verification mechanisms",
            "priority": "Critical"
        })
        
        
    def _generate_recommendations(self, enrol, demo, bio):
        """Generate actionable recommendations"""
        # Infrastructure recommendations
        state_enrol = enrol.groupby('state')['total_enrolments'].sum()
        high_volume_states = state_enrol[state_enrol > state_enrol.quantile(0.75)]
        
        self.insights["recommendations"].append({
            "category": "Infrastructure",
            "priority": "High",
            "recommendation": f"Scale up enrolment centers in {len(high_volume_states)} high-volume states",
            "states": list(high_volume_states.index)[:5]
        })
        
        # Low enrolment areas
        low_volume_states = state_enrol[state_enrol < state_enrol.quantile(0.25)]
        self.insights["recommendations"].append({
            "category": "Outreach",
            "priority": "High",
            "recommendation": f"Deploy mobile units and awareness campaigns in {len(low_volume_states)} underserved states",
            "states": list(low_volume_states.index)[:5]
        })
        
        # Child enrolment
        child_enrol = enrol.groupby('state').agg({
            'age_0_5': 'sum',
            'age_5_17': 'sum'
        })
        child_enrol['child_total'] = child_enrol['age_0_5'] + child_enrol['age_5_17']
        low_child_states = child_enrol.nsmallest(5, 'child_total')
        
        self.insights["recommendations"].append({
            "category": "Child Enrolment",
            "priority": "Medium",
            "recommendation": "Integrate with birth registration systems in states with low child enrolment",
            "states": list(low_child_states.index)
        })
        
        # Staffing optimization
        enrol['day_of_week'] = enrol['date'].dt.day_name()
        dow_pattern = enrol.groupby('day_of_week')['total_enrolments'].mean()
        busiest_days = dow_pattern.nlargest(3)
        
        self.insights["recommendations"].append({
            "category": "Operations",
            "priority": "Medium",
            "recommendation": f"Optimize staffing for peak days: {', '.join(busiest_days.index)}",
            "details": f"These days show {(busiest_days.mean() / dow_pattern.mean() - 1) * 100:.0f}% higher volume"
        })
        
        # Biometric maintenance
        bio_state = bio.groupby('state')['total_updates'].sum().nlargest(5)
        self.insights["recommendations"].append({
            "category": "Technology",
            "priority": "Medium",
            "recommendation": "Enhance biometric quality and maintenance in high-update regions",
            "states": list(bio_state.index)
        })
        
        # Meeting Observation #1: Senior Citizens Support
        bio_age_17 = bio.groupby('state')['bio_age_17_'].sum().nlargest(5)
        self.insights["recommendations"].append({
            "category": "Senior Citizens Support",
            "priority": "High",
            "recommendation": "Implement nominee-based secondary authentication system",
            "states": list(bio_age_17.index),
            "meeting_ref": "Jan 9, 2026 - Observation #1"
        })
        
        # Meeting Observation #3: Rural Accessibility
        district_enrol = enrol.groupby('district')['total_enrolments'].sum()
        low_districts = district_enrol.nsmallest(10)
        self.insights["recommendations"].append({
            "category": "Rural Accessibility",
            "priority": "High",
            "recommendation": "Deploy mobile Aadhaar vans and train ASHA workers",
            "districts": list(low_districts.index)[:5],
            "meeting_ref": "Jan 9, 2026 - Observation #3"
        })
        
        # Meeting Observation #4: Security Enhancement
        self.insights["recommendations"].append({
            "category": "Biometric Security",
            "priority": "Critical",
            "recommendation": "Implement enhanced verification to prevent impersonation",
            "action_items": [
                "Multi-factor authentication for suspicious patterns",
                "Real-time anomaly detection system",
                "Regular security audits of high-risk regions"
            ],
            "meeting_ref": "Jan 9, 2026 - Observations #2 & #4"
        })
        
    def generate_report(self):
        """Generate comprehensive text report"""
        insights = self.load_and_analyze()
        
        report = []
        report.append("="*80)
        report.append("UIDAI DATA HACKATHON 2026 - KEY INSIGHTS REPORT")
        report.append("Problem: Unlocking Societal Trends in Aadhaar Enrolment and Updates")
        report.append("="*80)
        
        # Temporal insights
        report.append("\n📅 TEMPORAL INSIGHTS")
        report.append("-" * 80)
        for insight in insights["temporal_insights"]:
            report.append(f"  • {insight}")
        
        # Geographic insights
        report.append("\n🗺️  GEOGRAPHIC INSIGHTS")
        report.append("-" * 80)
        for insight in insights["geographic_insights"]:
            report.append(f"  • {insight}")
        
        # Demographic insights
        report.append("\n👥 DEMOGRAPHIC & BEHAVIORAL INSIGHTS")
        report.append("-" * 80)
        for insight in insights["demographic_insights"]:
            report.append(f"  • {insight}")
        
        # Meeting Observations
        report.append("\n💼 MEETING OBSERVATIONS (JAN 9, 2026)")
        report.append("-" * 80)
        for obs in insights["meeting_observations"]:
            report.append(f"\n  {obs['issue']} [{obs['priority']} Priority]")
            report.append(f"    Observation: {obs['observation']}")
            report.append(f"    Solution: {obs['solution']}")
        
        # Recommendations
        report.append("\n💡 ACTIONABLE RECOMMENDATIONS")
        report.append("-" * 80)
        for i, rec in enumerate(insights["recommendations"], 1):
            report.append(f"\n{i}. {rec['category']} [{rec['priority']} Priority]")
            report.append(f"   {rec['recommendation']}")
            if 'states' in rec:
                report.append(f"   Target states: {', '.join(rec['states'])}")
            if 'districts' in rec:
                report.append(f"   Target districts: {', '.join(rec['districts'])}")
            if 'details' in rec:
                report.append(f"   Details: {rec['details']}")
            if 'action_items' in rec:
                report.append(f"   Action items:")
                for item in rec['action_items']:
                    report.append(f"     - {item}")
            if 'meeting_ref' in rec:
                report.append(f"   📋 Reference: {rec['meeting_ref']}")
        
        report.append("\n" + "="*80)
        report.append("END OF REPORT")
        report.append("="*80)
        
        report_text = "\n".join(report)
        
        # Save to file
        with open('insights_report.txt', 'w') as f:
            f.write(report_text)
        
        print(report_text)
        print("\n✓ Saved: insights_report.txt")
        
        # Save JSON version
        with open('insights_report.json', 'w') as f:
            json.dump(insights, f, indent=2, default=str)
        print("✓ Saved: insights_report.json")


if __name__ == "__main__":
    generator = InsightsGenerator()
    generator.generate_report()
