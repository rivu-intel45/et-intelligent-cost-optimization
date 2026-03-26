# Deployment Notes

## Frontend
- Production frontend uses `frontend/.env.production`
- Local development uses `frontend/.env`
- If frontend and backend are served from the same domain, keep:
  - `REACT_APP_API_BASE_URL=`
- If backend is on a separate domain, set:
  - `REACT_APP_API_BASE_URL=https://your-backend-domain`

## Backend
- Install dependencies from [requirements.txt](C:/Users/RIVU/Projects/cost-ai-project/requirements.txt)
- Set environment variables from [backend/.env.example](C:/Users/RIVU/Projects/cost-ai-project/backend/.env.example)
- Required runtime secret:
  - `GROQ_API_KEY`

## Required Data Files
The backend expects these CSV files to exist inside `data/`:
- `resource_usage_azure_sample.csv`
- `transactions_sf_vouchers_sample.csv`
- `sla_operations_sample.csv`
- `finance_reconciliation_sample.csv`

The app now validates these files on startup and will fail fast if they are missing.

## Action Persistence
- Approval state is now stored in:
  - `data/actions_db.json`
- Include write access to the `data/` folder in your backend deployment.
