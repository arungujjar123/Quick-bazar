import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function Cart() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [promoCode, setPromoCode] = useState("");
  const { removeFromCart, updateCartItem, fetchCartCount } = useCart();
  const navigate = useNavigate();

  const getPlaceholderImage = (label) => {
    const text = (label || "Item").toString().slice(0, 16);
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240">' +
      '<defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#efe6dd"/><stop offset="100%" stop-color="#dfd1c3"/></linearGradient></defs>' +
      '<rect width="100%" height="100%" fill="url(#g)"/>' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#7c6654" font-family="Arial" font-size="24">' +
      text +
      "</text></svg>";
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  const fetchCart = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`${API_BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCart(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching cart:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemoveFromCart = async (productId) => {
    setUpdatingItems((prev) => new Set([...prev, productId]));
    const result = await removeFromCart(productId);
    if (result.success) {
      setMessage(result.message);
      fetchCart(); // Refresh cart data
    } else {
      setMessage(result.message);
    }
    setUpdatingItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
    setTimeout(() => setMessage(""), 3000);
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      return handleRemoveFromCart(productId);
    }

    setUpdatingItems((prev) => new Set([...prev, productId]));
    const result = await updateCartItem(productId, newQuantity);
    if (result.success) {
      setMessage(result.message);
      fetchCart(); // Refresh cart data
    } else {
      setMessage(result.message);
    }
    setUpdatingItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
    setTimeout(() => setMessage(""), 3000);
  };

  const calculateTotal = () => {
    return cart.items
      .reduce((total, item) => {
        return total + item.product.price * item.quantity;
      }, 0)
      .toFixed(2);
  };

  const subtotal = Number(calculateTotal());
  const estTaxes = Number((subtotal * 0.08).toFixed(2));
  const grandTotal = Number((subtotal + estTaxes).toFixed(2));

  const shopName =
    cart.items[0]?.product?.shop?.name || "Your Selected Local Partner";

  const handleClearItems = async () => {
    for (const item of cart.items) {
      // Keep this sequential to avoid race updates from overlapping cart requests.
      // eslint-disable-next-line no-await-in-loop
      await removeFromCart(item.product._id);
    }
    fetchCart();
    fetchCartCount();
  };

  const proceedToCheckout = () => {
    if (cart.items.length === 0) {
      setMessage("Your cart is empty");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading your cart...</div>
      </div>
    );
  }

  return (
    <div className="qb-cart-modern-page fade-in">
      <div className="qb-cart-modern-shell">
        <header className="qb-cart-modern-header">
          <h1>My Shopping Bag</h1>
          <p>Review your artisanal selections from local makers.</p>
        </header>

        {message && (
          <div
            className={
              message.toLowerCase().includes("failed") ||
              message.toLowerCase().includes("error")
                ? "error-message"
                : "success-message"
            }
          >
            {message}
          </div>
        )}

        {cart.items.length === 0 ? (
          <div className="empty-state qb-cart-empty-state">
            <h3>Your cart is empty</h3>
            <p>Add products to continue with checkout.</p>
            <button onClick={() => navigate("/")} className="btn btn-primary" type="button">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="qb-cart-modern-grid">
            <section className="qb-cart-modern-left">
              <article className="qb-single-shop-policy">
                <h3>Single Shop Policy</h3>
                <p>
                  To ensure quality and timely delivery, you can only checkout
                  from one shop at a time. All items currently in your bag are
                  from <strong>{shopName}</strong>.
                </p>
              </article>

              <div className="qb-cart-shop-row">
                <div>
                  <h3>{shopName}</h3>
                  <span>Verified Local Maker</span>
                </div>
                <button type="button" onClick={handleClearItems}>
                  Clear Items
                </button>
              </div>

              <div className="qb-cart-items-list">
                {cart.items.map((item) => {
                  const itemTotal = (item.product.price * item.quantity).toFixed(2);
                  const isUpdating = updatingItems.has(item.product._id);

                  return (
                    <article key={item.product._id} className="qb-cart-item-card">
                      <img
                        src={item.product.imageUrl || item.product.image || getPlaceholderImage(item.product.name)}
                        alt={item.product.name}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = getPlaceholderImage(item.product.name);
                        }}
                      />

                      <div className="qb-cart-item-main">
                        <div className="qb-cart-item-head">
                          <h4>{item.product.name}</h4>
                          <button
                            type="button"
                            className="qb-cart-remove"
                            onClick={() => handleRemoveFromCart(item.product._id)}
                            disabled={isUpdating}
                            aria-label="Remove item"
                          >
                            Remove
                          </button>
                        </div>

                        <p>
                          {(item.product.description || "Local artisan product")
                            .toString()
                            .slice(0, 55)}
                        </p>

                        <div className="qb-cart-item-bottom">
                          <div className="qb-cart-qty-control">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateQuantity(item.product._id, item.quantity - 1)
                              }
                              disabled={isUpdating}
                            >
                              −
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateQuantity(item.product._id, item.quantity + 1)
                              }
                              disabled={isUpdating}
                            >
                              +
                            </button>
                          </div>

                          <strong>${itemTotal}</strong>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="qb-cart-benefits-row">
                <article>
                  <h4>Eco-Friendly Packaging</h4>
                  <p>We use compostable materials for your artisan orders.</p>
                </article>
                <article>
                  <h4>Same-Day Delivery</h4>
                  <p>Order within the next 2 hours for delivery tonight.</p>
                </article>
              </div>
            </section>

            <aside className="qb-cart-summary-panel">
              <h3>Order Summary</h3>

              <div className="qb-cart-summary-lines">
                <div>
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div>
                  <span>Shipping</span>
                  <span>Calculated at next step</span>
                </div>
                <div>
                  <span>Est. Taxes</span>
                  <span>${estTaxes.toFixed(2)}</span>
                </div>
                <div className="total">
                  <strong>Total</strong>
                  <strong>${grandTotal.toFixed(2)}</strong>
                </div>
              </div>

              <div className="qb-cart-promo-row">
                <input
                  value={promoCode}
                  onChange={(event) => setPromoCode(event.target.value)}
                  placeholder="Promo code"
                />
                <button type="button">Apply</button>
              </div>

              <button
                type="button"
                className="qb-cart-checkout-btn"
                onClick={proceedToCheckout}
              >
                Proceed to Checkout
              </button>

              <p className="qb-cart-support-note">
                Need help? <button onClick={() => navigate("/")}>Contact Artisan Support</button>
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
// This page displays the cart with enhanced UI and better functionality.
