import json
import os
from threading import Lock


BASE_PATH = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(BASE_PATH, "data")
ACTIONS_DB_PATH = os.path.join(DATA_PATH, "actions_db.json")
_db_lock = Lock()


def _ensure_storage():
    os.makedirs(DATA_PATH, exist_ok=True)
    if not os.path.exists(ACTIONS_DB_PATH):
        with open(ACTIONS_DB_PATH, "w", encoding="utf-8") as file:
            json.dump([], file)


def _load_actions():
    _ensure_storage()
    with open(ACTIONS_DB_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def _save_actions(actions):
    with open(ACTIONS_DB_PATH, "w", encoding="utf-8") as file:
        json.dump(actions, file, indent=2)


def _issue_signature(issue):
    return json.dumps(issue, sort_keys=True, ensure_ascii=True)


def create_action(issue):
    with _db_lock:
        actions_db = _load_actions()
        signature = _issue_signature(issue)

        for action in actions_db:
            existing_signature = _issue_signature(action.get("issue", {}))
            if existing_signature == signature:
                return action

        action = {
            "id": len(actions_db),
            "issue": issue,
            "status": "pending",
        }
        actions_db.append(action)
        _save_actions(actions_db)
        return action


def approve_action(action_id):
    with _db_lock:
        actions_db = _load_actions()
        for action in actions_db:
            if action["id"] == action_id:
                action["status"] = "approved"
                action["executed"] = True
                _save_actions(actions_db)
                return action
    return None
