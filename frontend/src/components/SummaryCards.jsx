import React from "react";

export default function SummaryCards({ summary }) {
  if (!summary) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
        marginTop: "1.5rem"
      }}
    >
      {/* Active Algorithm Card */}
      <div
        style={{
          border: "1px solid #1890ff",
          padding: "1rem",
          borderRadius: "8px",
          textAlign: "center",
          backgroundColor: "#e6f7ff"
        }}
      >
        <h4 style={{ color: "#0050b3", margin: "0 0 0.5rem 0" }}>Selected Model</h4>
        <p style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#003a8c", margin: 0 }}>
          {summary.algorithm || "Isolation Forest"}
        </p>
      </div>

      {/* Total Records Card */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: "1rem",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Total Records</h4>
        <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
          {summary.total_records}
        </p>
      </div>

      {/* Anomalies Found Card */}
      <div
        style={{
          border: "1px solid #ff4d4f",
          padding: "1rem",
          borderRadius: "8px",
          textAlign: "center",
          backgroundColor: "#fff1f0",
        }}
      >
        <h4 style={{ color: "#cf1322", margin: "0 0 0.5rem 0" }}>Anomalies Detected</h4>
        <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#cf1322", margin: 0 }}>
          {summary.anomalies_found}
        </p>
      </div>

      {/* Anomaly Rate Card */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: "1rem",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Anomaly Percentage</h4>
        <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
          {(summary.anomaly_rate * 100).toFixed(2)}%
        </p>
      </div>

      {/* Execution Time Card */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: "1rem",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Processing Time</h4>
        <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
          {summary.processing_time_seconds}s
        </p>
      </div>
    </div>
  );
}