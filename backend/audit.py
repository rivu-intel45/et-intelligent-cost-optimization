import datetime
import json
import os
from threading import Lock


BASE_PATH = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(BASE_PATH, "data")
AUDIT_LOGS_PATH = os.path.join(DATA_PATH, "audit_logs.json")
_audit_lock = Lock()


def _ensure_storage():
    os.makedirs(DATA_PATH, exist_ok=True)
    if not os.path.exists(AUDIT_LOGS_PATH):
        with open(AUDIT_LOGS_PATH, "w", encoding="utf-8") as file:
            json.dump([], file)


def _load_logs():
    _ensure_storage()
    with open(AUDIT_LOGS_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def _save_logs(logs):
    with open(AUDIT_LOGS_PATH, "w", encoding="utf-8") as file:
        json.dump(logs, file, indent=2)


def log_event(event):
    with _audit_lock:
        logs = _load_logs()
        logs.append(
            {
                "event": event,
                "timestamp": str(datetime.datetime.now()),
            }
        )
        _save_logs(logs)


def get_logs():
    with _audit_lock:
        logs = _load_logs()
        return list(reversed(logs))
