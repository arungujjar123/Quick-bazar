import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../HomeRedesign.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

// Mock images based on generated assets
const MOCK_IMAGES = {
  hero_bg: "C:\\Users\\hp pc\\.gemini\\antigravity\\brain\\76b1c5d2-7aa4-46db-89ef-4133c644ee0b\\grocery_shelf_blur_mockup_1777765179299.png",
  avocados: "C:\\Users\\hp pc\\.gemini\\antigravity\\brain\\76b1c5d2-7aa4-46db-89ef-4133c644ee0b\\hass_avocados_mockup_1777765009069.png",
  sourdough: "C:\\Users\\hp pc\\.gemini\\antigravity\\brain\\76b1c5d2-7aa4-46db-89ef-4133c644ee0b\\sourdough_loaf_mockup_1777765029247.png",
  paneer: "C:\\Users\\hp pc\\.gemini\\antigravity\\brain\\76b1c5d2-7aa4-46db-89ef-4133c644ee0b\\fresh_paneer_mockup_1777765049660.png",
  fruit_basket: "C:\\Users\\hp pc\\.gemini\\antigravity\\brain\\76b1c5d2-7aa4-46db-89ef-4133c644ee0b\\fruit_basket_mockup_1777765077703.png",
  baker: "C:\\Users\\hp pc\\.gemini\\antigravity\\brain\\76b1c5d2-7aa4-46db-89ef-4133c644ee0b\\artisan_baker_mockup_1777765104025.png",
  farm: "C:\\Users\\hp pc\\.gemini\\antigravity\\brain\\76b1c5d2-7aa4-46db-89ef-4133c644ee0b\\hydroponic_farm_mockup_1777765150053.png"
};

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationCity, setLocationCity] = useState("Mumbai, MH");
  const [pincode, setPincode] = useState("");
  const { addToCart } = useCart();
  const navigate = useNavigate();

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

  const handleFindLocal = () => {
    if (!pincode.trim()) {
      alert("Please enter a pin code or address");
      return;
    }
    // Update local storage so navbar and other components can use it
    localStorage.setItem("qb_location_city", pincode);
    setLocationCity(pincode);
    alert(`Showing results for: ${pincode}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const city = localStorage.getItem("qb_location_city") || "Mumbai, MH";
        setLocationCity(city);
        const response = await axios.get(`${API_BASE_URL}/api/products`);
        setProducts(response.data || []);
      } catch (error) {
        console.error("Home data load error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontStyle: 'italic', color: '#666' }}>
        Loading your local marketplace...
      </div>
    );
  }

  return (
    <div className="qb-home-container">
      {/* Hero Section */}
      <section className="qb-home-hero" style={{ backgroundImage: `url(${MOCK_IMAGES.hero_bg})` }}>
        <div className="qb-home-hero-content">
          <h1>Your Neighborhood, <br /> <span>Delivered</span></h1>
          <div className="qb-home-hero-search">
            <span style={{ marginLeft: '1rem' }}>📍</span>
            <input 
              type="text" 
              placeholder="Enter your pin code or address..." 
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFindLocal()}
            />
            <button type="button" onClick={handleFindLocal}>Find Local</button>
          </div>
          <div className="qb-home-hero-categories">
            <div className="qb-category-pill"><span>🍎</span> Fresh Produce</div>
            <div className="qb-category-pill"><span>🍞</span> Bakery</div>
            <div className="qb-category-pill"><span>📦</span> Daily Essentials</div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="qb-section-redesign">
        <div className="qb-section-header-redesign">
          <h2>Featured Products</h2>
          <Link to="/categories" className="qb-view-all">View all →</Link>
        </div>
        <div className="qb-product-grid-redesign">
          {products.length > 0 ? products.slice(0, 4).map(product => (
            <article key={product._id} className="qb-product-card-redesign" onClick={() => navigate(`/product/${product._id}`)} style={{ cursor: 'pointer' }}>
              <img src={product.imageUrl || product.image || MOCK_IMAGES.avocados} alt={product.name} className="qb-product-card-img" />
              <h3>{product.name}</h3>
              <p>{product.category || 'Local Product'}</p>
              <div className="qb-product-card-price-row">
                <strong>₹{Number(product.price).toFixed(2)}</strong>
                <button className="qb-add-btn" onClick={(e) => handleAddToCart(e, product._id, product.name)}>+</button>
              </div>
            </article>
          )) : (
            <div style={{ padding: '2rem', color: '#666' }}>No products available.</div>
          )}
        </div>
      </section>

      {/* Meet Your Makers */}
      <section className="qb-makers-section">
        <div className="qb-makers-header-redesign">
          <h2>Meet Your Makers</h2>
          <p>Discover the local artisans, farmers, and small businesses powering your neighborhood.</p>
        </div>
        <div className="qb-makers-grid-redesign">
          <article className="qb-maker-card-redesign">
            <img src={MOCK_IMAGES.baker} alt="Baker" className="qb-maker-card-img" />
            <div className="qb-maker-card-content">
              <img src={MOCK_IMAGES.baker} alt="Baker Avatar" className="qb-maker-avatar" />
              <h3>The Crusty Loaf</h3>
              <span>Artisanal Bakery</span>
              <p>Baking fresh, naturally leavened breads every morning using locally sourced...</p>
            </div>
          </article>

          <article className="qb-maker-card-redesign">
            <img src={MOCK_IMAGES.farm} alt="Farm" className="qb-maker-card-img" />
            <div className="qb-maker-card-content">
              <h3>Green Valley Urban Farm</h3>
              <span style={{ color: '#6366f1' }}>Hydroponic Greens & Produce</span>
              <p>Pioneering sustainable urban agriculture. We deliver pesticide-free, nutrient-dense greens harvested within hours of delivery.</p>
              <div className="qb-maker-tags">
                <span className="qb-maker-tag">Organic</span>
                <span className="qb-maker-tag">Hyper-local</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Footer */}
      <footer className="qb-footer-redesign">
        <div className="qb-footer-grid">
          <div className="qb-footer-brand">
            <h4>QuickBazaar</h4>
            <p>Your neighborhood's finest goods, <br /> delivered with care.</p>
          </div>
          <div className="qb-footer-col">
            <h5>About</h5>
            <a href="#0">About Us</a>
            <a href="#0">Merchant Info</a>
          </div>
          <div className="qb-footer-col">
            <h5>Policy</h5>
            <a href="#0">Privacy Policy</a>
            <a href="#0">Terms of Service</a>
          </div>
          <div className="qb-footer-col">
            <h5>Contact</h5>
            <a href="#0">Support</a>
            <a href="#0">Contact</a>
          </div>
        </div>
        <div className="qb-footer-bottom">
          © 2024 QuickBazaar Local Marketplace. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Home;
