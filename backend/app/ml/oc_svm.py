import time
from numpy.core import numeric
import pandas as pd
import numpy as np
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler

def execute_oc_svm(
    df:pd.DataFrame, contamination: float = 0.05 , kernel: str = "rbf"
):
    """
    OC-SVM Anomaly Detection execution logic for CSV and XLSX numeric data. 
    """
    start_time = time.time()

    numeric_df =  df.select_dtypes(include=[np.number]).dropna()

    if numeric_df.empty:
        for col in df.columns:
            converted = pd.to_numeric(df[col],errors = 'coerce')
            if converted.notna().sum() > 0:
                numeric_df[col] = converted
        numeric_df = numeric_df.dropna()
    if numeric_df.empty:
        raise ValueError("This file doesnot contain any  ") 

    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(numeric_df)

    model = OneClassSVM(
        nu = float(contamination),
        kernel = kernel,
        gamma = "scale"  
    )

    predictions = model.fit_predict(scaled_features)
    decision_scores = model.decision_function(scaled_features)

    result_df = df.loc[numeric_df.index].copy()
    result_df["is_anomaly"] = (predictions == -1).astype(int)
    result_df["anomaly_score"] = np.round(decision_scores,4)
    result_df = result_df.fillna("")

    total_records = len(result_df)
    anomalies_count = int((result_df["is_anomaly"] == 1).sum())
    processing_time = round(time.time() - start_time , 4)

    return {
        "summary": {
            "algorithm": "One-Class SVM (OC-SVM)",
            "total_records": total_records,
            "anomalies_found": anomalies_count,
            "anomaly_rate": round(
                anomalies_count / total_records if total_records > 0 else 0, 4
            ),
            "contamination_param": contamination,
            "kernel_param": kernel,
            "processing_time_seconds": processing_time,
        },
        "records": result_df.to_dict(orient="records"),
    } 