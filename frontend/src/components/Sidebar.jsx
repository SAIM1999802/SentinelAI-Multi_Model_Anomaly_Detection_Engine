import React from "react";
import "../styles/Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar-container">
      <div className="sidebar-brand">
        <h2>🛡️ SentinelAI</h2>
        <span className="version-badge">v2.0 Active</span>
      </div>

      <nav className="sidebar-menu">
        <a href="#dashboard" className="menu-item active">
          📊 Dashboard
        </a>
        <a href="#analytics" className="menu-item">
          📈 Deep Analytics
        </a>
        <a href="#models" className="menu-item">
          🤖 Model Registry
        </a>
        <a href="#logs" className="menu-item">
          📜 Threat Logs
        </a>
        <a href="#settings" className="menu-item">
          ⚙️ Settings
        </a>
      </nav>

      <div className="sidebar-footer">
        <p>Engine Status: <span className="status-online">Online</span></p>
      </div>
    </aside>
  );
}