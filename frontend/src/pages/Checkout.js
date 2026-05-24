import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";
import "./CheckoutRedesign.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function Checkout() {
  const { cartItems, clearCart } = useCart();
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0,
  );
  const shippingPrice = shippingMethod === "express" ? 150 : 50;
  const tax = subtotal * 0.18;
  const total = subtotal + shippingPrice + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    const orderData = {
      items: cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      total_amount: total,
      shipping_address: `${address.street}, ${address.city}, ${address.state} - ${address.zipCode}`,
      payment_method: paymentMethod,
    };

    try {
      await axios.post(`${API_BASE_URL}/api/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      clearCart();
      alert("Order placed successfully!");
      navigate("/profile");
    } catch (err) {
      alert("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="qb-checkout-page fade-in">
      <div className="container">
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Checkout</h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Almost there! Complete your payment details to finalize the order.</p>
        </header>

        <form onSubmit={handleSubmit} className="qb-checkout-grid">
          <div className="qb-checkout-steps">
            {/* Step 1: Shipping */}
            <section className="qb-checkout-card">
              <h2><div className="qb-step-number">1</div> Shipping Information</h2>
              <div className="qb-form-grid">
                <div className="qb-input-group" style={{ gridColumn: 'span 2' }}>
                  <label>Street Address</label>
                  <input required placeholder="House No, Area, Street" value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} />
                </div>
                <div className="qb-input-group">
                  <label>City</label>
                  <input required placeholder="Mumbai" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} />
                </div>
                <div className="qb-input-group">
                  <label>State</label>
                  <input required placeholder="Maharashtra" value={address.state} onChange={(e) => setAddress({...address, state: e.target.value})} />
                </div>
                <div className="qb-input-group">
                  <label>Pincode</label>
                  <input required placeholder="400001" value={address.zipCode} onChange={(e) => setAddress({...address, zipCode: e.target.value})} />
                </div>
                <div className="qb-input-group">
                  <label>Phone Number</label>
                  <input required placeholder="+91" value={address.phone} onChange={(e) => setAddress({...address, phone: e.target.value})} />
                </div>
              </div>

              <div style={{ marginTop: '2.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>Shipping Method</h3>
                <div className="qb-shipping-options">
                  <div className={`qb-shipping-card ${shippingMethod === 'standard' ? 'active' : ''}`} onClick={() => setShippingMethod('standard')}>
                    <strong>Standard Delivery</strong>
                    <p>Estimated 3-5 business days</p>
                    <span className="qb-shipping-price">₹50</span>
                  </div>
                  <div className={`qb-shipping-card ${shippingMethod === 'express' ? 'active' : ''}`} onClick={() => setShippingMethod('express')}>
                    <strong>Express Delivery</strong>
                    <p>Next day guaranteed</p>
                    <span className="qb-shipping-price">₹150</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 2: Payment */}
            <section className="qb-checkout-card">
              <h2><div className="qb-step-number">2</div> Payment Details</h2>
              <div className="qb-payment-methods">
                <button type="button" className={`qb-method-btn ${paymentMethod === 'card' ? 'active' : ''}`} onClick={() => setPaymentMethod('card')}>
                  Credit / Debit Card
                </button>
                <button type="button" className={`qb-method-btn ${paymentMethod === 'upi' ? 'active' : ''}`} onClick={() => setPaymentMethod('upi')}>
                  UPI Payment
                </button>
                <button type="button" className={`qb-method-btn ${paymentMethod === 'cod' ? 'active' : ''}`} onClick={() => setPaymentMethod('cod')}>
                  Cash on Delivery
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div className="qb-card-input-wrapper">
                  <div className="qb-input-group" style={{ marginBottom: '1.5rem' }}>
                    <label>Cardholder Name</label>
                    <input placeholder="Full Name on Card" />
                  </div>
                  <div className="qb-input-group" style={{ marginBottom: '1.5rem' }}>
                    <label>Card Number</label>
                    <input placeholder="0000 0000 0000 0000" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="qb-input-group">
                      <label>Expiry Date</label>
                      <input placeholder="MM / YY" />
                    </div>
                    <div className="qb-input-group">
                      <label>CVV</label>
                      <input placeholder="***" type="password" />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Order Preview Sidebar */}
          <aside>
            <div className="qb-order-preview">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>Order Preview</h3>
              <div className="qb-preview-list">
                {cartItems.map(item => (
                  <div key={item.product._id} className="qb-preview-item">
                    <img src={item.product.imageUrl || item.product.image} alt={item.product.name} />
                    <div className="qb-preview-info">
                      <strong>{item.product.name}</strong>
                      <span>Qty: {item.quantity} · ₹{(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '2rem', paddingTop: '1.5rem' }}>
                <div className="qb-summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="qb-summary-row">
                  <span>Shipping ({shippingMethod})</span>
                  <span>₹{shippingPrice.toFixed(2)}</span>
                </div>
                <div className="qb-summary-row">
                  <span>GST (18%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="qb-total-badge">
                <span>Grand Total</span>
                <strong>₹{total.toFixed(2)}</strong>
              </div>

              <button type="submit" disabled={loading} className="qb-btn-pay">
                {loading ? "Processing..." : `Secure Payment · ₹${total.toFixed(2)}`}
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1.5rem', fontWeight: 600 }}>
                🔒 Encrypted Secure Checkout
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}

export default Checkout;
