import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminAuthRedesign.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function AdminLogin() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/login`,
        credentials,
      );
      localStorage.setItem("adminToken", response.data.token);
      if (response.data.admin) {
        localStorage.setItem("adminInfo", JSON.stringify(response.data.admin));
      }
      navigate("/admin/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qb-admin-auth-page fade-in">
      {/* Left Hero Side */}
      <div className="qb-admin-auth-hero">
        <img 
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop" 
          alt="Grocery Background" 
        />
        <div className="qb-admin-auth-hero-card">
          <div className="icon">🛒</div>
          <h1>QuickBazaar</h1>
          <p>
            Elevating local commerce with global standards. 
            Curated, clean, and connected.
          </p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="qb-admin-auth-form-side">
        <div className="qb-admin-auth-form-shell">
          <h2>Welcome Back</h2>
          <p>Enter your details to access your account.</p>

          <div className="qb-admin-auth-toggle">
            <button type="button" onClick={() => navigate("/login")}>
              Customer
            </button>
            <button type="button" className="active">
              Merchant / Admin
            </button>
          </div>

          {error && <div className="qb-admin-auth-error-box">{error}</div>}

          <form onSubmit={handleSubmit} className="qb-admin-auth-form">
            <div className="qb-admin-auth-group">
              <label>Email Address</label>
              <div className="qb-admin-auth-input-wrapper">
                <span>✉</span>
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  placeholder="hello@example.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="qb-admin-auth-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Password</label>
                <a href="#0" style={{ fontSize: '0.8rem', color: '#4f46e5', textDecoration: 'none', fontWeight: 700 }}>Forgot?</a>
              </div>
              <div className="qb-admin-auth-input-wrapper">
                <span>🔒</span>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="qb-admin-auth-submit-btn" disabled={loading}>
              {loading ? "Signing In..." : "Sign In →"}
            </button>
          </form>

          <div className="qb-admin-auth-switch-link">
            Don't have an account? <Link to="/admin/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
