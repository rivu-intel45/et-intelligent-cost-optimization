def take_action(idle_resources):
    actions = []

    for r in idle_resources:
        actions.append({
            "server": r.get("display_name", r["server_id"]),
            "action": "Shutdown",
            "saving": r["cost"]
        })

    return actions
def calculate_savings(actions):
    total = sum(a["saving"] for a in actions)
    return total
