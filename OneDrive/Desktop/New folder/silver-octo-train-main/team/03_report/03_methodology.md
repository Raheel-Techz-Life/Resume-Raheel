# Section 3: Methodology

## 1. Data Loading

### Process
- Loaded multiple CSV files for each dataset category
- Concatenated into unified DataFrames
- Validated record counts

### Code Reference
```python
# Load all files for each category
enrolment_files = glob('data-set/api_data_aadhar_enrolment/**/*.csv', recursive=True)
enrolment_df = pd.concat([pd.read_csv(f) for f in enrolment_files], ignore_index=True)
```

---

## 2. Data Cleaning

### Date Conversion
- Converted date strings to datetime objects
- Format: DD-MM-YYYY → Python datetime

### Missing Values
- Checked for null values in all columns
- Handling strategy: [Describe your approach]

### Data Quality Checks
- Verified state/district names consistency
- Checked for negative values in count columns
- Validated pincode format

### Code Reference
```python
# Date conversion
df['date'] = pd.to_datetime(df['date'], format='%d-%m-%Y')

# Check missing values
df.isnull().sum()
```

### Code Reference
```python
# Feature engineering
enrolment_df['total_enrolments'] = (
    enrolment_df['age_0_5'] + 
    enrolment_df['age_5_17'] + 
    enrolment_df['age_18_greater']
)

# Temporal features
for df in [enrolment_df, demographic_df, biometric_df]:
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month
    df['day_of_week'] = df['date'].dt.day_name()
```

---

## 3. Data Preprocessing

### Feature Engineering
| Feature | Derivation | Purpose |
|---------|------------|---------|
| `total_enrolments` | age_0_5 + age_5_17 + age_18_greater | Total daily enrolments |
| `total_updates` | demo_age_5_17 + demo_age_17_ | Total demographic updates |
| `bio_total_updates` | bio_age_5_17 + bio_age_17_ | Total biometric updates |
| `year` | date.year | Temporal analysis |
| `month` | date.month | Seasonal patterns |
| `day_of_week` | date.day_name() | Weekly patterns |
| `week_of_year` | date.week | Weekly aggregations |
| `year` | Extracted from date | Year-level analysis |
| `month` | Extracted from date | Monthly patterns |
| `day_of_week` | Extracted from date | Weekly patterns |
| `week_of_year` | Extracted from date | Week-level trends |

### Aggregations
- State-level aggregations for geographic analysis
- Date-level aggregations for temporal analysis
- Age-group aggregations for demographic analysis

### Code Reference
```python
# Feature engineering
df['total_enrolments'] = df['age_0_5'] + df['age_5_17'] + df['age_18_greater']
df['year'] = df['date'].dt.year
df['month'] = df['date'].dt.month
df['day_of_week'] = df['date'].dt.day_name()
```

---

## 4. Analysis Techniques

### Exploratory Data Analysis
- Descriptive statistics
- Distribution analysis
- Correlation analysis

### Machine Learning Models
| Model | Purpose | Library |
|-------|---------|---------|
| K-Means | State clustering | scikit-learn |
| Isolation Forest | Anomaly detection | scikit-learn |
| Random Forest | Forecasting | scikit-learn |

### Statistical Methods
- Z-score for outlier detection
- Pearson correlation
- Time series decomposition

---

## 5. Visualization Approach

### Static Visualizations
- Matplotlib for publication-quality charts
- Seaborn for statistical visualizations

### Interactive Dashboards
- Plotly for interactive exploration
- HTML exports for accessibility

---

## 6. Validation

### Model Validation
- Train-test split (80/20)
- MAPE for forecast accuracy
- Cross-validation where applicable

### Results Verification
- Manual spot-checks on aggregations
- Comparison with known statistics
- Peer review within team

---

## 7. Meeting Observations Analysis (Jan 9, 2026)

### A. Senior Citizens Biometric Failure Analysis

**Objective**: Identify states with high senior citizen authentication challenges

**Method**:
1. Aggregate biometric updates by state for Age 17+ group
2. Calculate senior ratio = bio_age_17_ / total_bio_updates
3. Sort by absolute count and ratio
4. Identify top 15 states as priority regions

**Statistical Approach**:
- Descriptive statistics on age-specific update patterns
- State-wise comparison of senior update rates
- Visualization: Horizontal bar charts

**Output**: `senior_biometric_hotspots.csv`, `senior_biometric_analysis.png`

### B. Rural Accessibility Analysis

**Objective**: Identify underserved districts requiring mobile enrolment units

**Method**:
1. Calculate district-level enrolment totals
2. Compute state-wise average enrolments
3. Identify districts <30% of state average (proxy for rural/remote)
4. Rank by enrolment count (ascending)
5. Group by state to identify states with most underserved districts

**Threshold Logic**:
- Districts with <30% of state average flagged as priority
- Bottom 20 districts designated for immediate mobile van deployment

**Output**: `rural_priority_districts.csv`, `rural_accessibility_analysis.png`

### C. Biometric Duplication & Impersonation Detection

**Objective**: Identify suspicious biometric update patterns

**Statistical Method**:
1. Group biometric updates by state, district, and date
2. Calculate mean and standard deviation for each district
3. Compute Z-scores: `z = (value - mean) / std`
4. Flag events where Z-score > 3 (>3 standard deviations)
5. Temporal analysis of suspicious events

**Anomaly Detection**:
- **Statistical**: Z-score method (threshold = 3)
- **Rationale**: Events >3σ from mean are statistically rare (p < 0.003)
- **False Positive Control**: Manual review recommended for flagged events

**Output**: `suspicious_biometric_activity.csv`, `biometric_security_analysis.png`

### D. Twins Biometric Pattern Research

**Status**: Framework established, ongoing research needed

**Approach**:
- Integrated into duplication analysis
- Monitoring high-update regions for edge cases
- Requires specialized biometric similarity analysis (future work)

---
*For PDF Section 3*
