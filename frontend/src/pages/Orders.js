import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

      // Remove the deleted order from the state
      setOrders(orders.filter((order) => order._id !== orderId));
      alert("Order deleted successfully!");
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
      <div className="container">
        <div className="loading">Loading your orders...</div>
      </div>
    );
  }

  return (
    <div className="container fade-in">
      <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "#333" }}>
        Your Order History
      </h2>

      {orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>When you make your first purchase, it will appear here!</p>
          <button onClick={() => navigate("/")} className="btn btn-primary">
            Start Shopping
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {orders.map((order) => (
            <div key={order._id} className="cart-container">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                <div>
                  <h3 style={{ color: "#333", marginBottom: "0.5rem" }}>
                    Order #{order._id.slice(-6).toUpperCase()}
                  </h3>
                  <p style={{ color: "#666", fontSize: "0.9rem" }}>
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: "bold",
                      color: "var(--accent-3)",
                    }}
                  >
                    $
                    {order.total_amount
                      ? order.total_amount.toFixed(2)
                      : order.total.toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleDeleteOrder(order._id)}
                    disabled={deletingOrderId === order._id}
                    className="btn btn-danger"
                    style={{
                      fontSize: "0.9rem",
                      padding: "0.5rem 1rem",
                      opacity: deletingOrderId === order._id ? 0.6 : 1,
                    }}
                  >
                    {deletingOrderId === order._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>

              <div>
                <h4 style={{ color: "#333", marginBottom: "1rem" }}>Items:</h4>
                {order.items
                  .filter((item) => item.product) // Filter out items with null products
                  .map((item, index) => (
                    <div key={item.product._id || index} className="cart-item">
                      <div className="cart-item-info">
                        <div className="cart-item-name">
                          {item.product?.name || "Product no longer available"}
                        </div>
                        <div className="cart-item-quantity">
                          Quantity: {item.quantity}
                        </div>
                      </div>
                      <div className="cart-item-price">
                        $
                        {item.product?.price
                          ? (item.product.price * item.quantity).toFixed(2)
                          : "N/A"}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button onClick={() => navigate("/")} className="btn btn-primary">
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default Orders;
// This page displays all user orders with beautiful formatting and order details.
