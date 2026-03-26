# ET Intelligent Cost Optimization

An autonomous AI cost-control platform that goes beyond dashboards by monitoring enterprise operations data, detecting inefficiencies, and surfacing corrective actions with measurable financial impact.

---

## Project Overview

This project brings together multiple enterprise agents inside one premium web experience:

- Analyze blended cost signals across spend leakage and infrastructure waste
- Detect duplicate payments and vendor anomalies through Spend Intelligence
- Recommend shutdown or consolidation actions through Resource Optimization
- Prevent operational penalties with SLA Guard
- Surface reconciliation mismatches through Financial Ops
- Track quantified monthly and yearly impact
- Maintain an activity timeline through continuous monitoring
- Route action proposals through an approval-driven Action Queue

---

## Key Features

- Multi-agent architecture across spend, infrastructure, SLA, and finance workflows
- AI-assisted optimization recommendations with fallback rule-based reasoning
- Continuous monitoring loop with automated activity logging
- Approval workflow for action proposals
- Financial impact surfaced across every major module
- Premium editorial UI inspired by luxury enterprise website layouts
- Deployment-ready sample datasets included in the repository

---

## Agent Suite

### 1. Analyze
- Combines spend and resource insights into one overview
- Highlights duplicate-payment exposure and infrastructure waste
- Summarizes corrective opportunities in one executive view

### 2. Spend Intelligence
- Detects duplicate payments and suspicious spend patterns
- Estimates recoverable duplicate-payment exposure
- Surfaces affected vendors and transaction clusters

### 3. Resource Optimization
- Identifies idle or underutilized infrastructure
- Suggests shutdown or consolidation actions
- Estimates monthly waste and savings opportunity

### 4. SLA Guard
- Flags high-risk and breached SLA tickets
- Suggests escalation or rerouting actions
- Quantifies penalty exposure before the financial hit lands

### 5. Financial Ops
- Detects reconciliation mismatches
- Surfaces variance exposure and likely root causes
- Suggests corrective finance actions

### 6. Action Queue
- Aggregates actions from multiple agents
- Supports approval-driven execution flow
- Persists approval state across restarts

### 7. Activity and Impact
- Logs automated monitoring runs in the Activity timeline
- Tracks projected monthly and yearly value in Impact

---

## Tech Stack

### Frontend
- React
- Axios
- Lucide React
- Custom CSS

### Backend
- FastAPI
- Pandas
- Groq API
- Uvicorn

### Deployment
- Frontend: Vercel
- Backend: Render

---

## Project Structure

```text
et-intelligent-cost-optimization/
|-- backend/
|   |-- agents/
|   |-- llm/
|   |-- action_builders.py
|   |-- action_engine.py
|   |-- action_factory.py
|   |-- audit.py
|   |-- main.py
|   |-- monitoring.py
|   `-- workflow.py
|-- data/
|   |-- finance_reconciliation_sample.csv
|   |-- resource_usage_azure_sample.csv
|   |-- sla_operations_sample.csv
|   `-- transactions_sf_vouchers_sample.csv
|-- frontend/
|   |-- public/
|   `-- src/
|-- DEPLOYMENT.md
|-- README.md
`-- requirements.txt
```

---

## Live Deployment

- Frontend: [https://et-intelligent-cost-optimization.vercel.app](https://et-intelligent-cost-optimization.vercel.app)
- Backend: [https://cost-ai-backend.onrender.com](https://cost-ai-backend.onrender.com)
- Backend Docs: [https://cost-ai-backend.onrender.com/docs](https://cost-ai-backend.onrender.com/docs)

Note: the backend may take a few seconds to wake up on free hosting.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/rivu-intel45/et-intelligent-cost-optimization.git
cd et-intelligent-cost-optimization
```

### 2. Set up the backend

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a backend environment variable:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Run the backend:

```bash
uvicorn backend.main:app --reload
```

### 3. Set up the frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
REACT_APP_API_BASE_URL=http://127.0.0.1:8000
```

Run the frontend:

```bash
npm start
```

---

## Datasets Used

This project uses cleaned, deployment-safe sample datasets derived from larger public or real-world-inspired sources:

- Azure resource utilization traces for infrastructure optimization
- San Francisco vendor payments for spend intelligence
- Helpdesk and SLA operations data for breach-risk monitoring
- Finance reconciliation data for variance and mismatch analysis

Large raw files are intentionally excluded from GitHub, while smaller deployable sample files are included in the repository.

---

## Continuous Monitoring

The backend includes an automated monitoring loop that periodically:

- checks duplicate-payment patterns
- scans for idle resources
- evaluates SLA risk
- reviews finance discrepancies
- logs findings into the Activity timeline

This helps the app behave like an autonomous operations intelligence platform rather than a static dashboard.

---

## Deployment Notes

- Backend dependencies are listed in [requirements.txt](requirements.txt)
- Frontend production API configuration uses `frontend/.env.production`
- Approval state is persisted in `data/actions_db.json`
- Required backend sample CSV files are validated on startup

See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment details.

---

## Future Improvements

- Move approval persistence from JSON storage to a database
- Add authentication and user roles
- Add richer executive reporting and charting
- Expand downstream workflow automation
- Tighten production CORS and infrastructure hardening

---

## Author

Built by **Rivu Intel45** as an enterprise AI cost optimization project focused on autonomous monitoring, financial impact, and action-driven operations intelligence.
