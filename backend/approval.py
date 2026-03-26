from backend.audit import log_event

actions_db = []

def store_actions(actions):
    global actions_db
    actions_db = actions
    return actions_db

def approve_action(action_id):
    for action in actions_db:
        if action.get("server") == action_id:
            action["status"] = "approved"
            action["executed"] = True

            log_event(f"Action approved and executed: {action}")

            return action

    return {"error": "Action not found"}