import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

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
  const [rememberDevice, setRememberDevice] = useState(false);
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
    <div className="qb-admin-auth-page qb-admin-auth-login-page">
      <div className="qb-admin-auth-bg-panel" />

      <div className="qb-admin-auth-login-shell">
        <header className="qb-admin-auth-brand">
          <span className="qb-admin-auth-brand-mark">QB</span>
          <div>
            <h1>QuickBazaar</h1>
            <p>Admin Portal Login</p>
          </div>
        </header>

        <section className="qb-admin-auth-login-card">
          {error && <div className="qb-admin-auth-alert error">{error}</div>}

          <form onSubmit={handleSubmit} className="qb-admin-auth-form">
            <label htmlFor="admin-login-email">Email Address</label>
            <input
              id="admin-login-email"
              type="email"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              required
              placeholder="admin@quickbazaar.com"
            />

            <div className="qb-admin-auth-inline-label">
              <label htmlFor="admin-login-password">Password</label>
              <a href="mailto:support@quickbazaar.com">Forgot Password?</a>
            </div>
            <input
              id="admin-login-password"
              type="password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              required
              placeholder="********"
            />

            <label className="qb-admin-auth-checkbox" htmlFor="remember-device">
              <input
                id="remember-device"
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
              />
              <span>Remember this device</span>
            </label>

            <button type="submit" className="qb-admin-auth-submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In to Dashboard"}
            </button>
          </form>

          <div className="qb-admin-auth-security">
            <small>Security Verified</small>
            <p>SSL Encrypted | Safe Access</p>
          </div>
        </section>

        <p className="qb-admin-auth-back-row">
          Not an admin? <Link to="/login">Back to Customer Login</Link>
        </p>

        <footer className="qb-admin-auth-footer">
          <span>© 2024 QuickBazaar Admin Portal</span>
          <a href="#0">Support</a>
          <a href="#0">Terms of Service</a>
          <a href="#0">Privacy Policy</a>
        </footer>

        <div className="qb-admin-auth-home-link">
          <button type="button" onClick={() => navigate("/")}>Back to Store</button>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
