import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useCart } from "./context/CartContext";
import "./HomeRedesign.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItemCount, clearCart } = useCart();
  const token = localStorage.getItem("token");
  const [userName, setUserName] = useState("");
  const [savedLocation, setSavedLocation] = useState("Mumbai, MH");

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

    const detectLocation = async () => {
      const city = localStorage.getItem("qb_location_city");
      if (city && city !== "San Jose, CA") {
        setSavedLocation(city);
      } else {
        try {
          // Auto-detect location via IP if not set
          const res = await axios.get("https://ipapi.co/json/");
          if (res.data && res.data.city) {
            const loc = `${res.data.city}, ${res.data.region_code || res.data.country_code}`;
            setSavedLocation(loc);
            localStorage.setItem("qb_location_city", loc);
          }
        } catch (err) {
          console.error("Location detection failed:", err);
          // Fallback to Mumbai if detection fails
          setSavedLocation("Mumbai, MH");
        }
      }
    };

    detectLocation();
  }, [token]);

  const handleLocationChange = () => {
    const newCity = window.prompt("Enter your city (e.g., Mumbai, MH):", savedLocation);
    if (newCity && newCity !== savedLocation) {
      setSavedLocation(newCity);
      localStorage.setItem("qb_location_city", newCity);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    clearCart();
    navigate("/login");
  };

  return (
    <nav className="qb-nav-redesign">
      <Link to="/" className="qb-nav-brand-redesign">
        QuickBazaar
      </Link>

      <div className="qb-nav-links-redesign">
        <Link to="/categories">Categories</Link>
        <Link to="/offers">Offers</Link>
        <Link to="/orders">My Orders</Link>
      </div>

      <div className="qb-nav-search-redesign">
        <i>🔍</i>
        <input 
          type="text" 
          placeholder="Search products..." 
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
              navigate(`/categories?q=${encodeURIComponent(e.target.value.trim())}`);
            }
          }}
        />
      </div>

      <div className="qb-nav-actions-redesign">
        <button 
          className="qb-nav-icon-btn" 
          title="Change Location"
          onClick={handleLocationChange}
        >
          <span>📍</span>
          <small style={{ fontSize: '0.75rem', fontWeight: 600 }}>{savedLocation}</small>
        </button>

        {token ? (
          <Link to="/profile" className="qb-nav-icon-btn" title="Profile">
            <span>👤</span>
          </Link>
        ) : (
          <Link to="/login" className="qb-nav-icon-btn" title="Login">
            <span>👤</span>
          </Link>
        )}

        <button className="qb-nav-icon-btn" title="Notifications">
          <span>🔔</span>
        </button>

        <Link to="/cart" className="qb-nav-cart-btn">
          <span>🛒</span>
          Cart
          {cartItemCount > 0 && (
            <span style={{ 
              background: 'white', 
              color: 'var(--qb-blue)', 
              borderRadius: '50%', 
              width: '20px', 
              height: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '0.7rem'
            }}>
              {cartItemCount}
            </span>
          )}
        </Link>
        
        {token && (
          <button onClick={handleLogout} style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--qb-text-muted)', 
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
