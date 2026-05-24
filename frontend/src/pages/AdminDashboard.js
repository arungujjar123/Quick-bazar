import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminShared.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    activeProducts: 0,
    newCustomers: 0,
    recentOrders: [],
    lowStockItems: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchDashboardStats();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      }
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="qb-admin-shell">
        <div className="loading" style={{ margin: 'auto', fontSize: '1.2rem', fontWeight: 700 }}>
          Synchronizing Portal Data...
        </div>
      </div>
    );
  }

  return (
    <div className="qb-admin-shell fade-in">
      {/* Sidebar */}
      <aside className="qb-admin-sidebar">
        <div className="qb-admin-brand-block">
          <div className="logo-icon">QB</div>
          <div>
            <h2>QuickBazaar</h2>
            <p>Admin Portal</p>
          </div>
        </div>

        <button className="qb-admin-btn-add" onClick={() => navigate("/admin/add-product")}>
          + Create Listing
        </button>

        <nav className="qb-admin-menu">
          <button className="active" onClick={() => navigate("/admin/dashboard")}>
            <span>📊</span> Dashboard
          </button>
          <button onClick={() => navigate("/admin/products")}>
            <span>📦</span> Inventory
          </button>
          <button onClick={() => navigate("/admin/orders")}>
            <span>🧾</span> Orders
          </button>
          <button onClick={() => navigate("/admin/support")}>
            <span>🤖</span> AI Agent
          </button>
          <button onClick={() => navigate("/admin/customers")}>
            <span>👥</span> Customers
          </button>
          <button onClick={() => navigate("/admin/categories")}>
            <span>📁</span> Categories
          </button>
          <button onClick={() => navigate("/admin/settings")}>
            <span>⚙️</span> Settings
          </button>
        </nav>

        <div className="qb-admin-sidebar-bottom">
          <button onClick={() => navigate("/")}>
            <span>🏠</span> View Store
          </button>
          <button onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="qb-admin-main">
        <header className="qb-admin-topbar">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Welcome back! Here's what's happening today.</p>
          </div>
          <div className="qb-admin-topbar-right">
            <div className="qb-admin-search-box">
              <input type="text" placeholder="Quick search..." />
              <i>🔍</i>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Admin User</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Super Admin</div>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" 
                alt="Profile" 
                style={{ width: 44, height: 44, borderRadius: '12px' }}
              />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="qb-admin-stats-grid">
          <div className="qb-admin-stat-card">
            <div className="header">
              <span>TOTAL SALES</span>
              <div className="icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>₹</div>
            </div>
            <strong>₹{stats.totalSales?.toLocaleString() || '0'}</strong>
            <div className="trend positive">↗ 12.5% vs last week</div>
          </div>

          <div className="qb-admin-stat-card">
            <div className="header">
              <span>TOTAL ORDERS</span>
              <div className="icon-box" style={{ background: '#eff6ff', color: '#3b82f6' }}>📦</div>
            </div>
            <strong>{stats.totalOrders || '0'}</strong>
            <div className="trend positive">↗ 8.2% vs last week</div>
          </div>

          <div className="qb-admin-stat-card">
            <div className="header">
              <span>ACTIVE PRODUCTS</span>
              <div className="icon-box" style={{ background: '#fef2f2', color: '#ef4444' }}>🛍</div>
            </div>
            <strong>{stats.activeProducts || '0'}</strong>
            <div className="trend stable">→ No change</div>
          </div>

          <div className="qb-admin-stat-card">
            <div className="header">
              <span>CUSTOMERS</span>
              <div className="icon-box" style={{ background: '#fdf4ff', color: '#a855f7' }}>👥</div>
            </div>
            <strong>{stats.newCustomers || '0'}</strong>
            <div className="trend positive">↗ 4.1% vs last week</div>
          </div>
        </section>

        <div className="qb-admin-content-grid">
          {/* Recent Orders */}
          <div className="qb-admin-card">
            <div className="qb-admin-card-header">
              <h3>Recent Orders</h3>
              <button onClick={() => navigate("/admin/orders")}>View All Orders</button>
            </div>
            <table className="qb-admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders?.length > 0 ? (
                  stats.recentOrders.map(order => (
                    <tr key={order._id}>
                      <td style={{ fontWeight: 700 }}>#QB-{order._id.slice(-4).toUpperCase()}</td>
                      <td>{order.user?.name || 'Guest Customer'}</td>
                      <td>
                        <span className={`status-badge ${(order.order_status || 'pending').toLowerCase()}`}>
                          {order.order_status || 'Pending'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800 }}>₹{order.total_amount?.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                      No recent orders to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Side Panels */}
          <div>
            <div className="qb-admin-card">
              <div className="qb-admin-card-header">
                <h3>System Health</h3>
              </div>
              <div className="health-metrics">
                <div className="metric-item">
                  <div className="metric-header">
                    <span>Server Uptime</span>
                    <span>99.9%</span>
                  </div>
                  <div className="metric-bar-bg">
                    <div className="metric-bar-fill" style={{ width: '99.9%', background: '#10b981' }}></div>
                  </div>
                </div>
                <div className="metric-item">
                  <div className="metric-header">
                    <span>API Latency</span>
                    <span>124ms</span>
                  </div>
                  <div className="metric-bar-bg">
                    <div className="metric-bar-fill" style={{ width: '85%', background: '#3b82f6' }}></div>
                  </div>
                </div>
                <div className="metric-item">
                  <div className="metric-header">
                    <span>Storage Usage</span>
                    <span>42%</span>
                  </div>
                  <div className="metric-bar-bg">
                    <div className="metric-bar-fill" style={{ width: '42%', background: '#f59e0b' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="qb-admin-featured-item">
              <img 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=500&auto=format&fit=crop" 
                alt="Promotion" 
              />
              <div className="qb-admin-featured-content">
                <span className="featured-tag">Market Highlight</span>
                <h4>Artisanal Sourdough</h4>
                <p>Trending +40% this week</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
