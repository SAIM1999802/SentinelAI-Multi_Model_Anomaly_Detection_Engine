import React from "react";
import "../styles/SavedAnalyses.css";

export default function SavedAnalyses({ items, onLoad, onDelete }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="saved-card">
      <h3 className="saved-title">Saved Analyses</h3>

      <div className="saved-list">
        {items.map((item) => (
          <div className="saved-item" key={item.id}>
            <div className="saved-info">
              <span className="saved-name">{item.file_name}</span>
              <span className="saved-meta">
                {item.model_name} · {item.anomalies_found}/{item.total_records} anomalies ·{" "}
                {new Date(item.created_at).toLocaleString()}
              </span>
            </div>

            <div className="saved-actions">
              <button className="saved-btn" onClick={() => onLoad(item.id)}>
                Load
              </button>
              <button className="saved-btn danger" onClick={() => onDelete(item.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}