import time
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


def execute_isolation_forest(
    df: pd.DataFrame, contamination: float = 0.05, n_estimators: int = 100
):
    """
    Isolation Forest algorithm will run on Uploaded CSV file.

    """
    start_time = time.time()

    numeric_df = df.select_dtypes(include=[np.number]).dropna()

    if numeric_df.empty:
        raise ValueError("No numeric columns found in the dataset")

    Scaler = StandardScaler()
    scaled_features = Scaler.fit_transform(numeric_df)

    model = IsolationForest(
        contamination=float(contamination), n_estimators=int(n_estimators), n_jobs=-1
    )

    predictions = model.fit_predict(scaled_features)
    decision_scores = model.decision_function(scaled_features)

    result_df = df.loc[numeric_df.index].copy()
    result_df["is_anomaly"] = (predictions == -1).astype(int)
    result_df["anomaly_score"] = np.round(decision_scores, 4)

    # Safe JSON serialization for NaN values
    result_df = result_df.fillna("")

    total_records = len(result_df)
    anomalies_count = int((result_df["is_anomaly"] == 1).sum())
    processing_time = round(time.time() - start_time, 4)

    return {
        "summary": {
            "total_records": total_records,
            "anomalies_found": anomalies_count,
            "anomaly_rate": round(
                anomalies_count / total_records if total_records > 0 else 0, 4
            ),
            "contamination_param": contamination,
            "processing_time_seconds": processing_time,
        },
        "records": result_df.to_dict(orient="records"),
    }
