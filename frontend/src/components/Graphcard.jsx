import React, { useState, useRef, useEffect, useMemo } from "react";

import { Line, Bar, Scatter, Doughnut } from "react-chartjs-2";

import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import "../styles/Graphcard.css";

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
);

/* ===== THEME COLORS ===== */

const MUTED = "#9a8fc4";
const GRID = "rgba(46,35,98,0.5)";
const PURPLE = "#a78bfa";
const RED = "#f87171";
const GREEN = "#4ade80";

/* Doughnut: dark = anomaly, light = normal */
const ANOMALY_DARK = "#6d28d9";
const ANOMALY_DARK_HOVER = "#7c3aed";
const NORMAL_LIGHT = "#ddd6fe";
const NORMAL_LIGHT_HOVER = "#ede9fe";

/* ===== CHART OPTIONS ===== */

const axisOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: { labels: { color: MUTED } },
  },
  scales: {
    x: {
      ticks: { color: MUTED, maxTicksLimit: 25 },
      grid: { color: GRID },
    },
    y: {
      ticks: { color: MUTED },
      grid: { color: GRID },
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  radius: "85%",
  cutout: "58%",
  plugins: {
    legend: {
      position: "bottom",
      labels: { color: MUTED, padding: 12, boxWidth: 14 },
    },
    tooltip: { enabled: true },
  },
};

/* ===== DROPDOWN OPTIONS ===== */

const CHART_TYPES = [
  { value: "line", label: "Line Chart", icon: "📈" },
  { value: "bar", label: "Bar Chart", icon: "📊" },
  { value: "scatter", label: "Scatter Plot", icon: "🔵" },
];

/* Bade data mein se max points chunta hai; anomalies ko priority deta hai */
const MAX_POINTS = 1500;

function sampleIndices(records, max = MAX_POINTS) {
  const n = records.length;
  if (n <= max) return Array.from({ length: n }, (_, i) => i);

  const anomalyIdx = [];
  const normalIdx = [];
  for (let i = 0; i < n; i++) {
    (Number(records[i].is_anomaly) === 1 ? anomalyIdx : normalIdx).push(i);
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

/* ===== CUSTOM THEMED DROPDOWN (navbar dropdown jaisa) ===== */

function ChartDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <div className="graph-dropdown" ref={ref}>
      <button
        type="button"
        className="graph-dropdown-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select chart type"
      >
        <span>{selected.label}</span>
        <span className={`graph-dropdown-caret ${open ? "open" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="graph-dropdown-menu" role="listbox">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              className={`graph-dropdown-item ${
                opt.value === value ? "selected" : ""
              }`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <span className="graph-dropdown-icon">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== GRAPH CARD ===== */

export default function GraphCard({
  title = "Graph",
  records,
  defaultType = "line",
  showDropdown = true,
  loading = false,
}) {
  const [chartType, setChartType] = useState(defaultType);

  const hasData = Array.isArray(records) && records.length > 0;

  /* Chart ke liye chuna hua data (sirf records badalne par dobara banta hai) */
  const sampled = useMemo(() => {
    if (!hasData) return null;
    const idx = sampleIndices(records);
    return {
      count: idx.length,
      labels: idx.map((i) => `Rec ${i + 1}`),
      xs: idx.map((i) => i + 1),
      scores: idx.map((i) => Number(records[i].anomaly_score) || 0),
      flags: idx.map((i) => Number(records[i].is_anomaly) === 1),
    };
  }, [records, hasData]);

  /* Doughnut poore data se counts leta hai */
  const counts = useMemo(() => {
    if (!hasData) return null;
    let anomalyCount = 0;
    for (const r of records) {
      if (Number(r.is_anomaly) === 1) anomalyCount++;
    }
    return { anomalyCount, normalCount: records.length - anomalyCount };
  }, [records, hasData]);

  const isSampled = hasData && sampled.count < records.length;

  const renderChart = () => {
    if (!hasData) {
      return (
        <div className="graph-empty">
          <span className="graph-empty-icon">{loading ? "⏳" : "📉"}</span>
          <p>
            {loading
              ? "Analyzing data..."
              : "Upload a file and click “Detect Anomalies” to generate this graph."}
          </p>
        </div>
      );
    }

    const { labels, xs, scores, flags } = sampled;
    const { anomalyCount, normalCount } = counts;
    const pct = (n) => ((n / records.length) * 100).toFixed(1);

    switch (chartType) {
      case "bar":
        return (
          <Bar
            options={axisOptions}
            data={{
              labels,
              datasets: [
                {
                  label: "Anomaly Score",
                  data: scores,
                  backgroundColor: flags.map((f) => (f ? RED : PURPLE)),
                  borderRadius: labels.length > 300 ? 0 : 4,
                },
              ],
            }}
          />
        );

      case "scatter":
        return (
          <Scatter
            options={axisOptions}
            data={{
              datasets: [
                {
                  label: "Score per Record",
                  data: scores.map((s, i) => ({ x: xs[i], y: s })),
                  backgroundColor: flags.map((f) => (f ? RED : GREEN)),
                  pointRadius: labels.length > 300 ? 2.5 : 4,
                  pointHoverRadius: 6,
                },
              ],
            }}
          />
        );

      case "doughnut":
        return (
          <Doughnut
            options={doughnutOptions}
            data={{
              labels: [
                `Anomaly (${pct(anomalyCount)}%)`,
                `Normal (${pct(normalCount)}%)`,
              ],
              datasets: [
                {
                  data: [anomalyCount, normalCount],
                  backgroundColor: [ANOMALY_DARK, NORMAL_LIGHT],
                  hoverBackgroundColor: [
                    ANOMALY_DARK_HOVER,
                    NORMAL_LIGHT_HOVER,
                  ],
                  borderColor: "transparent",
                  borderWidth: 0,
                  hoverOffset: 5,
                },
              ],
            }}
          />
        );

      default:
        return (
          <Line
            options={axisOptions}
            data={{
              labels,
              datasets: [
                {
                  fill: true,
                  label: "Anomaly Score Trend",
                  data: scores,
                  borderColor: PURPLE,
                  backgroundColor: "rgba(167, 139, 250, 0.15)",
                  tension: labels.length > 300 ? 0 : 0.3,
                  pointRadius: labels.length > 300 ? 0 : 3,
                  pointHitRadius: 6,
                  pointHoverRadius: 5,
                  pointBackgroundColor: PURPLE,
                },
              ],
            }}
          />
        );
    }
  };

  return (
    <section
      className={`graph-card ${
        showDropdown ? "graph-card-large" : "graph-card-small"
      }`}
    >
      <div className="graph-header">
        <h3 className="graph-title">{title}</h3>

        {showDropdown && (
          <ChartDropdown
            value={chartType}
            options={CHART_TYPES}
            onChange={setChartType}
          />
        )}
      </div>

      <div className="graph-container">{renderChart()}</div>

      {isSampled && chartType !== "doughnut" && (
        <p className="graph-note">
          Showing {sampled.count.toLocaleString()} of{" "}
          {records.length.toLocaleString()} points (all anomalies prioritized)
        </p>
      )}
    </section>
  );
}
