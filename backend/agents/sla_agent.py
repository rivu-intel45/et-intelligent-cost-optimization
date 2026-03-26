import pandas as pd
import os

def detect_sla_risks():
    base_path = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    file_path = os.path.join(base_path, "data", "sla_operations_sample.csv")

    df = pd.read_csv(file_path)
    risky = df[df["sla_breach_risk"].isin(["High", "Breached"])]

    # Return only the fields used by the SLA UI and summary so optional
    # columns with missing values do not leak JSON-invalid NaN values.
    clean_risks = risky[
        [
            "ticket_id",
            "service",
            "priority",
            "status",
            "assigned_team",
            "resolution_time_hours",
            "sla_breach_risk",
            "penalty_cost",
            "actual_penalty_exposure",
            "recommended_action",
        ]
    ].copy()

    clean_risks = clean_risks.where(pd.notna(clean_risks), None)

    return clean_risks.to_dict(orient="records")
