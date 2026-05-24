import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./OrdersRedesign.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [navigate]);

  const fetchOrders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        setLoading(false);
      });
  };

  const handleDeleteOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone.",
      )
    ) {
      return;
    }

    const token = localStorage.getItem("token");
    setDeletingOrderId(orderId);

    try {
      await axios.delete(
        `${API_BASE_URL}/api/orders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setOrders(orders.filter((order) => order._id !== orderId));
    } catch (err) {
      console.error("Error deleting order:", err);
      alert("Failed to delete order. Please try again.");
    } finally {
      setDeletingOrderId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="qb-orders-page">
        <div className="loading">Loading your orders...</div>
      </div>
    );
  }

  return (
    <div className="qb-orders-page fade-in">
      <div className="qb-orders-shell">
        <header className="qb-orders-header">
          <h1>My Order History</h1>
          <p>Tracking your artisanal journey through our local makers.</p>
        </header>

        {orders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders yet</h3>
            <p>When you make your first purchase, it will appear here!</p>
            <button onClick={() => navigate("/")} className="btn-premium btn-premium-primary">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="qb-orders-list">
            {orders.map((order) => (
              <div key={order._id} className="qb-order-card">
                <div className="qb-order-card-header">
                  <div>
                    <div className="qb-order-id">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </div>
                    <div className="qb-order-date">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className="qb-order-meta">
                    <div className="qb-order-amount">
                      ₹
                      {(order.total_amount || order.total || 0).toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      disabled={deletingOrderId === order._id}
                      className="qb-order-delete-btn"
                    >
                      {deletingOrderId === order._id ? "Deleting..." : "Delete Order"}
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="qb-order-items-title">Ordered Items</h4>
                  <div className="qb-order-items-grid">
                    {order.items
                      .filter((item) => item.product)
                      .map((item, index) => (
                        <div key={item.product._id || index} className="qb-order-item-row">
                          <div className="qb-order-item-info">
                            <div className="qb-order-item-name">
                              {item.product?.name || "Product no longer available"}
                            </div>
                            <div className="qb-order-item-qty">
                              Quantity: {item.quantity}
                            </div>
                          </div>
                          <div className="qb-order-item-price">
                            ₹
                            {item.product?.price
                              ? (item.product.price * item.quantity).toFixed(2)
                              : "N/A"}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="qb-orders-footer">
          <button onClick={() => navigate("/")} className="qb-btn-shopping">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default Orders;
// This page displays all user orders with beautiful formatting and order details.
