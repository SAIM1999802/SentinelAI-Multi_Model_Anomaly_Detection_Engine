import React from "react";
import "../styles/SummaryCards.css";

export default function SummaryCards({ summary }) {
  const algorithm = summary?.algorithm || summary?.model_name || "Isolation Forest";
  
  const totalRecords = summary?.total_records ?? summary?.totalRecords ?? 0;
  const anomaliesFound = summary?.anomalies_found ?? summary?.anomaliesCount ?? 0;

  const rawRate = summary?.anomaly_rate ?? summary?.anomalyPercentage ?? 0;
  const anomalyRate = rawRate > 1 ? rawRate.toFixed(2) : (rawRate * 100).toFixed(2);

  const processingTime = summary?.processing_time_seconds ?? summary?.executionTime ?? 0;

  return (
    <div className="summary-grid">
      <div className="summary-card active-model">
        <span className="summary-label">Selected Model</span>
        <span className="card-value model-value">{algorithm}</span>
      </div>

      <div className="summary-card">
        <span className="summary-label">Total Records</span>
        <span className="card-value">{Number(totalRecords).toLocaleString()}</span>
      </div>

      <div className="summary-card anomaly-card">
        <span className="summary-label">Anomalies Detected</span>
        <span className="card-value anomaly-value">{Number(anomaliesFound).toLocaleString()}</span>
      </div>

      <div className="summary-card">
        <span className="summary-label">Anomaly Percentage</span>
        <span className="card-value">{anomalyRate}%</span>
      </div>

      
    </div>
  );
}