from backend.action_factory import build_action
from backend.agents.resource_agent import detect_idle
from backend.agents.sla_agent import detect_sla_risks
from backend.agents.finance_agent import detect_finance_issues



def build_resource_actions():
    resources = detect_idle()
    actions = []

    for item in resources[:10]:
        actions.append(
            build_action(
                agent="resource",
                entity=item.get("display_name", item["server_id"]),
                problem=f"Low utilization detected: {item['cpu_usage']}% CPU usage.",
                impact=f"Estimated monthly waste of Rs. {item['cost']}.",
                recommended_action="Shut down or consolidate this underutilized resource.",
                priority="high" if item["cost"] >= 2000 else "medium",
                estimated_savings=item["cost"],
                approval_required=True,
            )
        )

    return actions
def build_sla_actions():
    risks = detect_sla_risks()
    actions = []

    for item in risks[:10]:
        actions.append(
            build_action(
                agent="sla",
                entity=item["ticket_id"],
                problem=f"SLA risk is {item['sla_breach_risk']} for this ticket.",
                impact=f"Potential penalty exposure of Rs. {item['penalty_cost']}.",
                recommended_action=item["recommended_action"],
                priority="high" if item["sla_breach_risk"] == "Breached" else "medium",
                estimated_savings=item["actual_penalty_exposure"],
                approval_required=True,
            )
        )

    return actions
def build_finance_actions():
    issues = detect_finance_issues()
    actions = []

    for item in issues[:10]:
        actions.append(
            build_action(
                agent="finance",
                entity=item["invoice_id"],
                problem=f"Finance discrepancy detected: {item['status']}.",
                impact=f"Variance exposure of Rs. {abs(item['variance'])}.",
                recommended_action=item["recommended_action"],
                priority="high" if abs(item["variance"]) >= 5000 else "medium",
                estimated_savings=abs(item["variance"]),
                approval_required=True,
            )
        )

    return actions

