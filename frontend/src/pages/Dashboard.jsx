import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

import Navbar from "../components/Navbar";
import GraphCard from "../components/Graphcard";
import SummaryCards from "../components/SummaryCards";
import AIPrompt from "../components/AIPrompt";
import FileUpload from "../components/FileUpload";
import AnomalyTable from "../components/AnomalyTable";
import SavedAnalyses from "./SavedAnalyses";

import "../styles/Dashboard.css";

const API_URL = "http://127.0.0.1:8000";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("sentinel_token")}`,
});

/* ===== REFRESH CACHE (sirf is tab ke liye) ===== */

const CACHE_KEY = "sentinel_last_analysis";
const CACHE_MAX_RECORDS = 2000; // isse bari files cache nahi hoti

const loadCache = () => {
  try {
    return JSON.parse(sessionStorage.getItem(CACHE_KEY)) || null;
  } catch {
    return null;
  }
};

export default function Dashboard({
  user,
  onLogout,
  onDataUpdate,
  initialData,
  initialRun,
  onNavigate,
  activeTab,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [saves, setSaves] = useState([]);

  const [data, setData] = useState(
    () => initialData ?? loadCache()?.data ?? null,
  );
  const [lastRun, setLastRun] = useState(
    () => initialRun ?? loadCache()?.lastRun ?? null,
  );
  const [saveState, setSaveState] = useState(
    () => loadCache()?.saveState ?? "idle",
  ); // idle | saving | saved | error
  /* Refresh par data wapas laane ke liye cache */
  useEffect(() => {
    try {
      if (data && (data.records?.length ?? 0) <= CACHE_MAX_RECORDS) {
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data,
            lastRun,
            saveState: saveState === "saving" ? "idle" : saveState,
          }),
        );
      } else {
        sessionStorage.removeItem(CACHE_KEY);
      }
    } catch {
      /* storage full ho to ignore karein */
    }
  }, [data, lastRun, saveState]);

  /* Logout par cache saaf karein */
  const logout = () => {
    sessionStorage.removeItem(CACHE_KEY);
    onLogout();
  };

  /* Token invalid ya expire ho to khud logout */
  const handleAuthError = (err) => {
    if (err.response?.status === 401) {
      logout();
      return true;
    }
    return false;
  };

  /* ===== SAVED LIST ===== */

  const fetchSaves = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/saves`, {
        headers: authHeaders(),
      });
      setSaves(res.data);
    } catch (err) {
      if (handleAuthError(err)) return;
      console.error("Could not load saved analyses:", err);
    }
  }, []);

  useEffect(() => {
    fetchSaves();
  }, [fetchSaves]);

  /* ===== ANALYZE ===== */

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
        `${API_URL}/api/detect-anomalies`,
        formData,
      );

      const run = {
        fileName: options.file.name,
        algorithm: options.algorithm,
        contamination: options.contamination,
      };

      setData(response.data);
      setLastRun(run);
      setSaveState("idle");

      if (onDataUpdate) {
        onDataUpdate(response.data, run); // App ko result aur run dono do
      }
    } catch (err) {
      console.error("Analyze error:", err);

      let message;
      if (err.response) {
        const detail = err.response.data?.detail;
        message =
          (typeof detail === "string" ? detail : null) ||
          `Server error (${err.response.status}). Check the backend terminal.`;
      } else if (err.request) {
        message =
          "No response from backend. It may be stopped, crashed, or the file is too large.";
      } else {
        message = `Something broke in the app: ${err.message}`;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /* ===== SAVE (UI -> DB) ===== */

  const handleSave = async () => {
    if (!data?.records?.length) return;
    setSaveState("saving");
    setError("");

    try {
      await axios.post(
        `${API_URL}/api/saves`,
        {
          file_name: lastRun?.fileName,
          file_type: "csv",
          model_name:
            lastRun?.algorithm ||
            data?.summary?.algorithm ||
            "isolation_forest",
          contamination: lastRun?.contamination,
          records: data.records,
        },
        { headers: authHeaders() },
      );
      setSaveState("saved");
      fetchSaves();
    } catch (err) {
      if (handleAuthError(err)) return;
      setSaveState("error");
      setError(err.response?.data?.detail || "Could not save analysis.");
    }
  };

  /* ===== LOAD (DB -> UI) ===== */

  const handleLoadSave = async (id) => {
    setError("");
    try {
      const res = await axios.get(`${API_URL}/api/saves/${id}`, {
        headers: authHeaders(),
      });

      const loaded = { records: res.data.records, summary: res.data.summary };

      setData(loaded);
      setLastRun(null);
      setSaveState("saved"); // pehle se saved hai, dobara save ki zaroorat nahi

      if (onDataUpdate) onDataUpdate(loaded, null); // Analysis page ke liye bhi
    } catch (err) {
      if (handleAuthError(err)) return;
      setError(err.response?.data?.detail || "Could not load saved analysis.");
    }
  };

  /* ===== DELETE ===== */

  const handleDeleteSave = async (id) => {
    if (!window.confirm("Delete this saved analysis?")) return;
    try {
      await axios.delete(`${API_URL}/api/saves/${id}`, {
        headers: authHeaders(),
      });
      fetchSaves();
    } catch (err) {
      if (handleAuthError(err)) return;
      setError(err.response?.data?.detail || "Could not delete analysis.");
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-main">
        <Navbar
          user={user}
          onLogout={logout}
          onNavigate={onNavigate}
          activeTab={activeTab}
        />

        {error && <div className="error-banner">{error}</div>}

        {/* Row 1: File Upload and AI Prompt */}
        <div className="top-row">
          <FileUpload
            onAnalyze={handleAnalyze}
            onFileSelect={(file) => setSelectedFile(file)}
            loading={loading}
          />
          <AIPrompt file={selectedFile} />
        </div>

        {/* Row 2: Summary Cards */}
        <SummaryCards summary={data?.summary || data?.summaryData} />

        {/* Row 3: Graphs */}
        <div className="graphs-row">
          <div className="graph-large">
            <GraphCard
              title="Graph 1"
              defaultType="line"
              showDropdown={true}
              records={data?.records}
              loading={loading}
            />
          </div>

          <div className="graph-small">
            <GraphCard
              title="Graph 2"
              defaultType="doughnut"
              showDropdown={false}
              records={data?.records}
              loading={loading}
            />
          </div>
        </div>

        {/* Row 4: Saved analyses + Anomaly Table */}
        <SavedAnalyses
          items={saves}
          onLoad={handleLoadSave}
          onDelete={handleDeleteSave}
        />

        <AnomalyTable
          records={data?.records}
          onSave={handleSave}
          saveState={saveState}
        />
      </div>
    </div>
  );
}
