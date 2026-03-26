import pandas as pd
import os

def detect_duplicates():
    base_path = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    file_path = os.path.join(base_path, "data", "transactions_sf_vouchers_sample.csv")

    df = pd.read_csv(file_path)
    duplicates = df[df.duplicated(subset=["vendor", "amount", "date"])]

    # Keep only the fields used by the app so missing values in extra columns
    # do not leak into the API response as JSON-invalid NaN values.
    clean_duplicates = duplicates[["transaction_id", "vendor", "amount", "date"]]

    return clean_duplicates.to_dict(orient="records")
