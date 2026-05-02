import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [shopInfo, setShopInfo] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const getPlaceholderImage = (label) => {
    const safeLabel = (label || "Product").toString().trim().slice(0, 18);
    const text = safeLabel.length > 0 ? safeLabel : "Product";
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720">' +
      '<defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#efe6dd"/><stop offset="100%" stop-color="#e4d0bf"/></linearGradient></defs>' +
      '<rect width="100%" height="100%" fill="url(#g)"/>' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#7f5f4b" font-family="Arial" font-size="42">' +
      text +
      "</text></svg>";

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/products/${id}`)
      .then(async (res) => {
        const productData = res.data;
        setProduct(productData);

        const primaryImage =
          productData.imageUrl || productData.image || getPlaceholderImage(productData.name);
        setSelectedImage(primaryImage);

        if (productData.shop) {
          try {
            const shopRes = await axios.get(
              `${API_BASE_URL}/api/shops/${productData.shop}`,
            );
            setShopInfo(shopRes.data);
          } catch {
            setShopInfo(null);
          }
        }

        setLoading(false);

        // Track product view for personalization
        window.dispatchEvent(
          new CustomEvent("qb-track", {
            detail: {
              action: "view_product",
              productId: productData._id,
              category: productData.category || "",
            },
          }),
        );
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
        setLoading(false);
      });
  }, [id]);

  const stockLeft = Number(product?.stock || 0);

  const galleryImages = useMemo(() => {
    if (!product) return [];

    const primary =
      product.imageUrl || product.image || getPlaceholderImage(product.name);
    const list = [
      primary,
      getPlaceholderImage(`${product.category || "Artisan"} Craft`),
      getPlaceholderImage(`${product.name} Jar`),
      getPlaceholderImage("Maker Story"),
    ];

    return list;
  }, [product]);

  const reviewCount = useMemo(() => {
    if (!product?._id) return 124;
    return 80 + product._id.charCodeAt(2);
  }, [product]);

  const makerName = shopInfo?.name || "Local Artisan Collective";
  const makerMeta = shopInfo?.city || "Neighborhood Partner";

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (stockLeft > 0 && quantity > stockLeft) {
      setMessage(`Only ${stockLeft} items available in stock.`);
      setTimeout(() => setMessage(""), 2500);
      return;
    }

    setAddingToCart(true);
    const result = await addToCart(id, quantity);

    if (result.requiresLogin) {
      // Token expired, redirect to login
      navigate("/login");
      return;
    }

    setMessage(result.message);
    setTimeout(() => setMessage(""), 3000);
    setAddingToCart(false);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Product not found</h3>
          <p>The product you're looking for doesn't exist.</p>
          <button onClick={() => navigate("/")} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="qb-product-page fade-in">
      <div className="qb-product-shell">
        <div className="qb-product-breadcrumbs">
          <button onClick={() => navigate("/")} type="button">
            Shop
          </button>
          <span>›</span>
          <span>{product.category || "Pantry"}</span>
          <span>›</span>
          <strong>{product.name}</strong>
        </div>

      {message && (
        <div
          className={
            message.toLowerCase().includes("success") ||
            message.toLowerCase().includes("added")
              ? "success-message"
              : "error-message"
          }
        >
          {message}
        </div>
      )}

        <section className="qb-product-top">
          <div className="qb-product-gallery">
            <div className="qb-product-main-image-wrap">
              <img
                src={selectedImage}
                alt={product.name}
                className="qb-product-main-image"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = getPlaceholderImage(product.name);
                }}
              />
            </div>

            <div className="qb-product-thumbs">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={`qb-thumb ${selectedImage === image ? "active" : ""}`}
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image}
                    alt={`${product.name} preview ${index + 1}`}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = getPlaceholderImage(product.name);
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="qb-product-summary">
            <p className="qb-product-maker-tag">{makerName}</p>
            <h1>{product.name}</h1>

            <div className="qb-product-rating">
              <span>★★★★★</span>
              <small>({reviewCount} reviews)</small>
            </div>

            <div className="qb-product-price-card">
              <strong>${Number(product.price || 0).toFixed(2)}</strong>
              <p>
                {stockLeft > 0
                  ? `In Stock - ${stockLeft} left`
                  : "Out of stock"}
              </p>
            </div>

            <p className="qb-product-copy">
              {product.description ||
                "Harvested and curated by local makers with craftsmanship, freshness, and quality at the center of every order."}
            </p>

            <div className="qb-product-actions">
              <div className="qb-qty-control" aria-label="Quantity selector">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={addingToCart}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((prev) =>
                      stockLeft > 0 ? Math.min(stockLeft, prev + 1) : prev + 1,
                    )
                  }
                  disabled={addingToCart || stockLeft === 0}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="qb-add-btn"
                disabled={addingToCart || stockLeft === 0}
              >
                {addingToCart
                  ? "Adding..."
                  : stockLeft > 0
                    ? "Add to Cart"
                    : "Unavailable"}
              </button>
            </div>

            <div className="qb-product-meta">
              <span>Free Delivery</span>
              <span>Eco-Packaging</span>
            </div>
          </div>
        </section>

        <section className="qb-maker-story">
          <div className="qb-maker-story-text">
            <small>Meet the Artisan</small>
            <h2>About the Maker: {makerName}</h2>
            <p>
              {makerName} is a trusted community producer based in {makerMeta}.
              Every batch is prepared with care and quality checks to ensure
              each order reaches you exactly as intended.
            </p>
            <div className="qb-maker-stats">
              <div>
                <strong>25+</strong>
                <span>Years Experience</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>Quality Certified</span>
              </div>
              <button type="button" onClick={() => navigate("/")}>View Story</button>
            </div>
          </div>

          <div className="qb-maker-story-image-wrap">
            <img
              src={galleryImages[3] || getPlaceholderImage("Maker Story")}
              alt="Maker story"
            />
            <span className="qb-maker-badge">Rated Best Local Choice</span>
          </div>
        </section>

        <section className="qb-product-benefits">
          <h3>Why You'll Love It</h3>
          <div className="qb-benefit-grid">
            <article>
              <h4>Unfiltered Goodness</h4>
              <p>Retains natural flavors and the authentic artisan finish.</p>
            </article>
            <article>
              <h4>Eco-Conscious</h4>
              <p>Packed responsibly with recyclable materials and low waste.</p>
            </article>
            <article>
              <h4>Small-Batch Crafted</h4>
              <p>Produced in limited runs for freshness and quality control.</p>
            </article>
          </div>
        </section>

        <div className="qb-product-footer-actions">
          <button onClick={() => navigate("/")} className="btn btn-outline" type="button">
            Continue Shopping
          </button>
          <button onClick={() => navigate("/cart")} className="btn btn-primary" type="button">
            View Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
// This page shows detailed product information with improved UX and error handling.
