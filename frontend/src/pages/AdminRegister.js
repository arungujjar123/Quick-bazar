import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminAuthRedesign.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function AdminRegister() {
  const [formData, setFormData] = useState({
    name: "",
    shopName: "",
    email: "",
    password: "",
    confirmPassword: "",
    secretKey: "",
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (!agreeTerms) {
      setError("Please accept the merchant terms before continuing");
      setLoading(false);
      return;
    }

    try {
      const requestData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        secretKey: formData.secretKey,
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/admin/register`,
        requestData
      );

      if (response.data.success) {
        setSuccess("Account created successfully! Redirecting...");
        localStorage.setItem("adminToken", response.data.token);
        localStorage.setItem("adminInfo", JSON.stringify(response.data.admin));
        setTimeout(() => navigate("/admin/dashboard"), 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qb-admin-auth-page fade-in">
      {/* Left Hero Side */}
      <div className="qb-admin-auth-hero">
        <img 
          src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=2070&auto=format&fit=crop" 
          alt="Business Background" 
        />
        <div className="qb-admin-auth-hero-card">
          <div className="icon">🚀</div>
          <h1>QuickBazaar</h1>
          <p>
            Empower your local business. 
            Join our curated marketplace designed for modern artisans.
          </p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="qb-admin-auth-form-side" style={{ overflowY: 'auto' }}>
        <div className="qb-admin-auth-form-shell">
          <h2>Create Merchant Account</h2>
          <p>Start selling your artisanal products today.</p>

          <div className="qb-admin-auth-toggle">
            <button type="button" onClick={() => navigate("/register")}>
              Customer
            </button>
            <button type="button" className="active">
              Merchant / Admin
            </button>
          </div>

          {error && <div className="qb-admin-auth-error-box">{error}</div>}
          {success && (
            <div className="qb-admin-auth-error-box" style={{ background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="qb-admin-auth-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="qb-admin-auth-group">
                <label>Full Name</label>
                <div className="qb-admin-auth-input-wrapper">
                  <span>👤</span>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Rahul Sharma"
                    required
                  />
                </div>
              </div>
              <div className="qb-admin-auth-group">
                <label>Shop Name</label>
                <div className="qb-admin-auth-input-wrapper">
                  <span>🏪</span>
                  <input
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleChange}
                    placeholder="Artisan Goods"
                  />
                </div>
              </div>
            </div>

            <div className="qb-admin-auth-group">
              <label>Business Email</label>
              <div className="qb-admin-auth-input-wrapper">
                <span>✉</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rahul@business.com"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="qb-admin-auth-group">
                <label>Password</label>
                <div className="qb-admin-auth-input-wrapper">
                  <span>🔒</span>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <div className="qb-admin-auth-group">
                <label>Confirm</label>
                <div className="qb-admin-auth-input-wrapper">
                  <span>🔒</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="qb-admin-auth-group">
              <label>Admin Secret Key</label>
              <div className="qb-admin-auth-input-wrapper">
                <span>🔑</span>
                <input
                  type="password"
                  name="secretKey"
                  value={formData.secretKey}
                  onChange={handleChange}
                  placeholder="Provided by platform"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <input 
                type="checkbox" 
                checked={agreeTerms} 
                onChange={(e) => setAgreeTerms(e.target.checked)} 
                style={{ width: 20, height: 20 }}
              />
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                I agree to the <a href="#0" style={{ color: '#4f46e5', textDecoration: 'none' }}>Merchant Terms</a> and business data policy.
              </span>
            </div>

            <button type="submit" className="qb-admin-auth-submit-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account →"}
            </button>
          </form>

          <div className="qb-admin-auth-switch-link">
            Already have an account? <Link to="/admin/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;
