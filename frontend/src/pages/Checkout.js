/*
 * =====================================================
 * CHECKOUT PAGE - Order Placement
 * =====================================================
 *
 * User yahan se apna order place karta hai
 * Features:
 * - Cart summary dikhaata hai
 * - Shipping address input
 * - Cash on Delivery (COD) checkout
 * - Order confirmation aur redirect to orders page
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function Checkout() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shipping, setShipping] = useState({
    fullName: "",
    phone: "",
    city: "",
    streetAddress: "",
  });
  const { fetchCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      setShipping((prev) => ({
        ...prev,
        fullName: userData.name || "",
      }));
    } catch {
      // no-op
    }

    axios
      .get(`${API_BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCart(res.data);
      })
      .catch((err) => {
        console.error("Error fetching cart:", err);
      });
  }, [navigate, location.state]);

  const subtotal = cart.items.reduce(
    (total, item) => total + (item.product?.price || 0) * item.quantity,
    0,
  );
  const shippingFee = subtotal > 0 ? 5 : 0;
  const taxEstimate = subtotal * 0.08;
  const totalAmount = subtotal + shippingFee + taxEstimate;

  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (
      !shipping.fullName.trim() ||
      !shipping.phone.trim() ||
      !shipping.city.trim() ||
      !shipping.streetAddress.trim()
    ) {
      setError("Please fill in all shipping details");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const composedAddress = `${shipping.fullName}, ${shipping.phone}, ${shipping.streetAddress}, ${shipping.city}`;

      await axios.post(
        `${API_BASE_URL}/api/orders/checkout`,
        {
          shipping_address: composedAddress,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      fetchCartCount();

      navigate("/orders", {
        state: {
          message:
            "✅ Order placed successfully! You will pay cash on delivery.",
        },
      });
    } catch (error) {
      console.error("Error during checkout:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to place order. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onFieldChange = (key, value) => {
    setShipping((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="qb-checkout-page fade-in">
      <div className="qb-checkout-shell">
        <header className="qb-checkout-header">
          <h1>Secure Checkout</h1>
          <p>
            Complete your purchase from our curated collection of artisanal
            essentials.
          </p>
        </header>

        {error && <div className="error-message">{error}</div>}

        {cart.items.length === 0 ? (
          <div className="empty-state qb-checkout-empty">
            <h3>Your cart is empty</h3>
            <p>Add products before proceeding to checkout.</p>
            <button onClick={() => navigate("/")} className="btn btn-primary" type="button">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="qb-checkout-grid">
            <section className="qb-checkout-left">
              <article className="qb-card">
                <h2>Shipping Details</h2>

                <label>Full Name</label>
                <input
                  value={shipping.fullName}
                  onChange={(event) => onFieldChange("fullName", event.target.value)}
                  placeholder="Jane Cooper"
                />

                <div className="qb-form-row">
                  <div>
                    <label>Phone Number</label>
                    <input
                      value={shipping.phone}
                      onChange={(event) => onFieldChange("phone", event.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div>
                    <label>City</label>
                    <input
                      value={shipping.city}
                      onChange={(event) => onFieldChange("city", event.target.value)}
                      placeholder="New York"
                    />
                  </div>
                </div>

                <label>Street Address</label>
                <textarea
                  rows={4}
                  value={shipping.streetAddress}
                  onChange={(event) =>
                    onFieldChange("streetAddress", event.target.value)
                  }
                  placeholder="45 Artisans Lane, Suite 200"
                />
              </article>

              <article className="qb-card">
                <h2>Payment Method</h2>

                <button type="button" className="qb-payment-option active">
                  <div>
                    <strong>Cash on Delivery</strong>
                    <p>Pay when your package arrives.</p>
                  </div>
                  <span>●</span>
                </button>

                <button type="button" className="qb-payment-option disabled" disabled>
                  <div>
                    <strong>Online Payment</strong>
                    <p>Currently under maintenance.</p>
                  </div>
                  <span>○</span>
                </button>
              </article>
            </section>

            <aside className="qb-checkout-right qb-card">
              <h2>Order Summary</h2>

              <div className="qb-order-items">
                {cart.items.map((item) => (
                  <div key={item.product?._id || Math.random()} className="qb-order-item">
                    <img
                      src={item.product?.imageUrl || item.product?.image}
                      alt={item.product?.name || "Product"}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                    <div>
                      <h4>{item.product?.name || "Product unavailable"}</h4>
                      <p>Quantity: {item.quantity}</p>
                      <strong>
                        ${Number((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="qb-order-totals">
                <div>
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div>
                  <span>Shipping Fee</span>
                  <span>${shippingFee.toFixed(2)}</span>
                </div>
                <div>
                  <span>Tax (Estimated)</span>
                  <span>${taxEstimate.toFixed(2)}</span>
                </div>
                <div className="total">
                  <strong>Total Amount</strong>
                  <strong>${totalAmount.toFixed(2)}</strong>
                </div>
              </div>

              <button
                type="button"
                className="qb-place-order-btn"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>

              <p className="qb-secure-note">Safe & secure transaction</p>

              <div className="qb-delivery-note">
                <strong>Fast Heritage Delivery</strong>
                <span>Estimated delivery in 2-4 business days.</span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default Checkout;

/*
 * =====================================================
 * CHECKOUT FLOW SUMMARY:
 * =====================================================
 *
 * 1. User cart se checkout page par aata hai
 * 2. Cart items aur total amount display hota hai
 * 3. User shipping address enter karta hai
 * 4. "Place Order" button click karta hai
 * 5. Backend API call → Order create hota hai
 * 6. Cart clear ho jata hai
 * 7. User orders page par redirect hota hai
 * 8. Payment: Cash on Delivery (COD)
 *
 * Note: Future mein payment gateway integrate kar sakte hain
 *
 * =====================================================
 */
