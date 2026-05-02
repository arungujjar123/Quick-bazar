import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function Categories() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const getPlaceholderImage = (label) => {
    const safeLabel = (label || "Category").toString().trim().slice(0, 16);
    const text = safeLabel.length > 0 ? safeLabel : "Category";
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">' +
      '<rect width="100%" height="100%" fill="#ece4db"/>' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#7e6654" font-family="Arial" font-size="28">' +
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
        if (current.topProducts.length < 4) {
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
      <div className="container">
        <div className="loading">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="qb-categories-page">
      <section className="qb-categories-hero">
        <div>
          <small>Curated Collections</small>
          <h1>
            Browse by <span>Category</span>
          </h1>
          <p>
            Explore local makers through categorized products, then jump into
            details to add items to your cart.
          </p>
        </div>
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      {categoryCards.length === 0 ? (
        <div className="empty-state">
          <h3>No categories found</h3>
          <p>Try another search keyword.</p>
        </div>
      ) : (
        <section className="qb-categories-grid">
          {categoryCards.map((card) => (
            <article key={card.key} className="qb-category-card-page">
              <header>
                <img
                  src={getProductImage(card.sample)}
                  alt={card.name}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = getPlaceholderImage(card.name);
                  }}
                />
                <div>
                  <h2>{card.name}</h2>
                  <p>{card.count} products</p>
                </div>
              </header>

              <div className="qb-category-products-mini">
                {card.topProducts.map((item) => (
                  <Link key={item._id} to={`/product/${item._id}`}>
                    <span>{item.name}</span>
                    <strong>${Number(item.price || 0).toFixed(2)}</strong>
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default Categories;
