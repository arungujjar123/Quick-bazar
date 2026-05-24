import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminShared.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function AdminShops() {
  const [shop, setShop] = useState({
    name: "QuickBazaar Store",
    description: "Premium Artisan Marketplace",
    contactEmail: "admin@quickbazaar.com",
    contactPhone: "+91 98765 43210",
    address: "123, Marketplace St, Mumbai",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  if (loading) return <div className="qb-admin-shell"><div className="loading" style={{ margin: 'auto' }}>Loading Configurations...</div></div>;

  return (
    <div className="qb-admin-shell fade-in">
      <aside className="qb-admin-sidebar">
        <div className="qb-admin-brand-block">
          <div className="logo-icon">QB</div>
          <div><h2>QuickBazaar</h2><p>Admin Portal</p></div>
        </div>
        <nav className="qb-admin-menu">
          <button onClick={() => navigate("/admin/dashboard")}>📊 Dashboard</button>
          <button onClick={() => navigate("/admin/products")}>📦 Inventory</button>
          <button onClick={() => navigate("/admin/orders")}>🧾 Orders</button>
          <button onClick={() => navigate("/admin/categories")}>📁 Categories</button>
          <button className="active" onClick={() => navigate("/admin/settings")}>⚙️ Settings</button>
        </nav>
        <div className="qb-admin-sidebar-bottom">
          <button onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      <main className="qb-admin-main">
        <header className="qb-admin-topbar">
          <div>
            <h1>Store Settings</h1>
            <p>Manage your marketplace identity and operational details.</p>
          </div>
        </header>

        <section className="qb-admin-card" style={{ maxWidth: '800px' }}>
          <h3 style={{ marginBottom: '2rem' }}>Identity & Branding</h3>
          <div className="qb-admin-toolbar-search" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="qb-input-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Marketplace Name</label>
              <input 
                style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--admin-border)' }}
                value={shop.name} 
                onChange={(e) => setShop({...shop, name: e.target.value})}
              />
            </div>
            <div className="qb-input-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Public Description</label>
              <textarea 
                style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--admin-border)', minHeight: '100px' }}
                value={shop.description} 
                onChange={(e) => setShop({...shop, description: e.target.value})}
              ></textarea>
            </div>
            <div className="qb-input-group">
              <label style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Support Email</label>
              <input 
                style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--admin-border)' }}
                value={shop.contactEmail} 
                onChange={(e) => setShop({...shop, contactEmail: e.target.value})}
              />
            </div>
            <div className="qb-input-group">
              <label style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Support Phone</label>
              <input 
                style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--admin-border)' }}
                value={shop.contactPhone} 
                onChange={(e) => setShop({...shop, contactPhone: e.target.value})}
              />
            </div>
          </div>
          <button className="qb-admin-btn-add" style={{ marginTop: '2rem' }}>💾 Save Configurations</button>
        </section>

        <section className="qb-admin-card" style={{ maxWidth: '800px', marginTop: '2.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#ef4444' }}>Danger Zone</h3>
          <p style={{ color: 'var(--admin-text-muted)', marginBottom: '1.5rem' }}>Once you delete a store, there is no going back. Please be certain.</p>
          <button style={{ padding: '0.85rem 1.5rem', borderRadius: '12px', border: '1.5px solid #ef4444', background: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}>
            Deactivate Marketplace
          </button>
        </section>
      </main>
    </div>
  );
}

export default AdminShops;
