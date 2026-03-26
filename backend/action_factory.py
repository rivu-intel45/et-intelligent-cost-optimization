def build_action(
    agent,
    entity,
    problem,
    impact,
    recommended_action,
    priority,
    estimated_savings,
    approval_required=True,
):
    return {
        "agent": agent,
        "entity": entity,
        "problem": problem,
        "impact": impact,
        "recommended_action": recommended_action,
        "priority": priority,
        "estimated_savings": estimated_savings,
        "status": "pending",
        "approval_required": approval_required,
        "execution_state": "pending",
    }
