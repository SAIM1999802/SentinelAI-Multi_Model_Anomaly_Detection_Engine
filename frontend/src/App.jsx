import React, { useState } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import SummaryCards from './components/SummaryCards';
import AnomalyTable from './components/AnomalyTable';
import './App.css';

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Options object passes all params (file, algorithm, contamination, n_estimators, n_neighbors)
  const handleAnalyze = async (options) => {
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', options.file);
    formData.append('algorithm', options.algorithm);
    formData.append('contamination', options.contamination);
    formData.append('n_estimators', options.n_estimators);
    formData.append('n_neighbors', options.n_neighbors);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/detect-anomalies', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Backend Response:', response.data);
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 'Analysis failed. Make sure Backend is running on port 8000.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>SentinelAI - Multi-Model Anomaly Detection Engine</h2>

      {/* File Upload Component */}
      <FileUpload onAnalyze={handleAnalyze} loading={loading} />

      {/* Error Banner */}
      {error && (
        <div
          style={{
            color: 'red',
            border: '1px solid red',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            marginTop: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Summary Cards Component */}
      {data && data.summary && <SummaryCards summary={data.summary} />}

      {/* Anomaly Table Component */}
      {data && data.records && <AnomalyTable records={data.records} />}
    </div>
  );
}