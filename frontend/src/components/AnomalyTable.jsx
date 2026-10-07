import React from "react";
import "../styles/AnomalyTable.css";

export default function AnomalyTable({ records }) {
  if (!records || records.length === 0) return null;

  const columns = Object.keys(records[0]);

  return (
    <div className="table-card">
      <h3 className="table-title">2. Detected Anomaly Records View</h3>
      <div className="table-wrapper">
        <table className="anomaly-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((row, index) => {
              const isAnomaly = row.is_anomaly === 1;
              return (
                <tr
                  key={index}
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
                      ) : (
                        row[col]
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}