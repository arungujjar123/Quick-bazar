import React, { useState, useEffect } from "react";

function PromoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Promotional slides data
  const promoSlides = [
    {
      id: 1,
      title: "Today's Highlights",
      subtitle: "Top Picks You Will Love",
      description: "Fresh arrivals, smart deals, and fast delivery",
      background: "linear-gradient(135deg, #f4a261 0%, #e76f51 100%)",
      emoji: "",
    },
    {
      id: 2,
      title: "Seasonal Offer",
      subtitle: "20% OFF on Best Sellers",
      description: "Celebrate the festival of lights with amazing discounts",
      background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
      emoji: "",
    },
    {
      id: 3,
      title: "Free Shipping",
      subtitle: "On Orders Above $50",
      description: "Get your favorite products delivered for free",
      background: "linear-gradient(135deg, #f7b267 0%, #f79d65 100%)",
      emoji: "",
    },
    {
      id: 4,
      title: "New Arrivals",
      subtitle: "Latest Tech & Gadgets",
      description: "Check out our newest collection of premium products",
      background: "linear-gradient(135deg, #e9c46a 0%, #f4a261 100%)",
      emoji: "",
    },
    {
      id: 5,
      title: "Customer Reviews",
      subtitle: "4.8/5 Rating from 1000+ Customers",
      description: "Join thousands of satisfied customers worldwide",
      background: "linear-gradient(135deg, #e76f51 0%, #f4a261 100%)",
      emoji: "",
    },
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === promoSlides.length - 1 ? 0 : prevIndex + 1,
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [promoSlides.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(
      currentIndex === 0 ? promoSlides.length - 1 : currentIndex - 1,
    );
  };

  const goToNext = () => {
    setCurrentIndex(
      currentIndex === promoSlides.length - 1 ? 0 : currentIndex + 1,
    );
  };

  const currentSlide = promoSlides[currentIndex];

  return (
    <div className="promo-carousel-container">
      <div className="promo-carousel-wrapper">
        {/* Main Promo Slide */}
        <div
          className="promo-slide"
          style={{ background: currentSlide.background }}
        >
          <button className="promo-btn promo-btn-prev" onClick={goToPrevious}>
            ❮
          </button>

          <div className="promo-content">
            {currentSlide.emoji && (
              <div className="promo-emoji">{currentSlide.emoji}</div>
            )}
            <h1 className="promo-title">{currentSlide.title}</h1>
            <h2 className="promo-subtitle">{currentSlide.subtitle}</h2>
            <p className="promo-description">{currentSlide.description}</p>

            {currentSlide.id === 2 && (
              <div className="promo-offer-code">
                <span>
                  Use Code: <strong>DIWALI20</strong>
                </span>
              </div>
            )}
          </div>

          <button className="promo-btn promo-btn-next" onClick={goToNext}>
            ❯
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="promo-dots">
          {promoSlides.map((_, index) => (
            <button
              key={index}
              className={`promo-dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="promo-progress">
          <div
            className="promo-progress-bar"
            key={currentIndex} // Reset animation on slide change
          />
        </div>
      </div>
    </div>
  );
}

export default PromoCarousel;
