from backend.agents.spend_agent import detect_duplicates
from backend.agents.resource_agent import detect_idle
from backend.agents.sla_agent import detect_sla_risks
from backend.agents.finance_agent import detect_finance_issues
from backend.audit import log_event


def run_monitoring_checks():
    duplicates = detect_duplicates()
    idle_resources = detect_idle()
    sla_risks = detect_sla_risks()
    finance_issues = detect_finance_issues()

    duplicate_savings = sum(item["amount"] for item in duplicates)
    resource_savings = sum(item["cost"] for item in idle_resources)
    sla_penalty_exposure = sum(item["actual_penalty_exposure"] for item in sla_risks)
    finance_variance = sum(abs(item["variance"]) for item in finance_issues)

    summary = {
        "duplicate_payments": len(duplicates),
        "duplicate_savings": duplicate_savings,
        "idle_resources": len(idle_resources),
        "resource_savings": resource_savings,
        "sla_risks": len(sla_risks),
        "sla_penalty_exposure": sla_penalty_exposure,
        "finance_issues": len(finance_issues),
        "finance_variance": finance_variance,
    }

    log_event(
        f"Spend agent found {len(duplicates)} duplicate payment issues worth Rs. {duplicate_savings:.0f}."
    )
    log_event(
        f"Resource agent found {len(idle_resources)} idle resources with Rs. {resource_savings:.0f} monthly waste."
    )
    log_event(
        f"SLA agent found {len(sla_risks)} at-risk tickets with Rs. {sla_penalty_exposure:.0f} penalty exposure."
    )
    log_event(
        f"Finance agent found {len(finance_issues)} reconciliation issues with Rs. {finance_variance:.0f} variance exposure."
    )

    return summary