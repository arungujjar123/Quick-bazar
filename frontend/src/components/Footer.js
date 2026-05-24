import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="qb-footer">
      <div className="qb-footer-main">
        <div className="qb-footer-brand">
          <Link to="/" className="qb-footer-logo">QuickBazaar</Link>
          <p>
            Bringing artisanal quality from local neighborhood makers straight to your doorstep. 
            Experience the freshness of hand-crafted essentials.
          </p>
          <div className="qb-footer-social">
            <a href="#0" aria-label="Facebook">FB</a>
            <a href="#0" aria-label="Instagram">IG</a>
            <a href="#0" aria-label="Twitter">TW</a>
          </div>
        </div>

        <div className="qb-footer-links">
          <div className="qb-footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/categories">Categories</Link></li>
              <li><Link to="/profile">My Account</Link></li>
              <li><Link to="/orders">Order History</Link></li>
            </ul>
          </div>

          <div className="qb-footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#0">Help Center</a></li>
              <li><a href="#0">Shipping Policy</a></li>
              <li><a href="#0">Returns & Refunds</a></li>
              <li><a href="#0">Contact Us</a></li>
            </ul>
          </div>

          <div className="qb-footer-col">
            <h4>Install App</h4>
            <p>Available on iOS and Android soon.</p>
            <div className="qb-app-badges">
              <div className="qb-badge-mock">App Store</div>
              <div className="qb-badge-mock">Google Play</div>
            </div>
          </div>
        </div>
      </div>

      <div className="qb-footer-bottom">
        <div className="qb-footer-legal">
          <span>© 2024 QuickBazaar. All rights reserved.</span>
          <div className="qb-legal-links">
            <a href="#0">Privacy Policy</a>
            <a href="#0">Terms of Service</a>
          </div>
        </div>
        <div className="qb-footer-payment">
          <span>Secure Payments:</span>
          <div className="qb-pay-icons">
            <span>UPI</span>
            <span>Cards</span>
            <span>COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
