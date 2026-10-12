import React, { useState, useMemo } from "react";
import "../styles/AnomalyTable.css";

const ROW_H = 52;          // CSS wali row height se match hona zaroori hai
const VISIBLE_ROWS = 8;
const OVERSCAN = 6;

const SAVE_LABELS = {
  idle: "💾 Save",
  saving: "Saving...",
  saved: "✓ Saved",
  error: "Retry Save",
};

export default function AnomalyTable({ records, onSave, saveState = "idle" }) {
  const [scrollTop, setScrollTop] = useState(0);

  const anomalyCount = useMemo(
    () =>
      records
        ? records.filter((r) => Number(r.is_anomaly) === 1).length
        : 0,
    [records]
  );

  if (!records || records.length === 0) return null;

  const total = records.length;
  const columns = Object.keys(records[0]);

  const start = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN);
  const end = Math.min(
    total,
    Math.ceil(scrollTop / ROW_H) + VISIBLE_ROWS + OVERSCAN
  );
  const visibleRows = records.slice(start, end);
  const padTop = start * ROW_H;
  const padBottom = (total - end) * ROW_H;

  return (
    <div className="table-card">
      <div className="table-header">
        <div>
          <h3 className="table-title">Detected Anomaly Records View</h3>
          <span className="table-sub">
            {total.toLocaleString()} records ·{" "}
            {anomalyCount.toLocaleString()} anomalies
          </span>
        </div>

        {onSave && (
          <button
            type="button"
            className={`save-btn ${saveState}`}
            onClick={onSave}
            disabled={saveState === "saving" || saveState === "saved"}
          >
            {SAVE_LABELS[saveState]}
          </button>
        )}
      </div>

      <div
        className="table-wrapper"
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <table className="anomaly-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {padTop > 0 && (
              <tr aria-hidden="true">
                <td
                  colSpan={columns.length}
                  style={{ height: padTop, padding: 0, border: 0 }}
                />
              </tr>
            )}

            {visibleRows.map((row, i) => {
              const isAnomaly = Number(row.is_anomaly) === 1;
              return (
                <tr
                  key={start + i}
                  className={isAnomaly ? "row-anomaly" : "row-normal"}
                >
                  {columns.map((col) => (
                    <td key={col}>
                      {col === "is_anomaly" ? (
                        isAnomaly ? (
                          <span className="badge badge-red">🔴 ANOMALY</span>
                        ) : (
                          <span className="badge badge-green">🟢 NORMAL</span>
                        )
                      ) : row[col] === null ||
                        row[col] === undefined ||
                        row[col] === "" ? (
                        "—"
                      ) : (
                        row[col]
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}

            {padBottom > 0 && (
              <tr aria-hidden="true">
                <td
                  colSpan={columns.length}
                  style={{ height: padBottom, padding: 0, border: 0 }}
                />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}