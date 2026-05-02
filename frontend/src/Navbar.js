import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "./context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItemCount, clearCart } = useCart();
  const token = localStorage.getItem("token");
  const [userName, setUserName] = useState("");
  const [savedLocation, setSavedLocation] = useState("San Francisco, CA");

  const profileInitial = userName
    ? userName.trim().charAt(0).toUpperCase()
    : "U";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserName(parsed.name || "");
      } catch {
        setUserName("");
      }
    } else {
      setUserName("");
    }

    const city = localStorage.getItem("qb_location_city");
    if (city) {
      setSavedLocation(city);
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    clearCart();
    navigate("/login");
  };

  const isHome = location.pathname === "/";
  const query = new URLSearchParams(location.search);
  const activeView = query.get("view") || "shop";

  const isTabActive = (tab) => {
    if (!isHome) return false;
    if (tab === "shop") {
      return activeView === "shop" || activeView === "";
    }
    return activeView === tab;
  };

  const isCategoriesPage = location.pathname === "/categories";

  return (
    <nav className="qb-nav">
      <div className="qb-nav-content">
        <Link to="/" className="qb-nav-brand">
          QuickBazaar
        </Link>

        <div className="qb-nav-tabs">
          <Link to="/" className={isTabActive("shop") ? "active" : ""}>
            Shop
          </Link>
          <Link to="/categories" className={isCategoriesPage ? "active" : ""}>
            Categories
          </Link>
          <Link
            to="/?view=deals"
            className={isTabActive("deals") ? "active" : ""}
          >
            Local Deals
          </Link>
          <Link
            to="/?view=makers"
            className={isTabActive("makers") ? "active" : ""}
          >
            Makers
          </Link>
        </div>

        <div className="qb-nav-actions">
          <span className="qb-location-pill">{savedLocation}</span>

          <Link to="/cart" className="qb-icon-link" aria-label="Cart">
            Cart
            {cartItemCount > 0 && (
              <span className="qb-cart-badge">{cartItemCount}</span>
            )}
          </Link>

          {token ? (
            <>
              <Link
                to="/orders"
                className="qb-icon-link"
                aria-label="Orders"
              >
                Orders
              </Link>
              <Link to="/profile" className="qb-profile-chip">
                <span className="qb-profile-avatar">{profileInitial}</span>
                <span>{userName || "Profile"}</span>
              </Link>
              <button onClick={handleLogout} className="qb-logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="qb-auth-link">
                Login
              </Link>
              <Link to="/register" className="qb-auth-link highlight">
                Register
              </Link>
            </>
          )}

          {(!token || localStorage.getItem("adminToken")) && (
            <Link to="/admin/login" className="qb-admin-link">
              Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
