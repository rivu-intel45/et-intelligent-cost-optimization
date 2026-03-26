import pandas as pd
import os


def _build_display_name(row, position):
    category = str(row.get("vm_category", "")).strip()

    if category and category.lower() != "unknown":
        prefix = category.replace("-", " ").title()
    else:
        prefix = "Azure VM"

    return f"{prefix} {position:03d}"


def detect_idle():
    base_path = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    file_path = os.path.join(base_path, "data", "resource_usage_azure_sample.csv")

    df = pd.read_csv(file_path)
    idle = df[(df["cpu_usage"] < 20) & (df["p95_max_cpu"] < 50)]  #  you can change threshold

    idle = idle.reset_index(drop=True)
    idle["display_name"] = [
        _build_display_name(row, index + 1)
        for index, row in idle.iterrows()
    ]

    return idle.to_dict(orient="records")
