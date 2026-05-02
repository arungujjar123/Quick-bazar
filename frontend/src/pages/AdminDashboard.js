import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const adminInfo = (() => {
    try {
      return JSON.parse(localStorage.getItem("adminInfo") || "{}");
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    checkAdminAuth();
    fetchDashboardStats();
  }, []);

  const checkAdminAuth = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
  };

  const fetchDashboardStats = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Safely extract stats and recentOrders from response
      const { stats: responseStats, recentOrders } = response.data;

      setStats({
        totalProducts: responseStats?.totalProducts || 0,
        totalOrders: responseStats?.totalOrders || 0,
        totalUsers: responseStats?.totalUsers || 0,
        totalRevenue: responseStats?.totalRevenue || 0,
        pendingOrders: responseStats?.pendingOrders || 0,
        recentOrders: recentOrders || [],
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      } else {
        // Set default values on error to prevent crashes
        setStats({
          totalProducts: 0,
          totalOrders: 0,
          totalUsers: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          recentOrders: [],
        });
      }
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/admin/login");
  };

  const getStatusClass = (status) => {
    const normalized = (status || "pending").toLowerCase();
    if (normalized === "delivered") return "delivered";
    if (normalized === "processing") return "processing";
    if (normalized === "shipped") return "shipped";
    if (normalized === "cancelled") return "cancelled";
    return "pending";
  };

  const getInitials = (name) => {
    if (!name) return "US";
    const words = name.trim().split(" ").filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  };

  const filteredOrders = (stats.recentOrders || []).filter((order) => {
    const orderCode = `QB-${(order._id || "").slice(-4).toUpperCase()}`;
    const customer = order.user?.name || order.user?.email || "Unknown";
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      orderCode.toLowerCase().includes(query) ||
      customer.toLowerCase().includes(query)
    );
  });

  const totalSales = Number(stats.totalRevenue || 0);
  const activeOrders = Number(stats.pendingOrders || 0);
  const totalProducts = Number(stats.totalProducts || 0);
  const newCustomers = Number(stats.totalUsers || 0);

  const fulfillmentRate = Math.min(
    98,
    stats.totalOrders > 0
      ? Math.round(((stats.totalOrders - activeOrders) / stats.totalOrders) * 100)
      : 92,
  );
  const customerSatisfaction = Math.min(5, Math.max(4.2, 4.6 + activeOrders * 0.02));
  const inventoryLevel = totalProducts > 100 ? "Good" : totalProducts > 40 ? "Medium" : "Low";

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard qb-admin-modern">
      <aside className="qb-admin-sidebar">
        <div className="qb-admin-brand-block">
          <h2>Admin Portal</h2>
          <p>Manage your marketplace</p>
        </div>

        <nav className="qb-admin-menu">
          <button className="active" onClick={() => navigate("/admin/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/admin/products")}>Products</button>
          <button onClick={() => navigate("/admin/orders")}>Orders</button>
          <button onClick={() => navigate("/admin/categories")}>Categories</button>
          <button onClick={() => navigate("/admin/shops")}>Shop Settings</button>
        </nav>

        <div className="qb-admin-sidebar-bottom">
          <button>Support</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="qb-admin-main">
        <header className="qb-admin-topbar">
          <h1>Dashboard</h1>
          <div className="qb-admin-topbar-right">
            <div className="qb-admin-order-search">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search orders..."
              />
            </div>
            <div className="qb-admin-user-chip">
              <div>
                <strong>{adminInfo.name || "Store Manager"}</strong>
                <span>{adminInfo.email || "STORE MANAGER"}</span>
              </div>
              <div className="qb-admin-avatar">
                {getInitials(adminInfo.name || "Manager")}
              </div>
            </div>
          </div>
        </header>

        <section className="qb-admin-actions-row">
          <button className="orange" onClick={() => navigate("/admin/add-product")}>
            Add Product
          </button>
          <button className="green" onClick={() => navigate("/admin/orders")}>
            Manage Orders
          </button>
          <button className="neutral" onClick={() => navigate("/")}>
            View Shop
          </button>
        </section>

        <section className="qb-admin-stats-grid">
          <article className="qb-admin-stat-box">
            <h4>Total Sales</h4>
            <strong>${totalSales.toLocaleString()}</strong>
            <span className="trend positive">+12% vs last month</span>
          </article>
          <article className="qb-admin-stat-box">
            <h4>Active Orders</h4>
            <strong>{activeOrders}</strong>
            <span className="trend warning">{Math.max(1, activeOrders)} urgent</span>
          </article>
          <article className="qb-admin-stat-box">
            <h4>Total Products</h4>
            <strong>{totalProducts.toLocaleString()}</strong>
            <span className="trend positive">+18 added this week</span>
          </article>
          <article className="qb-admin-stat-box">
            <h4>New Customers</h4>
            <strong>{newCustomers}</strong>
            <span className="trend positive">+8% growth rate</span>
          </article>
        </section>

        <section className="qb-admin-content-grid">
          <article className="qb-admin-orders-card">
            <div className="qb-admin-card-header">
              <h3>Recent Orders</h3>
              <button onClick={() => navigate("/admin/orders")}>View All Orders</button>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="empty-state" style={{ margin: "1rem 0" }}>
                <p>No matching orders found.</p>
              </div>
            ) : (
              <table className="qb-admin-orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const customerName =
                      order.user?.name || order.user?.email || "Unknown";
                    const status = (order.order_status || order.status || "pending").toLowerCase();
                    const amount =
                      order.total_amount || order.totalAmount || order.total || 0;

                    return (
                      <tr key={order._id}>
                        <td className="order-id">QB-{order._id.slice(-4).toUpperCase()}</td>
                        <td>
                          <div className="customer-cell">
                            <span className="avatar">{getInitials(customerName)}</span>
                            <span>{customerName}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`mini-status ${getStatusClass(status)}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td>${Number(amount).toFixed(2)}</td>
                        <td>
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </article>

          <aside className="qb-admin-right-rail">
            <article className="qb-admin-health-card">
              <h3>Store Health</h3>

              <div className="health-row">
                <div>
                  <span>Fulfillment Rate</span>
                  <strong>{fulfillmentRate}%</strong>
                </div>
                <div className="bar"><span style={{ width: `${fulfillmentRate}%` }} /></div>
              </div>

              <div className="health-row">
                <div>
                  <span>Customer Satisfaction</span>
                  <strong>{customerSatisfaction.toFixed(1)}/5.0</strong>
                </div>
                <div className="bar"><span style={{ width: `${(customerSatisfaction / 5) * 100}%` }} /></div>
              </div>

              <div className="health-row">
                <div>
                  <span>Inventory Level</span>
                  <strong>{inventoryLevel}</strong>
                </div>
                <div className="bar"><span style={{ width: inventoryLevel === "Good" ? "76%" : inventoryLevel === "Medium" ? "48%" : "24%" }} /></div>
              </div>

              <div className="recommendation-box">
                Recommendation: Restock handcrafted categories soon. Only 3 units
                remaining in low-stock groups.
              </div>
            </article>

            <article className="qb-admin-featured-card">
              <div>
                <span>Featured Product</span>
                <h4>Rustic Earth Ceramic Set</h4>
                <p>Edit listing</p>
              </div>
            </article>
          </aside>
        </section>

        <footer className="qb-admin-footer">
          <div>
            <h4>QuickBazaar</h4>
            <p>
              The modern heritage marketplace for artisanal goods and local
              treasures.
            </p>
          </div>
          <div>
            <h5>System</h5>
            <a href="#">Documentation</a>
            <a href="#">API Keys</a>
          </div>
          <div>
            <h5>Support</h5>
            <a href="#">Help Center</a>
            <a href="#">Community</a>
          </div>
          <div>
            <h5>Legal</h5>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default AdminDashboard;
