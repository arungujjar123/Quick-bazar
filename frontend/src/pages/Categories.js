import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import "./CategoriesRedesign.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function Categories() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search).get("q") || "";
  const [search, setSearch] = useState(queryParam);

  const getPlaceholderImage = (label) => {
    const safeLabel = (label || "Category").toString().trim().slice(0, 16);
    const text = safeLabel.length > 0 ? safeLabel : "Category";
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">' +
      '<rect width="100%" height="100%" fill="#f1f5f9"/>' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-family="Inter, Arial" font-size="28">' +
      text +
      "</text></svg>";
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  const getProductImage = (product) => {
    const image = product?.imageUrl || product?.image;
    if (image && image.trim()) return image;
    return getPlaceholderImage(product?.name || product?.category);
  };

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products`);
        setProducts(response.data || []);
      } catch (error) {
        console.error("Failed to fetch categories page data:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categoryCards = useMemo(() => {
    const map = new Map();

    products.forEach((product) => {
      const name = (product.category || "General").trim();
      const key = name.toLowerCase();
      const current = map.get(key);

      if (!current) {
        map.set(key, {
          key,
          name,
          count: 1,
          sample: product,
          topProducts: [product],
        });
      } else {
        current.count += 1;
        if (current.topProducts.length < 3) {
          current.topProducts.push(product);
        }
      }
    });

    const cards = Array.from(map.values()).sort((a, b) => b.count - a.count);

    if (!search.trim()) return cards;

    return cards.filter((card) =>
      card.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [products, search]);

  if (loading) {
    return (
      <div className="qb-categories-page">
        <div className="qb-loading-state">
          <div className="qb-loading-spinner" />
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="qb-categories-page">
      {/* Hero / Header */}
      <section className="qb-categories-hero">
        <div className="qb-categories-hero-text">
          <span className="qb-categories-label">Curated Collections</span>
          <h1>
            Browse by <span>Category</span>
          </h1>
          <p>
            Explore local makers through categorized products — find what you
            love and add it to your cart.
          </p>
        </div>
        <div className="qb-categories-search-wrap">
          <svg className="qb-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* Stats Bar */}
      <div className="qb-categories-stats">
        <div className="qb-stat-item">
          <strong>{categoryCards.length}</strong>
          <span>Categories</span>
        </div>
        <div className="qb-stat-item">
          <strong>{products.length}</strong>
          <span>Products</span>
        </div>
        <div className="qb-stat-item">
          <strong>{new Set(products.map(p => p.shop?.name).filter(Boolean)).size || "—"}</strong>
          <span>Makers</span>
        </div>
      </div>

      {/* Category Grid */}
      {categoryCards.length === 0 ? (
        <div className="qb-empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3>No categories found</h3>
          <p>Try a different search keyword.</p>
        </div>
      ) : (
        <section className="qb-categories-grid">
          {categoryCards.map((card) => (
            <article key={card.key} className="qb-category-card-page">
              <header>
                <div className="qb-category-thumb">
                  <img
                    src={getProductImage(card.sample)}
                    alt={card.name}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = getPlaceholderImage(card.name);
                    }}
                  />
                </div>
                <div className="qb-category-info">
                  <h2>{card.name}</h2>
                  <p>{card.count} {card.count === 1 ? "product" : "products"}</p>
                </div>
              </header>

              <div className="qb-category-products-mini">
                {card.topProducts.map((item) => (
                  <Link key={item._id} to={`/product/${item._id}`}>
                    <span>{item.name}</span>
                    <strong>₹{Number(item.price || 0).toFixed(2)}</strong>
                  </Link>
                ))}
              </div>

              <Link
                to={`/?view=shop`}
                className="qb-category-view-all"
              >
                View All →
              </Link>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default Categories;
