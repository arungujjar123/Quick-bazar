import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import "./ProductDetailRedesign.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (product) {
      const result = await addToCart(product._id, quantity);
      if (result.success) {
        alert(`${product.name} added to cart!`);
      } else {
        alert(result.message || "Failed to add to cart");
      }
    }
  };

  if (loading) return <div className="qb-detail-page"><div className="container">Loading Product...</div></div>;
  if (!product) return <div className="qb-detail-page"><div className="container">Product not found.</div></div>;

  return (
    <div className="qb-detail-page fade-in">
      <div className="container">
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ← Back to Catalog
        </button>

        <div className="qb-detail-grid">
          {/* Gallery */}
          <div className="qb-detail-gallery">
            <div className="qb-main-img-wrapper">
              <img src={product.imageUrl || product.image} alt={product.name} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #f1f5f9', cursor: 'pointer' }}>
                  <img src={product.imageUrl || product.image} style={{ width: '100%', opacity: 0.6 }} alt="thumb" />
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="qb-detail-content">
            <span className="qb-detail-category">{product.category || 'Artisanal Selection'}</span>
            <h1 className="qb-detail-title">{product.name}</h1>
            
            <div className="qb-detail-rating">
              <div style={{ color: '#fbbf24' }}>★★★★★</div>
              <span style={{ color: 'var(--text-muted)' }}>(124 reviews)</span>
            </div>

            <div className="qb-detail-price">
              ₹{Number(product.price).toFixed(2)}
              {product.oldPrice && <span>₹{product.oldPrice}</span>}
            </div>

            <p className="qb-detail-desc">
              {product.description || "Indulge in our carefully curated selection, crafted with passion and the finest local ingredients. Each piece tells a story of tradition and exceptional quality, brought straight from our artisans to your doorstep."}
            </p>

            <div className="qb-detail-actions">
              <div className="qb-detail-qty">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}>+</button>
              </div>
              <button className="qb-btn-add-cart" onClick={handleAddToCart}>
                Add to Cart · ₹{(product.price * quantity).toFixed(2)}
              </button>
            </div>

            <div className="qb-detail-features">
              <div className="qb-feature-item">
                <div className="qb-feature-icon">🚚</div>
                <div>
                  <strong>Free Shipping</strong>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Orders over ₹500</p>
                </div>
              </div>
              <div className="qb-feature-item">
                <div className="qb-feature-icon">🌿</div>
                <div>
                  <strong>100% Organic</strong>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Local sourcing</p>
                </div>
              </div>
              <div className="qb-feature-item">
                <div className="qb-feature-icon">🛡️</div>
                <div>
                  <strong>Safe Payment</strong>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>100% Secure</p>
                </div>
              </div>
              <div className="qb-feature-item">
                <div className="qb-feature-icon">♻️</div>
                <div>
                  <strong>Eco Friendly</strong>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sustainable packaging</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
