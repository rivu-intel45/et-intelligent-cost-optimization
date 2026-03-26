import datetime

audit_logs = []

def log_event(event):
    audit_logs.append({
        "event": event,
        "timestamp": str(datetime.datetime.now())
    })

def get_logs():
    return audit_logs