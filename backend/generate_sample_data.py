import pandas as pd
import numpy as np

# Reproducibility ke liye seed set karein
np.random.seed(42)

# 1. Normal Data (100 Records)
# Transaction amounts roughly $10 to $100 ke darmiyan, normal latency 20ms to 100ms
normal_amounts = np.random.normal(loc=50, scale=15, size=100)
normal_latency = np.random.normal(loc=50, scale=10, size=100)
normal_login_attempts = np.random.choice([1, 2], size=100)

normal_df = pd.DataFrame({
    'transaction_amount': np.round(normal_amounts, 2),
    'response_time_ms': np.round(normal_latency, 2),
    'login_attempts': normal_login_attempts
})

# 2. Anomalous Outlier Data (10 Records)
# Extreme transaction amounts ($500 - $1000) ya abnormal response times / failed attempts
anomaly_df = pd.DataFrame({
    'transaction_amount': [850.50, 920.00, 1200.00, 15.00, 950.25, 1100.00, 45.00, 890.10, 780.00, 1050.00],
    'response_time_ms': [1500.00, 2300.50, 45.00, 4500.00, 1800.00, 3200.00, 5000.00, 2100.00, 1900.00, 2800.00],
    'login_attempts': [10, 12, 1, 15, 8, 11, 20, 9, 14, 13]
})

# Combine aur Shuffle karein
full_df = pd.concat([normal_df, anomaly_df], ignore_index=True)
full_df = full_df.sample(frac=1, random_state=42).reset_index(drop=True)

# CSV File Save Karein
full_df.to_csv("sample_anomaly_data.csv", index=False)
print("`sample_anomaly_data.csv` successfully created with 110 records!")