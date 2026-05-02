import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function ProductCarousel({ products }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const getPlaceholderImage = (label) => {
    const safeLabel = (label || "Product").toString().trim().slice(0, 16);
    const text = safeLabel.length > 0 ? safeLabel : "Product";
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">' +
      '<rect width="100%" height="100%" fill="#f3e7de"/>' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#8b6f5a" font-family="Arial" font-size="28">' +
      text +
      "</text></svg>";
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  const getProductImage = (product) => {
    const image = product?.imageUrl || product?.image;
    if (image && image.trim()) {
      return image;
    }
    return getPlaceholderImage(product?.name || product?.category);
  };

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying || products.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === products.length - 1 ? 0 : prevIndex + 1,
      );
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying, products.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000); // Resume auto-play after 8 seconds
  };

  const goToPrevious = () => {
    setCurrentIndex(
      currentIndex === 0 ? products.length - 1 : currentIndex - 1,
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const goToNext = () => {
    setCurrentIndex(
      currentIndex === products.length - 1 ? 0 : currentIndex + 1,
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  if (!products || products.length === 0) {
    return (
      <div className="carousel-container">
        <div className="carousel-header">
          <h2>🔥 Featured Products</h2>
          <p>Loading amazing products...</p>
        </div>
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "#666",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            margin: "1rem 0",
          }}
        >
          <p>No featured products available at the moment.</p>
          <p>Check back later for amazing deals!</p>
        </div>
      </div>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <div className="carousel-container">
      <div className="carousel-header">
        <h2>🔥 Featured Products</h2>
        <p>Discover products from different categories</p>
      </div>

      <div className="carousel-wrapper">
        {/* Main Carousel */}
        <div className="carousel-main">
          <button
            className="carousel-btn carousel-btn-prev"
            onClick={goToPrevious}
          >
            ❮
          </button>

          <div className="carousel-content">
            <Link
              to={`/product/${currentProduct._id}`}
              className="carousel-product-link"
            >
              <div className="carousel-image-container">
                <img
                  src={getProductImage(currentProduct)}
                  alt={currentProduct.name}
                  className="carousel-image"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getPlaceholderImage(
                      currentProduct?.name || currentProduct?.category,
                    );
                  }}
                />
                <div
                  className="carousel-image-fallback"
                  style={{ display: "none" }}
                >
                  📱
                </div>
                <div className="carousel-overlay">
                  <span>View Details →</span>
                </div>
              </div>
              <div className="carousel-info">
                <h3>{currentProduct.name}</h3>
                <p>{currentProduct.description}</p>
                {currentProduct.category && (
                  <div
                    className="carousel-category"
                    style={{
                      background: "rgba(231, 111, 81, 0.12)",
                      color: "var(--accent-3)",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      marginBottom: "8px",
                      display: "inline-block",
                    }}
                  >
                    {currentProduct.category}
                  </div>
                )}
                <div className="carousel-price">${currentProduct.price}</div>
              </div>
            </Link>
          </div>

          <button className="carousel-btn carousel-btn-next" onClick={goToNext}>
            ❯
          </button>
        </div>

        {/* Thumbnail Navigation */}
        <div className="carousel-thumbnails">
          {products.map((product, index) => (
            <div
              key={product._id}
              className={`carousel-thumbnail ${
                index === currentIndex ? "active" : ""
              }`}
              onClick={() => goToSlide(index)}
            >
              <img
                src={getProductImage(product)}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getPlaceholderImage(
                    product?.name || product?.category,
                  );
                }}
              />
              <div className="thumbnail-fallback" style={{ display: "none" }}>
                📱
              </div>
            </div>
          ))}
        </div>

        {/* Dots Indicator */}
        <div className="carousel-dots">
          {products.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${
                index === currentIndex ? "active" : ""
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>

        {/* Progress Bar */}
        {isAutoPlaying && (
          <div className="carousel-progress">
            <div
              className="carousel-progress-bar"
              key={currentIndex} // Reset animation on slide change
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCarousel;
