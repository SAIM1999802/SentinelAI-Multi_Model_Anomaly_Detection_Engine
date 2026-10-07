import React, { useState } from "react";
import "../styles/FileUpload.css";

export default function FileUpload({ onAnalyze, loading }) {
  const [file, setFile] = useState(null);
  const [algorithm, setAlgorithm] = useState("isolation_forest");
  const [contamination, setContamination] = useState(0.05);
  const [nEstimators, setNEstimators] = useState(100);
  const [nNeighbors, setNNeighbors] = useState(20);
  const [kernel, setKernel] = useState("rbf");

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
      kernel,
    });
  };

  return (
    <div className="fileupload-card">
      <h3 className="section-title">1. Data & Model Setup</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Upload File (.csv, .xlsx):</label>
          <input
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={(e) => setFile(e.target.files[0])}
            className="file-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Select Model:</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="select-input"
          >
            <option value="isolation_forest">Isolation Forest (Tree-Based)</option>
            <option value="lof">Local Outlier Factor - LOF (Density-Based)</option>
            <option value="oc_svm">One Class SVM (Boundary-Based)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="slider-label">
            Contamination Rate: <strong>{contamination}</strong>
          </label>
          <input
            type="range"
            min="0.01"
            max="0.30"
            step="0.01"
            value={contamination}
            onChange={(e) => setContamination(parseFloat(e.target.value))}
            className="range-input"
          />
        </div>

        {algorithm === "isolation_forest" && (
          <div className="form-group">
            <label className="slider-label">
              Number of Estimators (Trees): <strong>{nEstimators}</strong>
            </label>
            <input
              type="range"
              min="10"
              max="300"
              step="10"
              value={nEstimators}
              onChange={(e) => setNEstimators(parseInt(e.target.value))}
              className="range-input"
            />
          </div>
        )}

        {algorithm === "lof" && (
          <div className="form-group">
            <label className="slider-label">
              Number of Neighbors (k): <strong>{nNeighbors}</strong>
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={nNeighbors}
              onChange={(e) => setNNeighbors(parseInt(e.target.value))}
              className="range-input"
            />
          </div>
        )}

        {algorithm === "oc_svm" && (
          <div className="form-group">
            <label className="form-label">Kernel Type:</label>
            <select
              value={kernel}
              onChange={(e) => setKernel(e.target.value)}
              className="select-input"
            >
              <option value="rbf">RBF (Radial Basis Function - Default)</option>
              <option value="linear">Linear</option>
              <option value="poly">Polynomial</option>
              <option value="sigmoid">Sigmoid</option>
            </select>
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Analyzing..." : "Detect Anomalies"}
        </button>
      </form>
    </div>
  );
}