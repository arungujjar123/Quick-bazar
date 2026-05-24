import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminShared.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function AdminSupport() {
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  const handleSync = async () => {
    setSyncing(true);
    const token = localStorage.getItem("adminToken");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/support/sync`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus(response.data);
      alert("AI Knowledge Base synchronized successfully!");
    } catch (error) {
      console.error("Sync error:", error);
      alert("Failed to sync AI knowledge base.");
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

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
          <button className="active" onClick={() => navigate("/admin/support")}>🤖 AI Agent</button>
          <button onClick={() => navigate("/admin/categories")}>📁 Categories</button>
          <button onClick={() => navigate("/admin/settings")}>⚙️ Settings</button>
        </nav>
        <div className="qb-admin-sidebar-bottom">
          <button onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      <main className="qb-admin-main">
        <header className="qb-admin-topbar">
          <div>
            <h1>AI Agent Management</h1>
            <p>Control the intelligence and knowledge base of your shopping assistant.</p>
          </div>
        </header>

        <section className="qb-admin-card" style={{ maxWidth: '800px' }}>
          <h3>Knowledge Base Synchronization</h3>
          <p style={{ color: 'var(--admin-text-muted)', marginBottom: '2rem', marginTop: '0.5rem' }}>
            Syncing rebuilds the AI's understanding of your products, support documents, and store policies. 
            Run this after significant inventory changes.
          </p>
          
          <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '20px', border: '1px solid var(--admin-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>RAG Vector Engine</strong>
                <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>🟢 Operational</span>
              </div>
              <button 
                className="qb-admin-btn-add" 
                onClick={handleSync} 
                disabled={syncing}
                style={{ background: syncing ? '#cbd5e1' : 'var(--grad-premium)' }}
              >
                {syncing ? '⌛ Synchronizing...' : '🔄 Rebuild Knowledge Base'}
              </button>
            </div>
            
            {status && (
              <div className="sync-results" style={{ marginTop: '2rem', padding: '1rem', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Last Sync Results:</h4>
                <ul style={{ fontSize: '0.9rem', color: 'var(--admin-text-muted)', paddingLeft: '1.5rem' }}>
                  <li>Products Indexed: {status.summary?.productsCount || 'N/A'}</li>
                  <li>Support Docs Synced: {status.summary?.docsCount || 'N/A'}</li>
                  <li>Vector Store Rebuilt: {status.vectorStoreRebuilt ? 'Yes' : 'No'}</li>
                </ul>
              </div>
            )}
          </div>
        </section>

        <section className="qb-admin-card" style={{ maxWidth: '800px', marginTop: '2rem' }}>
          <h3>Agentic Workflows</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div className="qb-admin-stat-card" style={{ padding: '1.5rem' }}>
              <strong>Product Comparison</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>Enabled</p>
            </div>
            <div className="qb-admin-stat-card" style={{ padding: '1.5rem' }}>
              <strong>Order Tracking</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>Enabled</p>
            </div>
            <div className="qb-admin-stat-card" style={{ padding: '1.5rem' }}>
              <strong>Image Search</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>Enabled</p>
            </div>
            <div className="qb-admin-stat-card" style={{ padding: '1.5rem' }}>
              <strong>Smart Cart</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>Enabled</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminSupport;
