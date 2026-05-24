import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./AuthRedesign.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the Terms of Service and Privacy Policy");
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        {
          name,
          email,
          phone,
          password,
        },
      );

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qb-auth-page fade-in">
      {/* Left Hero Side */}
      <div className="qb-auth-hero">
        <img 
          src="https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?q=80&w=2070&auto=format&fit=crop" 
          className="qb-auth-hero-img"
          alt="Fresh Groceries" 
        />
        <div className="qb-auth-hero-card">
          <div className="icon-box">🥗</div>
          <h1>Join QuickBazaar</h1>
          <p>
            Start your journey with local artisans today. 
            Get fresh, hand-crafted essentials delivered to your door.
          </p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="qb-auth-form-side" style={{ overflowY: 'auto' }}>
        <div className="qb-auth-form-shell">
          <Link to="/" className="qb-auth-back-link">← Back to Home</Link>
          <h2>Create Account</h2>
          <p>Join our community of artisanal quality.</p>

          <div className="qb-auth-toggle">
            <button type="button" className="active">
              Customer
            </button>
            <button type="button" onClick={() => navigate("/admin/register")}>
              Merchant / Admin
            </button>
          </div>

          {error && <div className="qb-auth-alert error">{error}</div>}
          {success && <div className="qb-auth-alert success">{success}</div>}

          <form onSubmit={handleRegister} className="qb-auth-form">
            <div className="qb-auth-group">
              <label>Full Name</label>
              <div className="qb-auth-input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="qb-auth-grid">
              <div className="qb-auth-group">
                <label>Email Address</label>
                <div className="qb-auth-input-wrapper">
                  <span className="input-icon">✉</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="qb-auth-group">
                <label>Phone Number</label>
                <div className="qb-auth-input-wrapper">
                  <span className="input-icon">📞</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="qb-auth-grid">
              <div className="qb-auth-group">
                <label>Password</label>
                <div className="qb-auth-input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>
              </div>
              <div className="qb-auth-group">
                <label>Confirm Password</label>
                <div className="qb-auth-input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="qb-auth-checkbox-row">
              <input
                id="agree-terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <span htmlFor="agree-terms">
                I agree to the <a href="#0" style={{ color: 'var(--qb-purple)', textDecoration: 'none' }}>Terms of Service</a> and <a href="#0" style={{ color: 'var(--qb-purple)', textDecoration: 'none' }}>Privacy Policy</a>.
              </span>
            </div>

            <button type="submit" className="qb-auth-submit-btn" disabled={loading}>
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <div className="qb-auth-switch-row">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
