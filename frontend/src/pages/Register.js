import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

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
    <div className="qb-auth-page">
      <div className="qb-auth-orb left" />
      <div className="qb-auth-orb right" />

      <div className="qb-auth-shell">
        <header className="qb-auth-brand">
          <span className="qb-auth-brand-mark">QB</span>
          <div>
            <strong>QuickBazaar</strong>
            <p>Join our community of artisanal quality.</p>
          </div>
        </header>

        <section className="qb-auth-card">
          <h1>Create Account</h1>
          <p>Please fill in your details to get started.</p>

          <div className="qb-auth-role-toggle" role="tablist" aria-label="Role">
            <button type="button" className="active" aria-selected="true">
              Customer
            </button>
            <button
              type="button"
              aria-selected="false"
              onClick={() => navigate("/admin/register")}
            >
              Admin
            </button>
          </div>

          {error && <div className="qb-auth-error">{error}</div>}
          {success && <div className="qb-auth-success">{success}</div>}

          <form onSubmit={handleRegister} className="qb-auth-form">
            <label htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              disabled={loading}
            />

            <label htmlFor="register-email">Email Address</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              disabled={loading}
            />

            <label htmlFor="register-phone">Phone Number</label>
            <input
              id="register-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              disabled={loading}
            />

            <div className="qb-auth-password-grid">
              <div>
                <label htmlFor="register-password">Password</label>
                <input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
              <div>
                <label htmlFor="register-confirm-password">Confirm</label>
                <input
                  id="register-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="qb-auth-info-note">
              Admins will be verified by the marketplace team before gaining full
              access to dashboard features.
            </div>

            <label className="qb-auth-checkbox" htmlFor="agree-terms">
              <input
                id="agree-terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <span>
                I agree to the <a href="#0">Terms of Service</a> and
                <a href="#0"> Privacy Policy</a>
              </span>
            </label>

            <button type="submit" className="qb-auth-submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="qb-auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </section>

        <div className="qb-auth-bottom-links">
          <button type="button">Privacy Policy</button>
          <button type="button">Terms of Service</button>
          <button type="button">Contact Support</button>
        </div>
        <p className="qb-auth-copyright">
          © 2024 QuickBazaar. Artisanal Quality Guaranteed.
        </p>

        <div className="qb-auth-store-link">
          <Link to="/">Back to Store</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
