# Aadhaar Intelligence Platform

A privacy-preserving analytics platform for Aadhaar data insights, built with Next.js and FastAPI.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│  │  Dashboard  │ │  Mobility   │ │  Anomalies  │ │   Policy   │ │
│  │  Overview   │ │  (AMF)      │ │  (AFIF)     │ │   (PROF)   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │
│                           │                                      │
│                    ┌──────┴──────┐                              │
│                    │  API Client │ (lib/api.ts)                 │
│                    └──────┬──────┘                              │
└───────────────────────────┼─────────────────────────────────────┘
                            │ HTTP/REST
┌───────────────────────────┼─────────────────────────────────────┐
│                    ┌──────┴──────┐                              │
│                    │   FastAPI   │                              │
│                    └──────┬──────┘                              │
│  ┌────────────────────────┼────────────────────────────────┐   │
│  │                     Routers                              │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │   │
│  │  │ ADIF │ │ IRF  │ │ AMF  │ │ AFIF │ │ PROF │ │ PPAF │ │   │
│  │  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ │   │
│  └─────┼────────┼────────┼────────┼────────┼────────┼──────┘   │
│        │        │        │        │        │        │          │
│  ┌─────┴────────┴────────┴────────┴────────┴────────┴──────┐   │
│  │                      Services                            │   │
│  │  Business logic, ML models, differential privacy         │   │
│  └─────────────────────────┬────────────────────────────────┘   │
│                            │                                    │
│  ┌─────────────────────────┴────────────────────────────────┐   │
│  │                      Database                            │   │
│  │  PostgreSQL + Redis + Graph DB                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                        Backend (Python)                         │
└─────────────────────────────────────────────────────────────────┘
```

## Frameworks

### ADIF - Aadhaar Data Integrity Framework

Ensures data quality through normalization and deduplication.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/adif/normalize` | POST | Standardize record formats |
| `/adif/deduplicate` | POST | Find and flag duplicates |
| `/adif/confidence/{uid}` | GET | Get data quality score |

**Key Capabilities:**
- Name standardization (title case, whitespace normalization)
- Address normalization (abbreviation expansion, formatting)
- Date validation and standardization
- Fuzzy duplicate detection with configurable threshold
- Per-field confidence scoring

### IRF - Identity Resolution Framework

Probabilistic record linkage and identity matching.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/irf/match` | POST | Find matching identities |
| `/irf/linked-identities/{uid}` | GET | Get linked relationships |

**Key Capabilities:**
- Multi-field similarity scoring
- Blocking strategies for efficient search
- Family and household linking
- Employment relationship detection
- Graph-based relationship discovery

### AMF - Anomaly & Migration Framework

Migration pattern analysis and mobility scoring.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/amf/migration-patterns` | GET | Get migration corridors |
| `/amf/mobility-score/{uid}` | GET | Get individual mobility index |

**Key Capabilities:**
- Migration corridor identification
- Seasonal pattern detection
- Economic migration analysis
- Mobility risk indicators
- Geographic clustering

### AFIF - Aadhaar Fraud Intelligence Framework

Fraud detection and anomaly scoring.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/afif/anomalies` | GET | List detected anomalies |
| `/afif/fraud-score/{uid}` | GET | Get fraud risk score |
| `/afif/flag` | POST | Flag record for investigation |

**Key Capabilities:**
- ML-based anomaly detection
- Rule-based fraud patterns
- Network analysis for collusion
- Composite risk scoring (0-100)
- Investigation case management

### PROF - Policy & Regional Operations Framework

Regional statistics and policy recommendations.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/prof/regional-stats` | GET | Get coverage statistics |
| `/prof/policy-recommendations` | GET | Get AI-generated recommendations |

**Key Capabilities:**
- Population coverage metrics
- Service adoption rates
- Demographic analysis
- AI-powered policy suggestions
- Regional trend analysis

### PPAF - Privacy Preserving Analytics Framework

