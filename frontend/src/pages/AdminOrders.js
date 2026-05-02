import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

      // Update local state
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

    if (diffMinutes < 60) return `${diffMinutes} mins ago`;
    const hours = Math.floor(diffMinutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
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

  const todayNewCount = orders.filter((order) => {
    if (!order.createdAt) return false;
    const created = new Date(order.createdAt);
    const now = new Date();
    return created.toDateString() === now.toDateString();
  }).length;

  const statusClass = (status) => {
    const normalized = (status || "pending").toLowerCase();
    if (["processing", "shipped", "delivered", "cancelled", "pending"].includes(normalized)) {
      return normalized;
    }
    return "pending";
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="qb-admin-shell">
      <aside className="qb-admin-left-rail">
        <div className="qb-admin-left-brand">
          <h2>Bazaar Admin</h2>
          <p>Management Portal</p>
        </div>

        <nav className="qb-admin-left-nav">
          <button type="button" onClick={() => navigate("/admin/dashboard")}>Dashboard</button>
          <button type="button" onClick={() => navigate("/admin/products")}>Products</button>
          <button type="button" className="active" onClick={() => navigate("/admin/orders")}>Orders</button>
          <button type="button" onClick={() => navigate("/admin/categories")}>Categories</button>
          <button type="button" onClick={() => navigate("/admin/shops")}>Settings</button>
          <button type="button">Support</button>
        </nav>

        <div className="qb-admin-left-bottom with-secondary">
          <button type="button" onClick={() => navigate("/")}>View Shop</button>
          <button type="button" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="qb-admin-content orders">
        <header className="qb-admin-content-header">
          <div>
            <h1>Order Management</h1>
            <p>Review and fulfill your customer requests.</p>
          </div>
          <div className="qb-admin-order-searchbar">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search Order ID..."
            />
            <button type="button">⛭</button>
          </div>
        </header>

        <section className="qb-orders-layout">
          <div className="qb-orders-list-area">
            <div className="qb-orders-list-header-row">
              <h2>Recent Orders</h2>
              <span>{todayNewCount} New Today</span>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="empty-state">
                <h3>No orders found</h3>
                <p>Try searching with a different order id or customer.</p>
              </div>
            ) : (
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
                        <p>
                          {order.items?.length || 0} item(s) · ${amount} · {formatElapsed(order.createdAt)}
                        </p>
                        <span className={`status ${statusClass(status)}`}>{status}</span>
                      </div>

                      <div className="meta">
                        <small>
                          {order.shipping_address ? "Express Delivery" : "Standard Post"}
                        </small>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="qb-order-detail-pane">
            {!selectedOrder ? (
              <div className="empty-state">
                <p>Select an order to view details.</p>
              </div>
            ) : (
              <>
                <div className="qb-order-detail-header">
                  <small>Active Order Details</small>
                  <h3>Order #QB-{selectedOrder._id.slice(-4).toUpperCase()}</h3>
                  <p>Status: {selectedOrder.order_status || "pending"}</p>
                </div>

                <div className="qb-order-detail-body">
                  <h4>Order Summary</h4>
                  <div className="items">
                    {selectedOrder.items
                      .filter((item) => item.product)
                      .map((item, index) => (
                        <div key={item.product?._id || index} className="item-row">
                          <img
                            src={item.product?.imageUrl || item.product?.image}
                            alt={item.product?.name || "Product"}
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                          <div>
                            <strong>{item.product?.name || "Product"}</strong>
                            <p>Qty: {item.quantity}</p>
                          </div>
                          <span>${Number((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                  </div>

                  <div className="total-row">
                    <strong>Total Amount</strong>
                    <strong>${Number(selectedOrder.total_amount || selectedOrder.total || 0).toFixed(2)}</strong>
                  </div>

                  <h4>Update Status</h4>
                  <button
                    type="button"
                    className="primary"
                    disabled={updatingOrder === selectedOrder._id}
                    onClick={() => updateOrderStatus(selectedOrder._id, "shipped")}
                  >
                    {updatingOrder === selectedOrder._id ? "Updating..." : "Mark as Shipped"}
                  </button>

                  <div className="inline-actions">
                    <button type="button">Label</button>
                    <button type="button">Notify</button>
                  </div>

                  <button
                    type="button"
                    className="danger-outline"
                    disabled={updatingOrder === selectedOrder._id}
                    onClick={() => updateOrderStatus(selectedOrder._id, "cancelled")}
                  >
                    Cancel Order
                  </button>

                  <div className="internal-note">
                    <strong>Internal Note</strong>
                    <p>
                      Customer requested eco-friendly packaging for this order.
                      Ensure no plastic wrap is used during fulfillment.
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
