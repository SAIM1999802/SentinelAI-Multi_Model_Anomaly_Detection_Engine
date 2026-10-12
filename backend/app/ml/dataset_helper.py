import pandas as pd

def extract_dataset_summary(df: pd.DataFrame) -> dict:
    """
    Extracts JSON-safe summary metrics from a Pandas DataFrame.
    """
    summary = {
        "num_rows": int(len(df)),
        "num_columns": int(len(df.columns)),
        "columns": [str(col) for col in df.columns],
        "data_types": {str(k): str(v) for k, v in df.dtypes.to_dict().items()},
        "missing_values": {str(k): int(v) for k, v in df.isnull().sum().to_dict().items()},
        "numeric_stats": {}
    }

    # Only include numeric description to avoid unserializable complex types
    numeric_df = df.select_dtypes(include=['number'])
    if not numeric_df.empty:
        stats = numeric_df.describe().fillna(0).to_dict()
        summary["numeric_stats"] = {
            str(col): {str(k): float(v) for k, v in metrics.items()}
            for col, metrics in stats.items()
        }

    return summary