Differential privacy implementation for secure analytics.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ppaf/query` | POST | Execute DP query |
| `/ppaf/audit-log` | GET | Get query audit trail |

**Key Capabilities:**
- Differential privacy (ε,δ)-guarantees
- Laplace and Gaussian mechanisms
- Privacy budget tracking
- Query audit logging
- Compliance monitoring

## Getting Started

### Frontend (Next.js)

The frontend runs in v0 or can be deployed to Vercel.

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

**Environment Variables:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (FastAPI)

Copy the `scripts/backend` folder to your local machine.

```bash
# Navigate to backend directory
cd scripts/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --port 8000
```

**API Documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Redirect to dashboard
│   ├── globals.css             # Theme configuration
│   └── dashboard/
│       ├── layout.tsx          # Dashboard layout with sidebar
│       ├── page.tsx            # Overview dashboard
│       ├── mobility/page.tsx   # AMF - Migration patterns
│       ├── anomalies/page.tsx  # AFIF - Fraud detection
│       ├── policy/page.tsx     # PROF - Policy insights
│       └── privacy/page.tsx    # PPAF - Privacy framework
├── components/
│   ├── sidebar.tsx             # Navigation sidebar
│   ├── header.tsx              # Page header with search
│   ├── metric-card.tsx         # KPI display cards
│   ├── chart-card.tsx          # Chart wrapper
│   ├── data-table.tsx          # Data table component
│   └── status-badge.tsx        # Status indicators
├── lib/
│   └── api.ts                  # Typed API client
└── scripts/backend/
    ├── main.py                 # FastAPI entry point
    ├── requirements.txt        # Python dependencies
    ├── routers/                # API route handlers
    │   ├── adif.py
    │   ├── irf.py
    │   ├── amf.py
    │   ├── afif.py
    │   ├── prof.py
    │   └── ppaf.py
    └── services/               # Business logic
        ├── data_integrity.py
        ├── identity_resolution.py
        ├── anomaly_detection.py
        ├── fraud_intelligence.py
        ├── policy_insights.py
        └── privacy_analytics.py
```

## Team Workflow

### For Frontend Developers

1. **Components** are in `/components` - reusable UI pieces
2. **Pages** are in `/app/dashboard` - each framework has its own page
3. **API Client** is in `/lib/api.ts` - typed functions for backend calls
4. **Styling** uses Tailwind CSS with semantic tokens in `globals.css`

### For Backend Developers

1. **Routers** define API endpoints in `/scripts/backend/routers`
2. **Services** contain business logic in `/scripts/backend/services`
3. Each service file has `TODO` comments explaining what to implement
4. Add database models, ML models, and actual implementations

### For Data Scientists

1. **Fraud Models** go in `services/fraud_intelligence.py`
2. **Migration Analysis** goes in `services/anomaly_detection.py`
3. **DP Queries** are implemented in `services/privacy_analytics.py`
4. Use scikit-learn, recordlinkage, diffprivlib for implementations

## Implementation TODOs

### High Priority

- [ ] Database schema and connections (PostgreSQL)
- [ ] Authentication and authorization (JWT/OAuth2)
- [ ] Actual data normalization logic (ADIF)
- [ ] Duplicate detection ML model (ADIF)
- [ ] Fraud scoring model (AFIF)

### Medium Priority

- [ ] Identity matching algorithm (IRF)
- [ ] Migration pattern analysis (AMF)
- [ ] Differential privacy implementation (PPAF)
- [ ] Real-time anomaly detection (AFIF)

### Lower Priority

- [ ] Policy recommendation engine (PROF)
- [ ] Graph database for relationships (IRF)
- [ ] Caching layer (Redis)
- [ ] Background job processing
- [ ] API rate limiting

## Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui
- **Charts:** Recharts
- **State:** React hooks + SWR (for data fetching)

### Backend
- **Framework:** FastAPI
- **Database:** PostgreSQL (recommended)
- **Cache:** Redis
- **ML:** scikit-learn, recordlinkage
- **Privacy:** diffprivlib (IBM Differential Privacy Library)

## Security Considerations

1. **Data Privacy:** All analytics must go through PPAF for differential privacy
2. **Access Control:** Implement role-based access (analyst, admin, auditor)
3. **Audit Logging:** All queries are logged for compliance
4. **Encryption:** Data at rest and in transit must be encrypted
5. **Rate Limiting:** Prevent abuse with API rate limits

## License

Proprietary - Internal Use Only
