"""
Interactive Dashboard for UIDAI Data Hackathon 2026
Run this to create an interactive visualization dashboard
"""

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from glob import glob
import warnings
warnings.filterwarnings('ignore')

class InteractiveDashboard:
    def __init__(self):
        self.enrolment_df = None
        self.demographic_df = None
        self.biometric_df = None
        
    def load_data(self):
        """Load all datasets"""
        print("Loading data for interactive dashboard...")
        
        # Load Enrolment
        enrolment_files = glob('data-set/api_data_aadhar_enrolment/**/*.csv', recursive=True)
        self.enrolment_df = pd.concat([pd.read_csv(f) for f in enrolment_files], ignore_index=True)
        self.enrolment_df['date'] = pd.to_datetime(self.enrolment_df['date'], format='%d-%m-%Y')
        self.enrolment_df['total_enrolments'] = (
            self.enrolment_df['age_0_5'] + 
            self.enrolment_df['age_5_17'] + 
            self.enrolment_df['age_18_greater']
        )
        
        # Load Demographic
        demographic_files = glob('data-set/api_data_aadhar_demographic/**/*.csv', recursive=True)
        self.demographic_df = pd.concat([pd.read_csv(f) for f in demographic_files], ignore_index=True)
        self.demographic_df['date'] = pd.to_datetime(self.demographic_df['date'], format='%d-%m-%Y')
        self.demographic_df['total_updates'] = (
            self.demographic_df['demo_age_5_17'] + 
            self.demographic_df['demo_age_17_']
        )
        
        # Load Biometric
        biometric_files = glob('data-set/api_data_aadhar_biometric/**/*.csv', recursive=True)
        self.biometric_df = pd.concat([pd.read_csv(f) for f in biometric_files], ignore_index=True)
        self.biometric_df['date'] = pd.to_datetime(self.biometric_df['date'], format='%d-%m-%Y')
        self.biometric_df['total_updates'] = (
            self.biometric_df['bio_age_5_17'] + 
            self.biometric_df['bio_age_17_']
        )
        
        print("Data loaded successfully!")
        
    def create_temporal_dashboard(self):
        """Create temporal analysis dashboard"""
        daily_enrol = self.enrolment_df.groupby('date')['total_enrolments'].sum().reset_index()
        daily_demo = self.demographic_df.groupby('date')['total_updates'].sum().reset_index()
        daily_bio = self.biometric_df.groupby('date')['total_updates'].sum().reset_index()
        
        fig = go.Figure()
        
        fig.add_trace(go.Scatter(
            x=daily_enrol['date'], 
            y=daily_enrol['total_enrolments'],
            mode='lines',
            name='Enrolments',
            line=dict(color='blue', width=2)
        ))
        
        fig.add_trace(go.Scatter(
            x=daily_demo['date'], 
            y=daily_demo['total_updates'],
            mode='lines',
            name='Demographic Updates',
            line=dict(color='green', width=2)
        ))
        
        fig.add_trace(go.Scatter(
            x=daily_bio['date'], 
            y=daily_bio['total_updates'],
            mode='lines',
            name='Biometric Updates',
            line=dict(color='orange', width=2)
        ))
        
        fig.update_layout(
            title='Daily Trends: Enrolments vs Updates',
            xaxis_title='Date',
            yaxis_title='Count',
            hovermode='x unified',
            height=600,
            template='plotly_white'
        )
        
        fig.write_html('dashboard_temporal.html')
        print("✓ Saved: dashboard_temporal.html")
        
    def create_geographic_dashboard(self):
        """Create geographic analysis dashboard"""
        state_data = self.enrolment_df.groupby('state').agg({
            'age_0_5': 'sum',
            'age_5_17': 'sum',
            'age_18_greater': 'sum',
            'total_enrolments': 'sum'
        }).reset_index().sort_values('total_enrolments', ascending=True)
        
        fig = go.Figure()
        
        fig.add_trace(go.Bar(
            y=state_data['state'],
            x=state_data['age_0_5'],
            name='Age 0-5',
            orientation='h',
            marker=dict(color='lightblue')
        ))
        
        fig.add_trace(go.Bar(
            y=state_data['state'],
            x=state_data['age_5_17'],
            name='Age 5-17',
            orientation='h',
            marker=dict(color='skyblue')
        ))
        
        fig.add_trace(go.Bar(
            y=state_data['state'],
            x=state_data['age_18_greater'],
            name='Age 18+',
            orientation='h',
            marker=dict(color='steelblue')
        ))
        
        fig.update_layout(
            title='State-wise Enrolments by Age Group',
            xaxis_title='Total Enrolments',
            yaxis_title='State',
            barmode='stack',
            height=1000,
            template='plotly_white',
            showlegend=True
        )
        
        fig.write_html('dashboard_geographic.html')
        print("✓ Saved: dashboard_geographic.html")
        
    def create_comparison_dashboard(self):
        """Create comparison dashboard for updates"""
        demo_state = self.demographic_df.groupby('state')['total_updates'].sum()
        bio_state = self.biometric_df.groupby('state')['total_updates'].sum()
        
        comparison = pd.DataFrame({
            'state': demo_state.index,
            'demographic': demo_state.values,
            'biometric': bio_state.values
        })
        
        fig = go.Figure()
        
        fig.add_trace(go.Scatter(
            x=comparison['demographic'],
            y=comparison['biometric'],
            mode='markers+text',
            text=comparison['state'],
            textposition='top center',
            marker=dict(
                size=10,
                color=comparison['biometric'] / (comparison['demographic'] + 1),
                colorscale='Viridis',
                showscale=True,
                colorbar=dict(title="Bio/Demo Ratio")
            ),
            name='States'
        ))
        
        # Add diagonal line
        max_val = max(comparison['demographic'].max(), comparison['biometric'].max())
        fig.add_trace(go.Scatter(
            x=[0, max_val],
            y=[0, max_val],
            mode='lines',
            line=dict(color='red', dash='dash'),
            name='Equal Updates'
        ))
        
        fig.update_layout(
            title='Biometric vs Demographic Updates by State',
            xaxis_title='Demographic Updates',
            yaxis_title='Biometric Updates',
            height=700,
            template='plotly_white',
            hovermode='closest'
        )
        
        fig.write_html('dashboard_comparison.html')
        print("✓ Saved: dashboard_comparison.html")
        
    def create_heatmap_dashboard(self):
        """Create temporal heatmap"""
        self.enrolment_df['day_of_week'] = self.enrolment_df['date'].dt.day_name()
        self.enrolment_df['week'] = self.enrolment_df['date'].dt.isocalendar().week
        
        heatmap_data = self.enrolment_df.groupby(['week', 'day_of_week'])['total_enrolments'].sum().reset_index()
        heatmap_pivot = heatmap_data.pivot(index='day_of_week', columns='week', values='total_enrolments')
        
        # Reorder days
        day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        heatmap_pivot = heatmap_pivot.reindex(day_order)
        
        fig = go.Figure(data=go.Heatmap(
            z=heatmap_pivot.values,
            x=heatmap_pivot.columns,
            y=heatmap_pivot.index,
            colorscale='Blues',
            hoverongaps=False
        ))
        
        fig.update_layout(
            title='Weekly Enrolment Patterns (Day of Week vs Week Number)',
            xaxis_title='Week of Year',
            yaxis_title='Day of Week',
            height=500,
            template='plotly_white'
        )
        
        fig.write_html('dashboard_heatmap.html')
        print("✓ Saved: dashboard_heatmap.html")
        
    def create_district_analysis(self):
        """Create top districts analysis"""
        district_data = self.enrolment_df.groupby(['state', 'district'])['total_enrolments'].sum().reset_index()
        top_districts = district_data.nlargest(30, 'total_enrolments')
        top_districts['label'] = top_districts['district'] + ', ' + top_districts['state']
        
        fig = px.treemap(
            top_districts,
            path=['state', 'district'],
            values='total_enrolments',
            title='Top 30 Districts by Enrolment (Treemap)',
            color='total_enrolments',
            color_continuous_scale='Blues'
        )
        
        fig.update_layout(height=700)
        fig.write_html('dashboard_districts.html')
        print("✓ Saved: dashboard_districts.html")
        
    def create_age_trends(self):
        """Create age group trends over time"""
        age_trends = self.enrolment_df.groupby('date').agg({
            'age_0_5': 'sum',
            'age_5_17': 'sum',
            'age_18_greater': 'sum'
        }).reset_index()
        
        fig = go.Figure()
        
        fig.add_trace(go.Scatter(
            x=age_trends['date'],
            y=age_trends['age_0_5'],
            name='Age 0-5',
            stackgroup='one',
            fillcolor='lightblue'
        ))
        
        fig.add_trace(go.Scatter(
            x=age_trends['date'],
            y=age_trends['age_5_17'],
            name='Age 5-17',
            stackgroup='one',
            fillcolor='skyblue'
        ))
        
        fig.add_trace(go.Scatter(
            x=age_trends['date'],
            y=age_trends['age_18_greater'],
            name='Age 18+',
            stackgroup='one',
            fillcolor='steelblue'
        ))
        
        fig.update_layout(
            title='Age Group Enrolment Trends Over Time',
            xaxis_title='Date',
            yaxis_title='Enrolments',
            height=600,
            template='plotly_white',
            hovermode='x unified'
        )
        
        fig.write_html('dashboard_age_trends.html')
        print("✓ Saved: dashboard_age_trends.html")
        
    def create_summary_dashboard(self):
        """Create comprehensive summary dashboard"""
        # Calculate key metrics
        total_enrolments = self.enrolment_df['total_enrolments'].sum()
        total_demo_updates = self.demographic_df['total_updates'].sum()
        total_bio_updates = self.biometric_df['total_updates'].sum()
        num_states = self.enrolment_df['state'].nunique()
        num_districts = self.enrolment_df['district'].nunique()
        
        # Create subplots
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=('Total Activities', 'Age Distribution', 
                          'Top 10 States', 'Update Types'),
            specs=[[{'type': 'indicator'}, {'type': 'pie'}],
                   [{'type': 'bar'}, {'type': 'pie'}]]
        )
        
        # Add indicator
        fig.add_trace(go.Indicator(
            mode="number",
            value=total_enrolments,
            title={"text": "Total Enrolments"},
            number={'valueformat': ','}
        ), row=1, col=1)
        
        # Age distribution pie
        age_dist = {
            'Age 0-5': self.enrolment_df['age_0_5'].sum(),
            'Age 5-17': self.enrolment_df['age_5_17'].sum(),
            'Age 18+': self.enrolment_df['age_18_greater'].sum()
        }
        fig.add_trace(go.Pie(
            labels=list(age_dist.keys()),
            values=list(age_dist.values()),
            name="Age Distribution"
        ), row=1, col=2)
        
        # Top states bar
        top_states = self.enrolment_df.groupby('state')['total_enrolments'].sum().nlargest(10)
        fig.add_trace(go.Bar(
            x=top_states.values,
            y=top_states.index,
            orientation='h',
            name="Top States"
        ), row=2, col=1)
        
        # Update types pie
        update_types = {
            'Demographic': total_demo_updates,
            'Biometric': total_bio_updates
        }
        fig.add_trace(go.Pie(
            labels=list(update_types.keys()),
            values=list(update_types.values()),
            name="Update Types"
        ), row=2, col=2)
        
        fig.update_layout(
            title_text="UIDAI Data Analytics - Summary Dashboard",
            height=800,
            showlegend=True,
            template='plotly_white'
        )
        
        fig.write_html('dashboard_summary.html')
        print("✓ Saved: dashboard_summary.html")
        
    def generate_all_dashboards(self):
        """Generate all interactive dashboards"""
        self.load_data()
        
        print("\nGenerating interactive dashboards...\n")
        
        self.create_summary_dashboard()
        self.create_temporal_dashboard()
        self.create_geographic_dashboard()
        self.create_comparison_dashboard()
        self.create_heatmap_dashboard()
        self.create_district_analysis()
        self.create_age_trends()
        
        print("\n" + "="*80)
        print("ALL DASHBOARDS GENERATED!")
        print("="*80)
        print("\nOpen these HTML files in your browser:")
        print("  1. dashboard_summary.html - Overview of all metrics")
        print("  2. dashboard_temporal.html - Time series analysis")
        print("  3. dashboard_geographic.html - State-wise breakdown")
        print("  4. dashboard_comparison.html - Update comparisons")
        print("  5. dashboard_heatmap.html - Weekly patterns")
        print("  6. dashboard_districts.html - District analysis")
        print("  7. dashboard_age_trends.html - Age group trends")
        print("\nThese are interactive - you can zoom, pan, and hover for details!")


if __name__ == "__main__":
    dashboard = InteractiveDashboard()
    dashboard.generate_all_dashboards()
