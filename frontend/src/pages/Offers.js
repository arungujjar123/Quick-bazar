import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./OffersRedesign.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function Offers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products`);
        setProducts(response.data || []);
      } catch (error) {
        console.error("Offers data load error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToCart = async (e, productId, productName) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await addToCart(productId, 1);
    if (result.success) {
      alert(`${productName} added to cart!`);
    } else {
      alert(result.message || "Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="qb-offers-page">
        <div className="qb-loading-state" style={{ textAlign: 'center', padding: '5rem' }}>
          <div className="qb-loading-spinner" />
          <p style={{ color: '#666', fontStyle: 'italic', marginTop: '1rem' }}>Loading best deals for you...</p>
        </div>
      </div>
    );
  }

  // Generate fake discounts for display purposes if backend doesn't provide them
  const dealProducts = products.map((p, index) => {
    const discount = [10, 15, 20, 25, 30][index % 5];
    const oldPrice = p.price + (p.price * discount / 100);
    return { ...p, discount, oldPrice };
  }).slice(0, 8); // Just show top 8 as deals

  return (
    <div className="qb-offers-page fade-in">
      {/* Hero Section */}
      <section className="qb-offers-hero">
        <div className="qb-offers-hero-content">
          <span className="qb-offers-badge">Limited Time Only</span>
          <h1>Exclusive <span>Deals</span> & Offers</h1>
          <p>Grab the best discounts on premium local products. Hurry, these deals won't last long!</p>
        </div>
      </section>

      {/* Deals Grid */}
      <section className="qb-offers-section">
        <div className="qb-offers-header">
          <h2>🔥 Deals of the Day</h2>
        </div>
        
        {dealProducts.length === 0 ? (
           <div className="qb-empty-state" style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>No active deals found.</div>
        ) : (
          <div className="qb-product-grid-redesign">
            {dealProducts.map(product => (
              <article key={product._id} className="qb-product-card-redesign" onClick={() => navigate(`/product/${product._id}`)} style={{ cursor: 'pointer' }}>
                <div className="qb-sale-badge">{product.discount}% OFF</div>
                <img src={product.imageUrl || product.image || "https://via.placeholder.com/300?text=Product"} alt={product.name} className="qb-product-card-img" />
                <h3>{product.name}</h3>
                <p>{product.category || 'Local Product'}</p>
                <div className="qb-product-card-price-row">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.8rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{product.oldPrice.toFixed(2)}</span>
                    <strong style={{ color: '#e11d48' }}>₹{Number(product.price).toFixed(2)}</strong>
                  </div>
                  <button className="qb-add-btn" onClick={(e) => handleAddToCart(e, product._id, product.name)}>+</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Promotional Banners */}
      <section className="qb-promo-banners">
        <div className="qb-promo-banner qb-promo-1">
          <div className="qb-promo-text">
            <h3>Weekend Bazaar Sale</h3>
            <p>Up to 40% off on Artisanal Bakery items</p>
            <Link to="/categories?q=bakery" className="qb-promo-btn">Shop Bakery</Link>
          </div>
        </div>
        <div className="qb-promo-banner qb-promo-2">
          <div className="qb-promo-text">
            <h3>Fresh Farm Direct</h3>
            <p>Buy 2 Get 1 Free on all Organic Produce</p>
            <Link to="/categories?q=fresh" className="qb-promo-btn">Shop Produce</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Offers;
