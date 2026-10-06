import React from "react";

export default function AnomalyTable({ records }) {
  if (!records || records.length === 0) return null;

  const columns = Object.keys(records[0]);

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        borderRadius: "8px",
        overflowX: "auto",
      }}
    >
      <h3>2. Detected Anomaly Records View</h3>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2", textAlign: "left" }}>
            {columns.map((col) => (
              <th
                key={col}
                style={{ border: "1px solid #ddd", padding: "8px" }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((row, index) => {
            const isAnomaly = row.is_anomaly === 1;
            return (
              <tr
                key={index}
                style={{ backgroundColor: isAnomaly ? "#ffe6e6" : "white" }}
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    style={{ border: "1px solid #ddd", padding: "8px" }}
                  >
                    {row[col]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
