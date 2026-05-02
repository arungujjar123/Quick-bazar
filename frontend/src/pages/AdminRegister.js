import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

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

    // Validation
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
        // Show success message
        setSuccess(
          "Admin account created successfully! Redirecting to dashboard..."
        );

        // Store the admin token
        localStorage.setItem("adminToken", response.data.token);
        localStorage.setItem("adminInfo", JSON.stringify(response.data.admin));

        // Redirect to admin dashboard after a short delay
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qb-admin-auth-page qb-admin-auth-register-page">
      <header className="qb-admin-auth-topbar">
        <Link to="/" className="qb-admin-auth-top-brand">
          QuickBazaar
        </Link>
        <nav>
          <Link to="/admin/login">Login</Link>
          <Link to="/admin/register" className="active">
            Register
          </Link>
        </nav>
      </header>

      <main className="qb-admin-auth-register-shell">
        <aside className="qb-admin-auth-register-visual">
          <div className="qb-admin-auth-register-overlay" />
          <div className="qb-admin-auth-register-content">
            <h2>Empower Your Business</h2>
            <p>
              Join our curated marketplace designed for the modern artisan and
              forward-thinking retailer.
            </p>
            <ul>
              <li>
                <strong>Secure Verification</strong>
                <span>Verified within 24 hours for business integrity.</span>
              </li>
              <li>
                <strong>Advanced Analytics</strong>
                <span>Track sales, inventory, and trends in real-time.</span>
              </li>
            </ul>
          </div>
        </aside>

        <section className="qb-admin-auth-register-formwrap">
          <small>Merchant Registration</small>
          <h1>Create Admin Account</h1>
          <p>Complete your professional profile to start selling.</p>

          {error && <div className="qb-admin-auth-alert error">{error}</div>}
          {success && <div className="qb-admin-auth-alert success">{success}</div>}

          <form onSubmit={handleSubmit} className="qb-admin-auth-form">
            <div className="qb-admin-auth-grid-2">
              <div>
                <label htmlFor="admin-name">Full Name</label>
                <input
                  id="admin-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label htmlFor="admin-shop-name">Shop Name</label>
                <input
                  id="admin-shop-name"
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  placeholder="e.g. Artisan Goods Co."
                />
              </div>
            </div>

            <label htmlFor="admin-email">Business Email</label>
            <input
              id="admin-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="name@business.com"
            />

            <div className="qb-admin-auth-grid-2">
              <div>
                <label htmlFor="admin-password">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="********"
                />
              </div>
              <div>
                <label htmlFor="admin-confirm-password">Confirm Password</label>
                <input
                  id="admin-confirm-password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="********"
                />
              </div>
            </div>

            <label htmlFor="admin-secret-key">Admin Access Key</label>
            <input
              id="admin-secret-key"
              type="password"
              name="secretKey"
              value={formData.secretKey}
              onChange={handleChange}
              required
              placeholder="Platform-provided key"
            />

            <label className="qb-admin-auth-checkbox" htmlFor="admin-terms">
              <input
                id="admin-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>
                I agree to the <a href="#0">Merchant Terms of Service</a> and
                acknowledge the privacy policy regarding business data handling.
              </span>
            </label>

            <button type="submit" className="qb-admin-auth-submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Admin Account"}
            </button>

            <div className="qb-admin-auth-info-note">
              To ensure platform security, all new merchant accounts undergo a
              mandatory verification process. Your account will be reviewed and
              activated within 24 hours.
            </div>

            <p className="qb-admin-auth-switch-row">
              Already have an account? <Link to="/admin/login">Sign In</Link>
            </p>
          </form>
        </section>
      </main>

      <footer className="qb-admin-auth-register-footer">
        <strong>QuickBazaar Admin Portal</strong>
        <a href="#0">Support</a>
        <a href="#0">Terms of Service</a>
        <a href="#0">Privacy Policy</a>
        <span>© 2024 QuickBazaar Admin Portal</span>
      </footer>

      <div className="qb-admin-auth-home-link">
        <button type="button" onClick={() => navigate("/")}>Back to Store</button>
      </div>
    </div>
  );
}

export default AdminRegister;
