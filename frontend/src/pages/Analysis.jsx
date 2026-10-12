import React, { useMemo } from "react";
import Navbar from "../components/Navbar";
import AnomalyTable from "../components/AnomalyTable";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

import "../styles/Analysis.css";

const DOUGHNUT_COLORS = ["#28a745", "#dc3545"]; // Green = Normal, Red = Anomaly
const MAX_SCATTER_POINTS = 1500;

const tooltipStyle = {
  backgroundColor: "#150f33",
  borderColor: "#2e2362",
};

const isAnomalyRow = (r) =>
  Number(r.is_anomaly) === 1 || Number(r.anomaly) === -1;

const scoreOf = (r, fallbackAnomaly, fallbackNormal) => {
  const s = Number(r.anomaly_score);
  return Number.isFinite(s) ? s : isAnomalyRow(r) ? fallbackAnomaly : fallbackNormal;
};

/* Bade data mein se max points chunta hai; anomalies ko priority deta hai */
function sampleIndices(records, max = MAX_SCATTER_POINTS) {
  const n = records.length;
  if (n <= max) return Array.from({ length: n }, (_, i) => i);

  const anomalyIdx = [];
  const normalIdx = [];
  for (let i = 0; i < n; i++) {
    (isAnomalyRow(records[i]) ? anomalyIdx : normalIdx).push(i);
  }

  const pick = (arr, k) => {
    if (arr.length <= k) return arr;
    const step = arr.length / k;
    return Array.from({ length: k }, (_, j) => arr[Math.floor(j * step)]);
  };

  const anomalyShare = Math.min(anomalyIdx.length, Math.floor(max * 0.4));
  return [
    ...pick(anomalyIdx, anomalyShare),
    ...pick(normalIdx, max - anomalyShare),
  ].sort((a, b) => a - b);
}

export default function AnalysisPage({
  user,
  onLogout,
  data,
  onNavigate,
  activeTab,
}) {
  const records = useMemo(() => data?.records || [], [data]);

  /* Doughnut: poore data se counts */
  const doughnutData = useMemo(() => {
    let anomalies = 0;
    for (const r of records) {
      if (isAnomalyRow(r)) anomalies++;
    }
    return [
      { name: "Normal", value: records.length - anomalies },
      { name: "Anomaly", value: anomalies },
    ];
  }, [records]);

  /* Line: pehle 50 records */
  const lineData = useMemo(
    () =>
      records.slice(0, 50).map((r, i) => ({
        id: i + 1,
        anomaly_score: scoreOf(r, 1, 0),
      })),
    [records]
  );

  /* Bar: pehle 20 records */
  const barData = useMemo(
    () =>
      records.slice(0, 20).map((r, i) => ({
        index: `Rec ${i + 1}`,
        score: scoreOf(r, 0.8, 0.1),
      })),
    [records]
  );

  /* Scatter: sampled, aur normal/anomaly alag series (60K Cell nahi) */
  const scatter = useMemo(() => {
    const idx = sampleIndices(records);
    const normal = [];
    const anomaly = [];

    for (const i of idx) {
      const r = records[i];
      const point = { x: i + 1, y: scoreOf(r, 1, -1) };
      (isAnomalyRow(r) ? anomaly : normal).push(point);
    }

    return { normal, anomaly, shown: idx.length };
  }, [records]);

  const isSampled = records.length > scatter.shown;

  return (
    <div className="dashboard-layout">
      <div className="dashboard-main">
        <Navbar
          user={user}
          onLogout={onLogout}
          onNavigate={onNavigate}
          activeTab={activeTab}
        />

        {/* Row 1: Line Chart (Full Width) */}
        <div className="chart-card full-width">
          <h3>Line Chart (Anomaly Score Trend)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2362" />
              <XAxis dataKey="id" stroke="#9a8fc4" />
              <YAxis stroke="#9a8fc4" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="anomaly_score"
                stroke="#a78bfa"
                strokeWidth={2}
                dot={{ r: 3 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Row 2: Bar Chart + Doughnut Chart */}
        <div className="charts-split-row">
          <div className="chart-card flex-bar">
            <h3>Bar Chart (Outlier Scores)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2362" />
                <XAxis dataKey="index" stroke="#9a8fc4" />
                <YAxis stroke="#9a8fc4" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="score"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card flex-doughnut">
            <h3>Doughnut Chart</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={doughnutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {doughnutData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={DOUGHNUT_COLORS[index % DOUGHNUT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 3: Scatter Chart (Full Width) */}
        <div className="chart-card full-width">
          <h3>Scatter Chart (Data Distribution & Outliers)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2362" />
              <XAxis
                dataKey="x"
                type="number"
                name="Record Index"
                stroke="#9a8fc4"
              />
              <YAxis
                dataKey="y"
                type="number"
                name="Anomaly Score"
                stroke="#9a8fc4"
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={tooltipStyle}
              />
              <Legend />
              <Scatter
                name="Normal"
                data={scatter.normal}
                fill="#818cf8"
                isAnimationActive={false}
              />
              <Scatter
                name="Anomaly"
                data={scatter.anomaly}
                fill="#fb7185"
                isAnimationActive={false}
              />
            </ScatterChart>
          </ResponsiveContainer>

          {isSampled && (
            <p
              style={{
                margin: "0.6rem 0 0",
                textAlign: "center",
                fontSize: "0.78rem",
                color: "#9a8fc4",
              }}
            >
              Showing {scatter.shown.toLocaleString()} of{" "}
              {records.length.toLocaleString()} points (all anomalies prioritized)
            </p>
          )}
        </div>

        {/* Row 4: Full-Width Table */}
        <div className="chart-card full-width table-card-container">
          <AnomalyTable records={records} />
        </div>
      </div>
    </div>
  );
}