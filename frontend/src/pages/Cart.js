import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./CartRedesign.css";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0,
  );
  const shipping = subtotal > 0 ? 50 : 0;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className="qb-cart-page fade-in">
        <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🛒</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Your cart is empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontWeight: 600 }}>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/" className="qb-btn-checkout" style={{ display: 'inline-block', width: 'auto', padding: '1rem 2.5rem' }}>
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="qb-cart-page fade-in">
      <div className="container">
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Shopping Bag</h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Review your items before proceeding to checkout.</p>
        </header>

        <div className="qb-cart-grid">
          {/* Items List */}
          <section className="qb-cart-items-section">
            <div className="qb-cart-header">
              <h2>My Items</h2>
              <span>{cartItems.length} Products</span>
            </div>

            <div className="qb-cart-list">
              {cartItems.map((item) => (
                <div key={item.product._id} className="qb-cart-item">
                  <img 
                    src={item.product.imageUrl || item.product.image} 
                    alt={item.product.name} 
                    className="qb-cart-img"
                  />
                  <div className="qb-cart-info">
                    <h4>{item.product.name}</h4>
                    <p>{item.product.category || 'Artisanal Selection'}</p>
                    <button className="qb-remove-item" onClick={() => removeFromCart(item.product._id)}>
                      🗑 Remove
                    </button>
                  </div>
                  <div className="qb-qty-control">
                    <button onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>+</button>
                  </div>
                  <div className="qb-cart-price">
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Order Summary */}
          <aside className="qb-summary-card">
            <h3>Order Summary</h3>
            <div className="qb-summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="qb-summary-row">
              <span>Standard Shipping</span>
              <span>₹{shipping.toFixed(2)}</span>
            </div>
            <div className="qb-summary-row">
              <span>GST (18%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>

            <div className="qb-promo-box">
              <input type="text" placeholder="Promo Code" />
              <button>Apply</button>
            </div>

            <div className="qb-summary-row total">
              <span>Total Amount</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <button className="qb-btn-checkout" onClick={handleCheckout}>
              Proceed to Checkout →
            </button>

            <div className="qb-payment-badges">
              <span>Visa</span>
              <span>MasterCard</span>
              <span>UPI</span>
              <span>Rupay</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Cart;
