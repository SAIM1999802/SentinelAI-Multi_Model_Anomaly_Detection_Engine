import React, { useState } from "react";
import Dashboard from "./pages/Dashboard";
import AnalysisPage from "./pages/Analysis";
import AuthPage from "./pages/AuthPage";
import "./App.css";

const CACHE_KEY = "sentinel_last_analysis";

/* Refresh par login page flash na ho, isliye pehle hi session padh lete hain */
const readSession = () => {
  try {
    const savedUser = localStorage.getItem("sentinel_user");
    const token = localStorage.getItem("sentinel_token");
    if (savedUser && token) return JSON.parse(savedUser);
  } catch (e) {
    localStorage.removeItem("sentinel_user");
    localStorage.removeItem("sentinel_token");
  }
  return null;
};

export default function App() {
  const [user, setUser] = useState(readSession);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [analysisData, setAnalysisData] = useState(null);
  const [lastRun, setLastRun] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("sentinel_user");
    localStorage.removeItem("sentinel_token");
    sessionStorage.removeItem(CACHE_KEY);
    setAnalysisData(null);
    setLastRun(null);
    setActiveTab("dashboard");
    setUser(null);
  };

  // Dashboard se aane wala result aur run details yahan store hote hain
  const handleDataUpdate = (data, run = null) => {
    setAnalysisData(data);
    setLastRun(run);
  };

  // Protected route check
  if (!user) {
    return <AuthPage onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div className="app-main-layout">
      {activeTab === "dashboard" ? (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          onDataUpdate={handleDataUpdate}
          initialData={analysisData}
          initialRun={lastRun}
          onNavigate={(page) => setActiveTab(page)}
          activeTab={activeTab}
        />
      ) : (
        <AnalysisPage
          user={user}
          onLogout={handleLogout}
          data={analysisData}
          onNavigate={(page) => setActiveTab(page)}
          activeTab={activeTab}
        />
      )}
    </div>
  );
}