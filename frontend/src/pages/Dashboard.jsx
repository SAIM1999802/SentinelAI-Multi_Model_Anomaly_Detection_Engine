import React, { useState } from "react";
import axios from "axios";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Legend
} from "recharts";

import Sidebar from "../components/Sidebar";
import FileUpload from "../components/FileUpload";
import SummaryCards from "../components/SummaryCards";
import AnomalyTable from "../components/AnomalyTable";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async (options) => {
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", options.file);
    formData.append("algorithm", options.algorithm);
    formData.append("contamination", options.contamination);
    formData.append("n_estimators", options.n_estimators);
    formData.append("n_neighbors", options.n_neighbors);
    formData.append("kernel", options.kernel || "rbf");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/detect-anomalies",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Analysis failed. Make sure Backend is active."
      );
    } finally {
      setLoading(false);
    }
  };

  // Chart Data preparation
  const scatterData = data?.records?.map((r, index) => ({
    x: index + 1,
    y: r.anomaly_score,
    is_anomaly: r.is_anomaly,
  })) || [];

  const barData = data?.summary
    ? [
        {
          name: "Records",
          Normal: data.summary.total_records - data.summary.anomalies_found,
          Anomaly: data.summary.anomalies_found,
        },
      ]
    : [];

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <header className="main-header">
          <h1>Security Operations Dashboard</h1>
          <p>Real-time AI Outlier Detection & Anomaly Inspection</p>
        </header>

        {error && <div className="error-banner">{error}</div>}

        <FileUpload onAnalyze={handleAnalyze} loading={loading} />

        {data && (
          <>
            <SummaryCards summary={data.summary} />

            {/* CHARTS GRID SECTION */}
            <div className="charts-grid">
              
              {/* Chart 1: Outlier Score Scatter Plot */}
              <div className="chart-card">
                <h4>Outlier Distribution Scatter</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" dataKey="x" name="Record" stroke="#94a3b8" />
                    <YAxis type="number" dataKey="y" name="Score" stroke="#94a3b8" />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter
                      name="Normal Points"
                      data={scatterData.filter((d) => d.is_anomaly === 0)}
                      fill="#38bdf8"
                    />
                    <Scatter
                      name="Anomalies"
                      data={scatterData.filter((d) => d.is_anomaly === 1)}
                      fill="#ef4444"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 2: Normal vs Anomaly Ratio */}
              <div className="chart-card">
                <h4>Normal vs Anomaly Count</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Normal" fill="#22c55e" />
                    <Bar dataKey="Anomaly" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 3: Anomaly Score Flow */}
              <div className="chart-card full-width-chart">
                <h4>Anomaly Decision Score Trend</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={scatterData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="x" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="y"
                      stroke="#38bdf8"
                      fill="#0284c7"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

            </div>

            <AnomalyTable records={data.records} />
          </>
        )}
      </main>
    </div>
  );
}