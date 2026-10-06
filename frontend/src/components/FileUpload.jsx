import React, { useState } from "react";

export default function FileUpload({ onAnalyze, loading }) {
  const [file, setFile] = useState(null);
  const [algorithm,setAlgorithm] = useState('isolation_forest')
  const [contamination, setContamination] = useState(0.05);
  const [nEstimators, setNEstimators] = useState(100);
  const [nNeighbors, setNNeighbors] = useState(20);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!file) {
      alert("Upload a CSV or XLSX file");
      return;
    }

    onAnalyze({
      file,
      algorithm,
      contamination,
      n_estimators: nEstimators,
      n_neighbors: nNeighbors,
    });
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "1.5rem",
        borderRadius: "8px",
      }}
    >
      <h3>1. Data & Model Setup</h3>
      <form onSubmit={handleSubmit}>
        {/* File Input (.csv and .xlsx) */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>
            Upload File (.csv, .xlsx):
          </label>
          <input
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ marginTop: "0.5rem" }}
          />
        </div>

        {/* Algorithm Dropdown Selection */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>
            Select Model:
          </label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "0.5rem",
              borderRadius: "4px",
            }}
          >
            <option value="isolation_forest">
              Isolation Forest (Tree-Based)
            </option>
            <option value="lof">
              Local Outlier Factor - LOF (Density-Based)
            </option>
          </select>
        </div>

        {/* Contamination Parameter Slider */}
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Contamination Rate: <strong>{contamination}</strong>
          </label>
          <input
            type="range"
            min="0.01"
            max="0.30"
            step="0.01"
            value={contamination}
            onChange={(e) => setContamination(parseFloat(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        {/* Dynamic Model Parameters */}
        {algorithm === "isolation_forest" ? (
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Number of Estimators (Trees): <strong>{nEstimators}</strong>
            </label>
            <input
              type="range"
              min="10"
              max="300"
              step="10"
              value={nEstimators}
              onChange={(e) => NEstimators(parseInt(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>
        ) : (
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Number of Neighbors (k): <strong>{nNeighbors}</strong>
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={nNeighbors}
              onChange={(e) => setNNeighbors(parseInt(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>
        )}

        <button
          type="submit"
          style={{
            backgroundColor: "#007bff",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Detect Anomalies
        </button>
      </form>
    </div>
  );
}
