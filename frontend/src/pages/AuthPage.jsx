import React, { useState } from "react";
import axios from "axios";
import "../styles/AuthPage.css";

export default function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = isLogin
      ? "http://127.0.0.1:8000/api/auth/login"
      : "http://127.0.0.1:8000/api/auth/signup";

    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const response = await axios.post(endpoint, payload);
      const { access_token, user } = response.data;

      // Save token and session details
      localStorage.setItem("sentinel_token", access_token);
      localStorage.setItem("sentinel_user", JSON.stringify(user));

      onLoginSuccess(user);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <h2>🛡️ SentinelAI</h2>
          <p>Cybersecurity Anomaly Detection Platform</p>
        </div>

        <div className="auth-toggle">
          <button
            className={`toggle-btn ${isLogin ? "active" : ""}`}
            onClick={() => { setIsLogin(true); setError(""); }}
          >
            Sign In
          </button>
          <button
            className={`toggle-btn ${!isLogin ? "active" : ""}`}
            onClick={() => { setIsLogin(false); setError(""); }}
          >
            Create Account
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="full_name"
                placeholder="Muhammad Saim"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="saim@sentinel.ai"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Login to Dashboard" : "Register Account"}
          </button>
        </form>
      </div>
    </div>
  );
}