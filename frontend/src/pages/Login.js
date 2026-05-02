import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        {
          email,
          password,
        },
      );

      localStorage.setItem("token", response.data.token);

      // Fetch user profile and store in localStorage for navbar
      try {
        const profileRes = await axios.get(
          `${API_BASE_URL}/api/auth/profile`,
          { headers: { Authorization: `Bearer ${response.data.token}` } },
        );
        localStorage.setItem("user", JSON.stringify(profileRes.data));
      } catch {
        localStorage.removeItem("user");
      }

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qb-auth-page">
      <div className="qb-auth-orb left" />
      <div className="qb-auth-orb right" />

      <div className="qb-auth-shell qb-auth-shell-login">
        <header className="qb-auth-brand qb-auth-brand-center">QuickBazaar</header>

        <section className="qb-auth-card">
          <h1>Welcome Back</h1>
          <p>Discover artisanal quality at your doorstep</p>

          <div className="qb-auth-role-toggle" role="tablist" aria-label="Role">
            <button type="button" className="active" aria-selected="true">
              Customer
            </button>
            <button
              type="button"
              aria-selected="false"
              onClick={() => navigate("/admin/login")}
            >
              Admin
            </button>
          </div>

          {error && <div className="qb-auth-error">{error}</div>}

          <form onSubmit={handleLogin} className="qb-auth-form">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@quickbazaar.com"
              required
              disabled={loading}
            />

            <div className="qb-auth-inline-label">
              <label htmlFor="login-password">Password</label>
              <a href="mailto:support@quickbazaar.com">Forgot password?</a>
            </div>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />

            <label className="qb-auth-checkbox" htmlFor="keep-logged-in">
              <input
                id="keep-logged-in"
                type="checkbox"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
              />
              <span>Keep me logged in</span>
            </label>

            <button type="submit" className="qb-auth-submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="qb-auth-divider">OR CONTINUE WITH</div>

          <div className="qb-auth-socials">
            <button type="button">Google</button>
            <button type="button">Apple</button>
          </div>

          <p className="qb-auth-switch">
            Don&apos;t have an account? <Link to="/register">Register</Link>
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

export default Login;
