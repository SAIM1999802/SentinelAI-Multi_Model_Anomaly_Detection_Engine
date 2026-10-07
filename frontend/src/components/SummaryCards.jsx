import React from "react";
import "../styles/SummaryCards.css";

export default function SummaryCards({ summary }) {
  if (!summary) return null;

  return (
    <div className="summary-grid">
      <div className="summary-card active-model">
        <h4>Selected Model</h4>
        <p className="card-value model-value">{summary.algorithm || "Isolation Forest"}</p>
      </div>

      <div className="summary-card">
        <h4>Total Records</h4>
        <p className="card-value">{summary.total_records}</p>
      </div>

      <div className="summary-card anomaly-card">
        <h4>Anomalies Detected</h4>
        <p className="card-value anomaly-value">{summary.anomalies_found}</p>
      </div>

      <div className="summary-card">
        <h4>Anomaly Percentage</h4>
        <p className="card-value">{(summary.anomaly_rate * 100).toFixed(2)}%</p>
      </div>

      <div className="summary-card">
        <h4>Processing Time</h4>
        <p className="card-value">{summary.processing_time_seconds}s</p>
      </div>
    </div>
  );
}