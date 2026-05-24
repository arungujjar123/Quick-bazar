import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminShared.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();
    fetchOrders();
  }, []);

  const checkAdminAuth = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setOrders(response.data);
      if (response.data.length > 0) {
        setSelectedOrderId(response.data[0]._id);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      }
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    const token = localStorage.getItem("adminToken");

    try {
      await axios.put(
        `${API_BASE_URL}/api/admin/orders/${orderId}`,
        { order_status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, order_status: newStatus } : order,
        ),
      );

      alert(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/admin/login");
  };

  const getInitials = (name) => {
    if (!name) return "US";
    const words = name.trim().split(" ").filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  };

  const formatElapsed = (dateString) => {
    if (!dateString) return "Unknown";
    const now = Date.now();
    const date = new Date(dateString).getTime();
    const diffMinutes = Math.max(1, Math.floor((now - date) / (1000 * 60)));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const hours = Math.floor(diffMinutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return orders;

    return orders.filter((order) => {
      const idText = `QB-${order._id.slice(-4).toUpperCase()}`.toLowerCase();
      const customer = (order.user?.name || order.user?.email || "").toLowerCase();
      return idText.includes(query) || customer.includes(query);
    });
  }, [orders, searchTerm]);

  const selectedOrder =
    orders.find((order) => order._id === selectedOrderId) || filteredOrders[0] || null;

  if (loading) {
    return (
      <div className="qb-admin-shell">
        <div className="loading" style={{ margin: 'auto' }}>Loading Order Stream...</div>
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
          <button onClick={() => navigate("/admin/dashboard")}>📊 Dashboard</button>
          <button onClick={() => navigate("/admin/products")}>📦 Inventory</button>
          <button className="active" onClick={() => navigate("/admin/orders")}>🧾 Orders</button>
          <button onClick={() => navigate("/admin/support")}>🤖 AI Agent</button>
          <button onClick={() => navigate("/admin/customers")}>👥 Customers</button>
          <button onClick={() => navigate("/admin/categories")}>📁 Categories</button>
          <button onClick={() => navigate("/admin/settings")}>⚙️ Settings</button>
        </nav>
        <div className="qb-admin-sidebar-bottom">
          <button onClick={() => navigate("/")}>🏠 View Store</button>
          <button onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="qb-admin-main">
        <header className="qb-admin-topbar">
          <div>
            <h1>Order Management</h1>
            <p>Review and fulfill your customer requests.</p>
          </div>
          <div className="qb-admin-toolbar-search">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Order ID or Customer..."
            />
          </div>
        </header>

        <section className="qb-orders-layout">
          <div className="qb-orders-list-area">
            <div className="qb-orders-list-header-row">
              <h3>Recent Orders</h3>
              <span>{filteredOrders.length} Found</span>
            </div>

            <div className="qb-order-cards-list">
              {filteredOrders.map((order) => {
                const status = (order.order_status || "pending").toLowerCase();
                const amount = Number(order.total_amount || order.total || 0).toFixed(2);
                const customer = order.user?.name || order.user?.email || "Unknown";
                const orderCode = `QB-${order._id.slice(-4).toUpperCase()}`;

                return (
                  <article
                    key={order._id}
                    className={`qb-order-list-card ${selectedOrder?._id === order._id ? "active" : ""}`}
                    onClick={() => setSelectedOrderId(order._id)}
                  >
                    <div className="avatar">{getInitials(customer)}</div>
                    <div className="content">
                      <h4>{orderCode} - {customer}</h4>
                      <p>₹{amount} · {formatElapsed(order.createdAt)}</p>
                      <span className={`status-badge ${status}`}>{status}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="qb-order-detail-pane">
            {!selectedOrder ? (
              <div className="empty-state" style={{ textAlign: 'center', marginTop: '4rem' }}>
                <p>Select an order to view full details.</p>
              </div>
            ) : (
              <>
                <div className="qb-order-detail-header">
                  <small>ORDER LOG</small>
                  <h3>Order #QB-{selectedOrder._id.slice(-4).toUpperCase()}</h3>
                  <span className={`status-badge ${selectedOrder.order_status?.toLowerCase()}`}>
                    {selectedOrder.order_status || "Pending"}
                  </span>
                </div>

                <div className="qb-order-detail-body">
                  <h4>Order Summary</h4>
                  <div className="items">
                    {selectedOrder.items
                      .filter((item) => item.product)
                      .map((item, index) => (
                        <div key={item.product?._id || index} className="item-row">
                          <img src={item.product?.imageUrl || item.product?.image} alt="Product" />
                          <div style={{ flex: 1 }}>
                            <strong>{item.product?.name || "Product"}</strong>
                            <p>Qty: {item.quantity}</p>
                          </div>
                          <strong>₹{Number((item.product?.price || 0) * item.quantity).toFixed(2)}</strong>
                        </div>
                      ))}
                  </div>

                  <div className="total-row">
                    <strong>Total Amount</strong>
                    <strong style={{ color: 'var(--admin-primary)' }}>
                      ₹{Number(selectedOrder.total_amount || selectedOrder.total || 0).toFixed(2)}
                    </strong>
                  </div>

                  <h4>Actions</h4>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      className="qb-admin-btn-add"
                      style={{ flex: 1 }}
                      disabled={updatingOrder === selectedOrder._id}
                      onClick={() => updateOrderStatus(selectedOrder._id, "shipped")}
                    >
                      Mark as Shipped
                    </button>
                    <button
                      className="qb-admin-btn-add"
                      style={{ flex: 1, background: '#ef4444' }}
                      disabled={updatingOrder === selectedOrder._id}
                      onClick={() => updateOrderStatus(selectedOrder._id, "cancelled")}
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="internal-note" style={{ marginTop: '2rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '16px' }}>
                    <strong>Merchant Note</strong>
                    <p style={{ margin: '0.5rem 0 0', color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>
                      Verified address. Standard packaging requested.
                    </p>
                  </div>
                </div>
              </>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
}

export default AdminOrders;
