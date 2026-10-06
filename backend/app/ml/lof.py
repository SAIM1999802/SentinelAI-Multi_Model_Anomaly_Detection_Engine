import time
import pandas as pd
import numpy as np
from sklearn.neighbors import LocalOutlierFactor
from sklearn.preprocessing import StandardScaler

def execute_lof(
    df: pd.DataFrame, contamination: float = 0.05 , n_neighbors: int = 100 
):
    """ 
    LOF Anomaly Detection execution logic for CSV/XLSX numeric data.
    """
    start_time = time.time()

    numeric_df = df.select_dtypes(include=[np.number]).dropna()

    if numeric_df.empty:
        for col in df.columns:
            converted = pd.to_numeric(df[col], errors = 'coerce')
            if converted.notna().sum() > 0:
                numeric_df[col] = converted
    if numeric_df.empty:
        raise ValueError("No numeric data can be founf in the file")

    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(numeric_df)

    model = LocalOutlierFactor(
        n_neighbors = int(n_neighbors), 
        contamination = float(contamination),
        n_jobs = -1
    )

    predictions = model.fit_predict(scaled_features)

    negative_outlier_factor = model.negative_outlier_factor_

    result_df = df.loc[numeric_df.index].copy()
    result_df['is_anomaly'] = (predictions == -1).astype(int)
    result_df['anomaly_score'] = np.round(negative_outlier_factor,4)

    result_df = result_df.fillna("")

    total_records = len(result_df)
    anomalies_count = int((result_df["is_anomaly"] == 1 ).sum())
    processing_time = round(time.time() - start_time , 4)

    return {
        "summary": {
            "algorithm": "Local Outlier Factor (LOF)",
            "total_records": total_records,
            "anomalies_found": anomalies_count,
            "anomaly_rate": round(
                anomalies_count / total_records if total_records > 0 else 0, 4
            ),
            "contamination_param": contamination,
            "n_neighbors_param": n_neighbors,
            "processing_time_seconds": processing_time,
        },
        "records": result_df.to_dict(orient="records"),
    }
