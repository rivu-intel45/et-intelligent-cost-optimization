from backend.action_builders import (
    build_resource_actions,
    build_sla_actions,
    build_finance_actions,
)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import threading
import time

from backend.action_engine import calculate_savings, take_action
from backend.agents.resource_agent import detect_idle
from backend.agents.spend_agent import detect_duplicates
from backend.audit import get_logs, log_event
from backend.llm.reasoning import generate_reason
from backend.workflow import approve_action, create_action
from backend.agents.sla_agent import detect_sla_risks
from backend.agents.finance_agent import detect_finance_issues
from backend.monitoring import run_monitoring_checks


app = FastAPI()

MONITORING_INTERVAL_SECONDS = 60
monitoring_started = False
BASE_PATH = os.path.dirname(os.path.dirname(__file__))
REQUIRED_DATA_FILES = [
    os.path.join(BASE_PATH, "data", "resource_usage_azure_sample.csv"),
    os.path.join(BASE_PATH, "data", "transactions_sf_vouchers_sample.csv"),
    os.path.join(BASE_PATH, "data", "sla_operations_sample.csv"),
    os.path.join(BASE_PATH, "data", "finance_reconciliation_sample.csv"),
]


def monitoring_loop():
    while True:
        try:
            run_monitoring_checks()
        except Exception as e:
            print(f"Monitoring loop error: {e}")

        time.sleep(MONITORING_INTERVAL_SECONDS)


def validate_deployment_files():
    missing_files = [path for path in REQUIRED_DATA_FILES if not os.path.exists(path)]
    if missing_files:
        missing_list = "\n".join(missing_files)
        raise FileNotFoundError(
            "Missing required deployment data files:\n"
            f"{missing_list}\n"
            "Make sure the sample CSV files are deployed with the backend."
        )


def validate_runtime_config():
    if not os.getenv("GROQ_API_KEY"):
        print(
            "Warning: GROQ_API_KEY is not set. AI reasoning will fall back to rule-based responses."
        )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Cost AI Running"}


@app.get("/analyze")
def analyze():
    duplicates = detect_duplicates()
    idle = detect_idle()
    actions = take_action(idle)

    duplicate_savings = sum(d["amount"] for d in duplicates)
    resource_savings = sum(r["cost"] for r in idle)
    total_savings = duplicate_savings + resource_savings

    suggestions = [
        f"Avoid duplicate payment to {d['vendor']} of Rs. {d['amount']}"
        for d in duplicates
    ]
    suggestions.extend(
        f"Consider shutting down {r.get('display_name', r['server_id'])} to save Rs. {r['cost']}"
        for r in idle
    )

    return {
        "mode": "analyze",
        "summary": {
            "total_savings": total_savings,
            "duplicate_savings": duplicate_savings,
            "resource_savings": resource_savings,
            "issues": len(duplicates) + len(idle),
            "actions": len(actions),
        },
        "duplicates": duplicates,
        "idle_resources": idle,
        "suggestions": suggestions,
        "actions": actions,
    }


@app.get("/optimize")
def optimize():
    idle = detect_idle()
    actions = take_action(idle)
    savings = calculate_savings(actions)

    return {
        "mode": "optimize",
        "summary": {
            "total_savings": savings,
            "actions": len(actions),
            "affected_resources": len(idle),
        },
        "actions": actions,
        "total_savings": savings,
    }


@app.get("/ai-analysis")
def ai_analysis():
    issue = "High resource usage detected"
    result = generate_reason(issue)

    return {"mode": "ai-analysis", "analysis": result}


@app.get("/smart-optimize")
def smart_optimize():
    idle = sorted(detect_idle(), key=lambda x: x["cost"], reverse=True)[:10]
    items = []

    for resource in idle:
        reason = generate_reason(resource)
        items.append(
            {
                "server": resource.get("display_name", resource["server_id"]),
                "action": "Shutdown",
                "saving": resource["cost"],
                "analysis": reason,
            }
        )

    total_savings = sum(item["saving"] for item in items)

    return {
        "mode": "smart-optimize",
        "summary": {
            "total_savings": total_savings,
            "actions": len(items),
            "issues": len(items),
        },
        "items": items,
    }


@app.get("/propose-actions")
def propose():
    proposals = []

    resource_actions = build_resource_actions()
    sla_actions = build_sla_actions()
    finance_actions = build_finance_actions()

    all_actions = resource_actions + sla_actions + finance_actions

    for action in all_actions:
        proposal = create_action(action)
        proposals.append(proposal)

    return {
        "mode": "propose",
        "summary": {
            "proposals": len(proposals),
            "potential_savings": sum(
                proposal["issue"]["estimated_savings"] for proposal in proposals
            ),
        },
        "items": proposals,
    }

@app.post("/approve/{action_id}")
def approve(action_id: int):
    approved = approve_action(action_id)
    if approved:
        approved["issue"]["status"] = "approved"
        approved["issue"]["execution_state"] = "executed"
        log_event(
            f"Approved {approved['issue']['agent']} action {action_id} for {approved['issue']['entity']}"
        )
    return approved


@app.get("/audit-logs")
def logs():
    entries = get_logs()
    return {
        "mode": "logs",
        "summary": {
            "entries": len(entries),
        },
        "items": entries,
    }


@app.get("/impact")
def impact():
    idle = detect_idle()
    duplicates = detect_duplicates()
    actions = take_action(idle)
    monthly_savings = calculate_savings(actions)
    yearly_savings = monthly_savings * 12

    return {
        "mode": "impact",
        "monthly_savings": monthly_savings,
        "yearly_savings": yearly_savings,
        "projected_actions": len(actions),
        "issues_detected": len(idle) + len(duplicates),
        "duplicate_payments": len(duplicates),
        "idle_resources": len(idle),
    }

@app.get("/sla-guard")
def sla_guard():
    risks = detect_sla_risks()

    total_penalty = sum(item["actual_penalty_exposure"] for item in risks)

    return {
        "mode": "sla-guard",
        "summary": {
            "tickets_at_risk": len(risks),
            "penalty_exposure": total_penalty
        },
        "items": risks
    }
@app.get("/finance-ops")
def finance_ops():
    issues = detect_finance_issues()
    total_variance = sum(abs(item["variance"]) for item in issues)

    return {
        "mode": "finance-ops",
        "summary": {
            "issues_found": len(issues),
            "variance_exposure": total_variance,
        },
        "items": issues
    }
@app.post("/run-monitoring")
def run_monitoring():
    summary = run_monitoring_checks()

    return {
        "mode": "monitoring",
        "summary": summary,
        "message": "Monitoring checks completed successfully."
    }
@app.on_event("startup")
def start_monitoring_loop():
    global monitoring_started
    validate_deployment_files()
    validate_runtime_config()

    if not monitoring_started:
        monitoring_thread = threading.Thread(target=monitoring_loop, daemon=True)
        monitoring_thread.start()
        monitoring_started = True
