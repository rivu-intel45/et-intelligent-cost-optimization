import os
import pandas as pd


def detect_finance_issues():
    base_path = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    file_path = os.path.join(base_path, "data", "finance_reconciliation_sample.csv")

    df = pd.read_csv(file_path)

    issues = df[df["status"] != "matched"].copy()
    issues = issues.where(pd.notna(issues), None)

    return issues.to_dict(orient="records")