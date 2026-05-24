import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./AuthRedesign.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qb-auth-page fade-in">
      {/* Left Hero Side */}
      <div className="qb-auth-hero">
        <img 
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop" 
          className="qb-auth-hero-img"
          alt="Artisanal Marketplace" 
        />
        <div className="qb-auth-hero-card">
          <div className="icon-box">🎒</div>
          <h1>QuickBazaar</h1>
          <p>
            Experience the finest artisanal quality from local neighborhood makers. 
            Curated, fresh, and delivered with care.
          </p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="qb-auth-form-side">
        <div className="qb-auth-form-shell">
          <Link to="/" className="qb-auth-back-link">← Back to Home</Link>
          <h2>Welcome Back</h2>
          <p>Sign in to continue your artisanal journey.</p>

          <div className="qb-auth-toggle">
            <button type="button" className="active">
              Customer
            </button>
            <button type="button" onClick={() => navigate("/admin/login")}>
              Merchant / Admin
            </button>
          </div>

          {error && <div className="qb-auth-alert error">{error}</div>}

          <form onSubmit={handleLogin} className="qb-auth-form">
            <div className="qb-auth-group">
              <label>Email Address</label>
              <div className="qb-auth-input-wrapper">
                <span className="input-icon">✉</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@example.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="qb-auth-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Password</label>
                <Link to="#0" style={{ fontSize: '0.8rem', color: 'var(--qb-purple)', textDecoration: 'none', fontWeight: 700 }}>Forgot?</Link>
              </div>
              <div className="qb-auth-input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="qb-auth-submit-btn" disabled={loading}>
              {loading ? "Signing In..." : "Sign In →"}
            </button>
          </form>

          <div className="qb-auth-switch-row">
            Don't have an account? <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
